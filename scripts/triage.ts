/**
 * Daily test triage: Playwright results.json -> clustered failures -> Taiga tasks.
 *
 * Usage:
 *   npx tsx triage.ts \
 *     --results playwright-report/results.json \
 *     --state .triage/state.json \
 *     --report-url "https://<bucket>.s3.amazonaws.com/reports/${RUN_ID}/index.html"
 *
 * Env vars:
 *   TAIGA_URL        e.g. https://taiga.yourcompany.com
 *   TAIGA_USERNAME
 *   TAIGA_PASSWORD
 *   TAIGA_PROJECT    project slug, e.g. "penpot-qa"
 *   DRY_RUN=1        parse + cluster + digest only, no Taiga calls
 *
 * Node 18+, no dependencies (uses global fetch).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

// ---------- CLI ----------

function arg(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  console.error(`Missing --${name}`);
  process.exit(1);
}

/** Collects every occurrence of a repeatable flag, e.g. --close-ref 1 --close-ref 2. */
function argAll(name: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === `--${name}` && process.argv[i + 1])
      out.push(process.argv[i + 1]);
  }
  return out;
}

const RESULTS_PATH = arg('results', 'playwright-report/results.json');
const STATE_PATH = arg('state', '.triage/state.json');
const REPORT_URL = arg('report-url', '');
const RELEASE = arg('release', ''); // e.g. "2.17" -> single story tagged release-2.17 with one task per cluster
const GROUP_BY = arg('group-by', 'cluster'); // release-mode tasks: 'cluster' (one per root cause) or 'file' (one per spec file)
const EPIC_REF = arg('epic-ref', ''); // optional: Taiga epic ref (#number) to link created stories under
const APP_VERSION = arg('app-version', ''); // optional: deployed app version this report ran against
// Debug: which run's results.json this triage was executed over. Falls back to parsing it out of
// REPORT_URL (every report URL this repo builds embeds it as /run-<id>/) so old callers that only
// pass --report-url still get it for free.
const RUN_ID = arg('run-id', '') || REPORT_URL.match(/run-(\d+)/)?.[1] || '';
const DRY_RUN = process.env.DRY_RUN === '1';

// --close-ref: bypass the whole parse/cluster/create pipeline and force-close specific Taiga task
// ids directly. Escape hatch for tasks orphaned before per-file/per-test tracking existed, or any
// one-off manual close.
const CLOSE_REFS = argAll('close-ref');
const CLOSE_COMMENT = arg(
  'close-comment',
  'Manually closed via triage --close-ref: error no longer occurring.',
);

// --close-only: run the resolved-detection + auto-close steps only — no new stories/tasks are
// created, no "new clusters" Mattermost post. Lets a backlog of resolved tasks be swept and closed
// on demand without needing to run (and file) a full triage.
const CLOSE_ONLY = process.argv.includes('--close-only');

// ---------- Types ----------

interface Failure {
  testId: string; // file :: full title
  file: string;
  title: string;
  qaseId?: string; // Qase case id, from annotations or title
  error: string; // raw first error message
  snippet: string; // first stack frame or code frame line
  retries: number;
  flaky: boolean; // failed then passed on retry
}

interface Cluster {
  fingerprint: string;
  errorSample: string;
  files: Set<string>;
  tests: Failure[];
}

interface StateEntry {
  taigaRef?: number; // Taiga story ref (release story in release mode)
  taigaId?: number; // Taiga story id
  taskRef?: number; // this cluster's own task ref (release cluster mode)
  taskId?: number; // this cluster's own task id
  taskIds?: number[]; // daily mode: one task per test inside the cluster's story — every one of them, so auto-close can close them all
  taskRefs?: number[]; // same order as taskIds, for building digest/Mattermost links
  subject?: string; // task subject, kept so resolved/known lines stay meaningful
  firstSeen: string;
  lastSeen: string;
  consecutiveRuns: number;
  seenInLastNRuns: number[]; // 1 = failed, 0 = passed, most recent first (flakiness window)
}

type State = Record<string, StateEntry>;

// ---------- Parse Playwright JSON ----------

function walkSuites(suite: any, file: string, out: Failure[]) {
  const f = suite.file ?? file;
  for (const child of suite.suites ?? []) walkSuites(child, f, out);
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const results = test.results ?? [];
      const last = results[results.length - 1];
      if (!last) continue;

      const everFailed = results.some(
        (r: any) => r.status === 'failed' || r.status === 'timedOut',
      );
      const finallyPassed = last.status === 'passed';
      const isFailure = test.status === 'unexpected';
      const isFlaky = test.status === 'flaky' || (everFailed && finallyPassed);

      if (!isFailure && !isFlaky) continue;

      const err = results.flatMap((r: any) => r.errors ?? [])[0] ?? last.error ?? {};
      const message: string = stripAnsi(err.message ?? 'Unknown error');
      const stack: string = stripAnsi(err.stack ?? '');
      const frame = firstOwnFrame(stack, f);

      out.push({
        testId: `${f} :: ${spec.title}`,
        file: f,
        title: spec.title,
        qaseId: extractQaseId(spec.title, test.annotations ?? []),
        error: message.split('\n').slice(0, 14).join('\n'),
        snippet: frame,
        retries: results.length - 1,
        flaky: isFlaky && !isFailure,
      });
    }
  }
}

/**
 * Qase links live either in annotations ({type:'QaseID', description:'123'},
 * added by qase() / playwright-qase-reporter) or in the title itself
 * ("... (Qase ID: 123)" suffix, or a "PROJ-123:" prefix convention).
 */
function extractQaseId(
  title: string,
  annotations: Array<{ type?: string; description?: string }>,
): string | undefined {
  const ann = annotations.find((a) => /qase/i.test(a?.type ?? ''));
  if (ann?.description) return String(ann.description).replace(/\s+/g, '');
  // qase([1234, 1235], 'title') renders as "... (Qase ID: 1234,1235)" — capture
  // the whole comma-separated list, not just the first id ([\w-]+ used to stop at
  // the comma and silently drop every id after the first).
  const m =
    title.match(/\(\s*Qase(?:\s*ID)?\s*[:=]?\s*([\w,\s-]+?)\s*\)/i) ??
    title.match(/^([A-Z][A-Z0-9]+-\d+)\s*[:.]/);
  return m?.[1]?.replace(/\s+/g, '');
}

function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\u001b\[[0-9;]*m/g, '');
}

function firstOwnFrame(stack: string, file: string): string {
  const lines = stack.split('\n').map((l: string) => l.trim());
  return (
    lines.find(
      (l: string) => l.startsWith('at ') && l.includes(path.basename(file)),
    ) ??
    lines.find((l: string) => l.startsWith('at ') && !l.includes('node_modules')) ??
    ''
  );
}

// ---------- Fingerprinting ----------

/**
 * Normalize away everything dynamic so that "the same root cause" hashes
 * to the same fingerprint across runs and across similar tests.
 */
function normalizeError(msg: string): string {
  return msg
    .replace(/\d+ms/g, 'Nms') // timeouts
    .replace(/\b\d{4}-\d{2}-\d{2}[T ][\d:.Z+-]+\b/g, '<ts>') // ISO timestamps
    .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, '<uuid>')
    .replace(/\b[0-9a-f]{7,40}\b/gi, '<hex>')
    .replace(/:\d+:\d+/g, ':L:C') // line:col
    .replace(/localhost:\d+|127\.0\.0\.1:\d+/g, '<host>')
    .replace(/\b\d+\b/g, 'N') // remaining numbers
    .replace(/(["'`]).*?\1/g, '<str>') // quoted dynamic values
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400);
}

/** Visual-comparison failures are debugged per spec file; their messages carry little identity. */
function isSnapshotError(msg: string): boolean {
  return /toHaveScreenshot|toMatchSnapshot|Screenshot comparison failed|snapshot/i.test(
    msg,
  );
}

function fingerprint(fail: Failure): string {
  // Hybrid clustering:
  // - snapshot/visual errors: per spec file, full stop. The error message carries
  //   the snapshot name and diff stats, which vary per screenshot — including any
  //   of it in the basis would split one file's diffs into many clusters/tasks, so
  //   the error text is deliberately NOT part of the basis here.
  // - functional errors: cross-file, keyed by error shape + locator. The locator's
  //   quoted text ('Select' vs 'Cancel subscription') IS the identity, so it is kept
  //   verbatim — only dynamic fragments (hex ids, numbers) inside it are neutralized.
  const basis = isSnapshotError(fail.error)
    ? `snapshot|${fail.file}`
    : `${normalizeError(fail.error)}|${locatorKey(fail.error)}`;
  return crypto.createHash('sha1').update(basis).digest('hex').slice(0, 12);
}

/** Locator with dynamic fragments neutralized but quoted text preserved. */
function locatorKey(msg: string): string {
  const m = msg.match(/(?:Locator:|waiting for)\s+(.+)/);
  if (!m) return '';
  return m[1]
    .trim()
    .replace(/\b[0-9a-f]{6,40}\b/gi, '<hex>')
    .replace(/\b\d+\b/g, 'N')
    .slice(0, 200);
}

// ---------- Clustering ----------

function cluster(failures: Failure[]): Map<string, Cluster> {
  const map = new Map<string, Cluster>();
  for (const f of failures) {
    const fp = fingerprint(f);
    const c = map.get(fp) ?? {
      fingerprint: fp,
      errorSample: f.error,
      files: new Set(),
      tests: [],
    };
    c.files.add(f.file);
    c.tests.push(f);
    map.set(fp, c);
  }
  return map;
}

// ---------- Taiga client ----------

class Taiga {
  private token = '';
  private projectId = 0;
  constructor(private base: string) {}

  async login(username: string, password: string, projectSlug: string) {
    const r = await this.post(
      '/api/v1/auth',
      { type: 'normal', username, password },
      false,
    );
    this.token = r.auth_token;
    const p = await this.get(`/api/v1/projects/by_slug?slug=${projectSlug}`);
    this.projectId = p.id;
  }

  async createUserStory(
    subject: string,
    description: string,
    tags: string[],
  ): Promise<{ id: number; ref: number }> {
    const r = await this.post('/api/v1/userstories', {
      project: this.projectId,
      subject,
      description,
      tags,
    });
    return { id: r.id, ref: r.ref };
  }

  async createTask(
    userStoryId: number,
    subject: string,
    description = '',
  ): Promise<{ id: number; ref: number }> {
    const r = await this.post('/api/v1/tasks', {
      project: this.projectId,
      user_story: userStoryId,
      subject,
      description,
    });
    return { id: r.id, ref: r.ref };
  }

  async commentStory(storyId: number, comment: string) {
    const story = await this.get(`/api/v1/userstories/${storyId}`);
    await this.patch(`/api/v1/userstories/${storyId}`, {
      version: story.version,
      comment,
    });
  }

  async epicIdByRef(ref: string): Promise<number> {
    const e = await this.get(
      `/api/v1/epics/by_ref?ref=${encodeURIComponent(ref)}&project=${this.projectId}`,
    );
    return e.id;
  }

  /** --close-ref takes the human-visible task ref (#1234); the rest of the API wants the internal id. */
  async taskIdByRef(ref: number): Promise<number> {
    const t = await this.get(
      `/api/v1/tasks/by_ref?ref=${ref}&project=${this.projectId}`,
    );
    return t.id;
  }

  async linkStoryToEpic(epicId: number, storyId: number) {
    // 400 here usually means "already linked" (re-runs) — tolerated.
    const r = await this.request(
      'POST',
      `/api/v1/epics/${epicId}/related_userstories`,
      { epic: epicId, user_story: storyId },
      true,
      true,
    );
    if (!r.ok && r.status !== 400)
      throw new Error(
        `Linking story to epic failed -> ${r.status} ${await r.text()}`,
      );
  }

  async userIdByUsername(username: string): Promise<number | null> {
    const users = (await this.get(
      `/api/v1/users?project=${this.projectId}`,
    )) as Array<{ id: number; username: string }>;
    return users.find((u) => u.username === username)?.id ?? null;
  }

  async taskStatusIdByName(name: string): Promise<number | null> {
    const statuses = (await this.get(
      `/api/v1/task-statuses?project=${this.projectId}`,
    )) as Array<{ id: number; name: string }>;
    return (
      statuses.find((s) => (s.name ?? '').toLowerCase() === name.toLowerCase())
        ?.id ?? null
    );
  }

  async closeTask(
    taskId: number,
    statusId: number,
    assigneeId: number | null,
    comment: string,
  ) {
    const task = await this.get(`/api/v1/tasks/${taskId}`);
    const body: Record<string, unknown> = {
      version: task.version,
      status: statusId,
      comment,
    };
    if (assigneeId) body.assigned_to = assigneeId;
    await this.patch(`/api/v1/tasks/${taskId}`, body);
  }

  /** null = could not determine (deleted task, API hiccup) */
  async taskStatus(
    taskId: number,
  ): Promise<{ isClosed: boolean; name: string } | null> {
    const r = await this.request(
      'GET',
      `/api/v1/tasks/${taskId}`,
      undefined,
      true,
      true,
    );
    if (!r.ok) return null;
    const task = await r.json();
    const info = task?.status_extra_info;
    if (!info) return null;
    return { isClosed: !!info.is_closed, name: info.name ?? '' };
  }

  async commentTask(taskId: number, comment: string) {
    const task = await this.get(`/api/v1/tasks/${taskId}`);
    await this.patch(`/api/v1/tasks/${taskId}`, { version: task.version, comment });
  }

  /** Verify a story still exists (someone may have deleted it in Taiga). */
  async storyExists(storyId: number): Promise<boolean> {
    const r = await this.request(
      'GET',
      `/api/v1/userstories/${storyId}`,
      undefined,
      true,
      true,
    );
    return r.ok;
  }

  private headers(auth = true): Record<string, string> {
    // User-Agent matters: api.taiga.io sits behind Cloudflare, which can 403
    // UA-less requests with an HTML block page.
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'qa-triage/1.0 (+github-actions)',
    };
    if (auth) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  /**
   * Fetch with retry on 429 (Taiga throttling) — waits and retries up to 3 times.
   * With allowFail, non-ok responses are returned instead of thrown (for existence checks).
   */
  private async request(
    method: string,
    p: string,
    body?: unknown,
    auth = true,
    allowFail = false,
  ): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      const r = await fetch(this.base + p, {
        method,
        headers: this.headers(auth),
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (r.status === 429 && attempt < 3) {
        const wait =
          Number(r.headers.get('Retry-After')) * 1000 || 2000 * (attempt + 1);
        console.log(`Taiga throttled (429), retrying in ${wait}ms...`);
        await new Promise((res) => setTimeout(res, wait));
        continue;
      }
      // Intermittent edge/WAF blocks (Cloudflare in front of api.taiga.io) return
      // an HTML 403 page. Retry a couple of times with a pause before giving up.
      if (r.status === 403 && attempt < 2) {
        const peek = await r.clone().text();
        if (
          peek.trimStart().toLowerCase().startsWith('<!doctype') ||
          peek.trimStart().startsWith('<html')
        ) {
          const wait = 5000 * (attempt + 1);
          console.log(
            `Taiga request blocked at the edge (HTML 403), retrying in ${wait}ms...`,
          );
          await new Promise((res) => setTimeout(res, wait));
          continue;
        }
      }
      if (!r.ok && !allowFail) {
        let body = await r.text();
        if (
          body.trimStart().toLowerCase().startsWith('<!doctype') ||
          body.trimStart().startsWith('<html')
        ) {
          body =
            '[HTML page instead of API JSON — request was blocked before reaching Taiga (WAF/edge) or the host is wrong. Check TAIGA_URL is https://api.taiga.io]';
        }
        throw new Error(`${method} ${p} -> ${r.status} ${body.slice(0, 500)}`);
      }
      return r;
    }
  }

  private async get(p: string) {
    return (await this.request('GET', p)).json();
  }
  private async post(p: string, body: unknown, auth = true) {
    return (await this.request('POST', p, body, auth)).json();
  }
  private async patch(p: string, body: unknown) {
    return (await this.request('PATCH', p, body)).json();
  }
}

// ---------- Main ----------

async function main() {
  // --close-ref: force-close specific task refs directly, bypassing results.json/state/clustering
  // entirely. Escape hatch for tasks this script has no other way to find (orphaned before the
  // per-file/per-test tracking below existed, or any other one-off manual close).
  if (CLOSE_REFS.length) {
    console.log(
      `[close-ref] Closing ${CLOSE_REFS.length} task(s) directly: ${CLOSE_REFS.join(', ')}`,
    );
    if (DRY_RUN) {
      console.log('[dry-run] Would close the above and exit — no Taiga calls made.');
      return;
    }
    const taiga = new Taiga(requiredEnv('TAIGA_URL'));
    await taiga.login(
      requiredEnv('TAIGA_USERNAME'),
      requiredEnv('TAIGA_PASSWORD'),
      requiredEnv('TAIGA_PROJECT'),
    );
    const assigneeName = process.env.TAIGA_CLOSE_ASSIGNEE || 'qa.integrations.bot';
    const statusName = process.env.TAIGA_CLOSED_STATUS || 'Closed';
    const statusId = await taiga.taskStatusIdByName(statusName);
    const assigneeId = await taiga.userIdByUsername(assigneeName);
    if (!statusId) {
      console.error(`Task status "${statusName}" not found in project — aborting.`);
      process.exit(1);
    }
    for (const refStr of CLOSE_REFS) {
      const ref = Number(refStr);
      try {
        const taskId = await taiga.taskIdByRef(ref);
        await taiga.closeTask(taskId, statusId, assigneeId, CLOSE_COMMENT);
        console.log(
          `Closed task #${ref}${assigneeId ? ` and assigned to ${assigneeName}` : ''}.`,
        );
      } catch (e) {
        console.error(
          `Could not close task #${ref}: ${e instanceof Error ? e.message : e}`,
        );
      }
    }
    return;
  }

  console.log(
    `[triage] results=${RESULTS_PATH} state=${STATE_PATH}${RELEASE ? ` release=${RELEASE} group-by=${GROUP_BY}` : ' mode=daily'}${RUN_ID ? ` run-id=${RUN_ID}` : ''}${APP_VERSION ? ` app-version=${APP_VERSION}` : ''}${CLOSE_ONLY ? ' close-only=1' : ''}${DRY_RUN ? ' dry-run=1' : ''}`,
  );

  const raw = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  const failures: Failure[] = [];
  for (const suite of raw.suites ?? [])
    walkSuites(suite, suite.file ?? '', failures);

  const hardFailures = failures.filter((f) => !f.flaky);
  const flakyTests = failures.filter((f) => f.flaky);
  const clusters = cluster(hardFailures);

  const state: State = fs.existsSync(STATE_PATH)
    ? JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
    : {};

  const today = new Date().toISOString().slice(0, 10);

  // ----- App version tracking -----
  const prevVersion = (state as any)['__app_version__'] as
    { version: string; date: string } | undefined;
  const versionChanged = !!(
    APP_VERSION &&
    prevVersion?.version &&
    prevVersion.version !== APP_VERSION
  );
  if (APP_VERSION && !DRY_RUN) {
    (state as any)['__app_version__'] = { version: APP_VERSION, date: today };
  }
  const versionLine = APP_VERSION
    ? `App version: **${APP_VERSION}**${versionChanged ? ` — changed from ${prevVersion!.version} (recorded ${prevVersion!.date})` : prevVersion ? ' (unchanged since last triage)' : ''}`
    : '';
  const changelog = versionChanged
    ? await fetchChangelog(prevVersion!.version, APP_VERSION)
    : null;
  const newClusters: Cluster[] = [];
  const knownClusters: Cluster[] = [];
  const resolved: string[] = [];

  for (const [fp, c] of clusters) {
    if (state[fp]) {
      knownClusters.push(c);
      state[fp].lastSeen = today;
      state[fp].consecutiveRuns = (state[fp].consecutiveRuns ?? 0) + 1;
      state[fp].seenInLastNRuns = [1, ...(state[fp].seenInLastNRuns ?? [])].slice(
        0,
        10,
      );
    } else {
      newClusters.push(c);
      state[fp] = {
        firstSeen: today,
        lastSeen: today,
        consecutiveRuns: 1,
        seenInLastNRuns: [1],
      };
    }
  }
  for (const fp of Object.keys(state)) {
    if (fp.startsWith('__') || fp.startsWith('file::')) continue; // internal bookkeeping / per-file tracking (below), not a cluster
    if (!clusters.has(fp)) {
      state[fp].seenInLastNRuns = [0, ...(state[fp].seenInLastNRuns ?? [])].slice(
        0,
        10,
      );
      state[fp].consecutiveRuns = 0;
      if (
        state[fp].seenInLastNRuns.slice(0, 1).every((x) => x === 0) &&
        state[fp].taigaRef
      ) {
        resolved.push(fp); // gone in the next run -> candidate for closing
      }
    }
  }

  // ----- Release + group-by=file: track each spec file's own task, independently of cluster
  // fingerprints. Non-snapshot clusters can span multiple files, and a file's failures can bounce
  // between fingerprints run to run, so "is this file still failing?" has to be asked directly —
  // otherwise (the bug this replaces) file tasks were never linked back into state at all, and
  // auto-close could never find them.
  const fileStateKey = (file: string) => `file::${file}`;
  if (RELEASE && GROUP_BY === 'file') {
    const failingFiles = new Set<string>();
    for (const c of clusters.values())
      for (const t of c.tests) failingFiles.add(t.file);

    for (const file of failingFiles) {
      const key = fileStateKey(file);
      if (state[key]) {
        state[key].lastSeen = today;
        state[key].consecutiveRuns = (state[key].consecutiveRuns ?? 0) + 1;
        state[key].seenInLastNRuns = [
          1,
          ...(state[key].seenInLastNRuns ?? []),
        ].slice(0, 10);
      } else {
        state[key] = {
          firstSeen: today,
          lastSeen: today,
          consecutiveRuns: 1,
          seenInLastNRuns: [1],
        };
      }
    }
    for (const key of Object.keys(state)) {
      if (!key.startsWith('file::')) continue;
      const file = key.slice('file::'.length);
      if (!failingFiles.has(file)) {
        state[key].seenInLastNRuns = [
          0,
          ...(state[key].seenInLastNRuns ?? []),
        ].slice(0, 10);
        state[key].consecutiveRuns = 0;
        if (
          state[key].seenInLastNRuns.slice(0, 1).every((x) => x === 0) &&
          state[key].taskId
        ) {
          resolved.push(key); // file has no failing tests in this run -> candidate for closing
        }
      }
    }
  }

  const acknowledged = new Map<string, string>(); // fingerprint -> 'triaged' (task closed per team convention)

  // Snapshot resolved entries now — closing may delete them from state below.
  const resolvedInfo = resolved.map((fp) => {
    // Every task tracked against this entry: the single taskId (release/cluster mode, file mode)
    // plus taskIds[] (daily mode's one-task-per-test/bundle). Deduplicated, order preserved.
    const ids = [state[fp].taskId, ...(state[fp].taskIds ?? [])].filter(
      (v): v is number => v != null,
    );
    const refs = [state[fp].taskRef, ...(state[fp].taskRefs ?? [])].filter(
      (v): v is number => v != null,
    );
    return {
      fp,
      taskIds: [...new Set(ids)],
      taskRefs: [...new Set(refs)],
      taskRef: state[fp].taskRef, // kept for the single-task-per-entry call sites (digest/mm links)
      taskId: state[fp].taskId,
      storyRef: state[fp].taigaRef,
      subject: state[fp].subject,
      closed: false,
    };
  });

  // Everything from here through auto-close mutates Taiga. Wrapped in try/finally so a mid-run
  // throw (a Taiga 500, a network blip) still saves whatever was already created/closed instead of
  // discarding it — otherwise the next run recreates those entities as duplicates.
  let taiga: Taiga | null = null;
  try {
    // ----- Taiga -----
    if (
      !DRY_RUN &&
      newClusters.length + knownClusters.length + resolved.length > 0
    ) {
      taiga = new Taiga(requiredEnv('TAIGA_URL'));
      await taiga.login(
        requiredEnv('TAIGA_USERNAME'),
        requiredEnv('TAIGA_PASSWORD'),
        requiredEnv('TAIGA_PROJECT'),
      );
    }

    const storyTags = (process.env.TAIGA_TAGS ?? 'daily,needs-triage')
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    // --close-only: sweep and close resolved tasks (below), but file nothing new — new/known
    // clusters stay untouched in state so a later normal run still files them.
    if (CLOSE_ONLY) {
      console.log(
        `[close-only] Skipping story/task creation — ${newClusters.length} new, ${knownClusters.length} known cluster(s) left untouched.`,
      );
    } else if (RELEASE) {
      // ----- Release mode: ONE user story for the whole release, one task per cluster -----
      const releaseTag = `release-${RELEASE}`.toLowerCase();
      const storyKey = '__release_story__';
      const storyState = (state as any)[storyKey] as StateEntry | undefined;

      let storyId = storyState?.taigaId;
      let storyRef = storyState?.taigaRef;

      // Someone may have deleted the story in Taiga since the last run — recreate if so.
      // Its tasks died with it, so known clusters need their tasks rebuilt too.
      let storyRecreated = false;
      if (taiga && storyId && !(await taiga.storyExists(storyId))) {
        console.log(
          `Stored release story ${storyId} no longer exists in Taiga — rebuilding story and tasks.`,
        );
        storyId = undefined;
        storyRef = undefined;
        storyRecreated = true;
        for (const key of Object.keys(state)) {
          if (key.startsWith('file::')) {
            delete state[key].taskId; // file tasks died with the story — rebuilt below
            delete state[key].taskRef;
          }
        }
      }

      if (taiga && !storyId) {
        const subject = `[release ${RELEASE}] Daily failures triage`;
        const description = [
          `Triage of daily test failures for release **${RELEASE}**.`,
          '',
          `Run date: ${today}`,
          RUN_ID ? `Run: ${RUN_ID}` : '',
          REPORT_URL ? `[HTML report](${REPORT_URL})` : '',
          '',
          'Each task below is one failure cluster (one root cause). Classify each as real bug or test to update.',
          ...(changelog
            ? [
                '',
                `**App changes since last triage (${changelog.total} commits, [compare](${changelog.compareUrl})):**`,
                ...changelog.lines,
              ]
            : []),
        ].join('\n');
        const { id, ref } = await taiga.createUserStory(subject, description, [
          ...storyTags,
          releaseTag,
        ]);
        storyId = id;
        storyRef = ref;
        (state as any)[storyKey] = {
          taigaId: id,
          taigaRef: ref,
          firstSeen: today,
          lastSeen: today,
          consecutiveRuns: 1,
          seenInLastNRuns: [1],
        };
        console.log(`Created release user story #${ref} [${releaseTag}]`);
        if (EPIC_REF) {
          await taiga.linkStoryToEpic(await taiga.epicIdByRef(EPIC_REF), id);
          console.log(`Linked story #${ref} under epic #${EPIC_REF}`);
        }
      } else if (!taiga) {
        console.log(
          `[dry-run] Would create/reuse release user story: [release ${RELEASE}] Daily failures triage [tags: ${[...storyTags, releaseTag].join(', ')}]${EPIC_REF ? ` under epic #${EPIC_REF}` : ''}`,
        );
      }

      if (GROUP_BY === 'file') {
        // One task per spec file, listing all its failing tests (from new clusters).
        const byFile = new Map<string, Failure[]>();
        for (const c of storyRecreated
          ? [...newClusters, ...knownClusters]
          : newClusters) {
          for (const t of c.tests) {
            byFile.set(t.file, [...(byFile.get(t.file) ?? []), t]);
          }
        }

        for (const [file, tests] of byFile) {
          const lines = tests.map(
            (t) =>
              `- \`${t.title}\`${t.qaseId ? ` (Qase: ${t.qaseId})` : ''}${t.retries ? ` — ${t.retries} retries` : ''}\n  \`\`\`\n  ${conciseError(t.error)}\n  \`\`\``,
          );
          const fileKey = fileStateKey(file);
          const fileEntry = state[fileKey]; // created above by the file-tracking block
          const subject = `${path.basename(file)} — ${tests.length} failing test${tests.length > 1 ? 's' : ''}`;
          if (taiga && storyId) {
            if (fileEntry?.taskId) {
              await taiga.commentTask(
                fileEntry.taskId,
                [`New failures on ${today}:`, ...lines].join('\n'),
              );
              if (fileEntry) fileEntry.subject = subject.slice(0, 120);
              console.log(
                `  ~ appended ${tests.length} test(s) to existing task for ${file}`,
              );
            } else {
              const { id, ref } = await taiga.createTask(
                storyId,
                subject,
                [
                  `**Spec file:** \`${file}\``,
                  '',
                  `**Failing tests (${tests.length}):**`,
                  ...lines,
                  '',
                  RUN_ID ? `Run: ${RUN_ID}` : '',
                  REPORT_URL ? `[HTML report](${REPORT_URL})` : '',
                ].join('\n'),
              );
              if (state[fileKey]) {
                state[fileKey].taskId = id;
                state[fileKey].taskRef = ref;
                state[fileKey].subject = subject.slice(0, 120);
                state[fileKey].taigaId = storyId;
                state[fileKey].taigaRef = storyRef;
              }
              console.log(`  + task #${ref}: ${subject}`);
            }
          } else {
            const qase = tests.map((t) => t.qaseId).filter(Boolean);
            console.log(
              `[dry-run]   + task: ${path.basename(file)} — ${tests.length} failing test(s)${qase.length ? ` [Qase: ${qase.join(', ')}]` : ''}`,
            );
          }
        }
        // Cluster fingerprints still track new/known/resolved against the release story.
        for (const c of newClusters) {
          state[c.fingerprint].taigaId = storyId;
          state[c.fingerprint].taigaRef = storyRef;
        }
      } else {
        const clustersNeedingTasks = storyRecreated
          ? [...newClusters, ...knownClusters]
          : newClusters;
        if (storyRecreated && knownClusters.length)
          console.log(
            `Rebuilding tasks for ${knownClusters.length} known cluster(s) in the new story.`,
          );
        for (const c of clustersNeedingTasks) {
          const taskSubject = `${conciseError(c.errorSample)} — ${[...c.files].map((f: string) => path.basename(f)).join(', ')} (${c.tests.length} test${c.tests.length > 1 ? 's' : ''})`;
          if (taiga && storyId) {
            const { id: taskId, ref: taskRef } = await taiga.createTask(
              storyId,
              taskSubject,
              clusterDescription(c),
            );
            state[c.fingerprint].taigaId = storyId;
            state[c.fingerprint].taigaRef = storyRef;
            state[c.fingerprint].taskId = taskId;
            state[c.fingerprint].taskRef = taskRef;
            state[c.fingerprint].subject = taskSubject.slice(0, 120);
            console.log(`  + task #${taskRef}: ${taskSubject}`);
          } else {
            console.log(`[dry-run]   + task: ${taskSubject}`);
          }
        }
      }
      if (taiga && storyId && knownClusters.length) {
        await taiga.commentStory(
          storyId,
          `Re-run on ${today}${RUN_ID ? ` (run ${RUN_ID})` : ''}: ${knownClusters.length} cluster(s) still failing, ${newClusters.length} new. Report: ${REPORT_URL}`,
        );
      }
      // Team convention: closing a task (with a result comment) = TRIAGED.
      // Known cluster + closed task -> acknowledged: reviewed, fix pending. No noise.
      // Known cluster + open task   -> still needs triage.
      if (taiga) {
        for (const c of knownClusters) {
          const e = state[c.fingerprint];
          if (!e?.taskId) continue;
          const st = await taiga.taskStatus(e.taskId);
          if (st?.isClosed) acknowledged.set(c.fingerprint, 'triaged');
        }
        if (acknowledged.size)
          console.log(
            `${acknowledged.size} known cluster(s) already triaged (task closed).`,
          );
      }

      if (taiga && storyId && changelog && !!storyState?.taigaId) {
        // story pre-existed and the app changed since -> post the changelog as a comment
        await taiga.commentStory(
          storyId,
          [
            `App changed: \`${prevVersion!.version}\` -> \`${APP_VERSION}\` (${changelog.total} commits, [compare](${changelog.compareUrl}))`,
            ...changelog.lines,
          ].join('\n'),
        );
      }
    } else {
      // ----- Daily mode: one user story per cluster. One task per test, EXCEPT snapshot
      // clusters (post-fingerprint-fix, a snapshot cluster = one spec file's worth of diffs,
      // which are debugged together) get a single bundled task instead of N per-test ones.
      for (const c of newClusters) {
        const subject = `[daily] ${conciseError(c.errorSample)} — ${[...c.files].map((f: string) => path.basename(f)).join(', ')} (${c.tests.length} test${c.tests.length > 1 ? 's' : ''})`;
        const description = clusterDescription(c);
        const snapshotCluster = isSnapshotError(c.errorSample);
        if (taiga) {
          const { id, ref } = await taiga.createUserStory(
            subject,
            description,
            storyTags,
          );
          state[c.fingerprint].taigaId = id;
          state[c.fingerprint].taigaRef = ref;
          console.log(
            `Created Taiga user story #${ref} for cluster ${c.fingerprint}`,
          );
          if (EPIC_REF)
            await taiga.linkStoryToEpic(await taiga.epicIdByRef(EPIC_REF), id);
          const taskIds: number[] = [];
          const taskRefs: number[] = [];
          if (snapshotCluster) {
            const { id: taskId, ref: taskRef } = await taiga.createTask(
              id,
              `${path.basename(c.tests[0].file)} — ${c.tests.length} screenshot diff${c.tests.length > 1 ? 's' : ''}`,
              clusterDescription(c),
            );
            taskIds.push(taskId);
            taskRefs.push(taskRef);
          } else {
            for (const t of c.tests) {
              const { id: taskId, ref: taskRef } = await taiga.createTask(
                id,
                `Review: ${t.title}`,
                [
                  `File: \`${t.file}\``,
                  t.qaseId ? `Qase: ${t.qaseId}` : '',
                  t.retries ? `Retries: ${t.retries}` : '',
                  '```',
                  t.error,
                  '```',
                ]
                  .filter(Boolean)
                  .join('\n'),
              );
              taskIds.push(taskId);
              taskRefs.push(taskRef);
            }
          }
          state[c.fingerprint].taskIds = taskIds; // so auto-close can find and close every one of them
          state[c.fingerprint].taskRefs = taskRefs;
          console.log(`  + ${taskIds.length} task(s) inside`);
        } else {
          console.log(
            `[dry-run] Would create user story: ${subject} [tags: ${storyTags.join(', ')}]`,
          );
          if (snapshotCluster) {
            console.log(
              `[dry-run]   + task: ${path.basename(c.tests[0].file)} — ${c.tests.length} screenshot diff(s)`,
            );
          } else {
            for (const t of c.tests)
              console.log(`[dry-run]   + task: Review: ${t.title}`);
          }
        }
      }

      for (const c of knownClusters) {
        const entry = state[c.fingerprint];
        if (taiga && entry.taigaId) {
          await taiga.commentStory(
            entry.taigaId,
            `Still failing on ${today}${RUN_ID ? ` (run ${RUN_ID})` : ''} (${c.tests.length} tests, ${entry.consecutiveRuns} consecutive runs). Report: ${REPORT_URL}`,
          );
        }
      }
    }

    // ----- Auto-close resolved tasks (error gone in the next triaged run) -----
    if (taiga && resolvedInfo.length) {
      const assigneeName = process.env.TAIGA_CLOSE_ASSIGNEE || 'qa.integrations.bot';
      const statusName = process.env.TAIGA_CLOSED_STATUS || 'Closed';
      let statusId: number | null = null;
      let assigneeId: number | null = null;
      try {
        statusId = await taiga.taskStatusIdByName(statusName);
        assigneeId = await taiga.userIdByUsername(assigneeName);
        if (!statusId)
          console.log(
            `Auto-close skipped: task status "${statusName}" not found in project`,
          );
        if (!assigneeId)
          console.log(
            `Auto-close: user "${assigneeName}" not found in project — closing without reassigning`,
          );
      } catch (e) {
        console.log(`Auto-close skipped: ${e instanceof Error ? e.message : e}`);
      }
      if (statusId) {
        for (const r of resolvedInfo) {
          if (!r.taskIds.length) continue; // no own task recorded (pre-upgrade state) -> stays a manual candidate
          let allOk = true;
          // A resolved entry can carry several tasks (daily mode: one per test, or a bundled
          // snapshot task) — close every one of them, not just the first.
          for (let i = 0; i < r.taskIds.length; i++) {
            const taskId = r.taskIds[i];
            const taskRef = r.taskRefs[i];
            try {
              const st = await taiga.taskStatus(taskId);
              if (st?.isClosed) {
                // already triaged & closed by a human — just record the verification
                await taiga.commentTask(
                  taskId,
                  `Verified by triage: not seen in the next triaged run (${today}).`,
                );
                console.log(
                  `Task #${taskRef ?? taskId} already closed (triaged) — added verification comment: ${r.subject ?? r.fp}`,
                );
              } else {
                await taiga.closeTask(
                  taskId,
                  statusId,
                  assigneeId,
                  `Auto-closed by triage: not seen in the next triaged run (${today}).`,
                );
                console.log(
                  `Closed task #${taskRef ?? taskId}${assigneeId ? ` and assigned to ${assigneeName}` : ''}: ${r.subject ?? r.fp}`,
                );
              }
            } catch (e) {
              allOk = false;
              console.log(
                `Could not close task #${taskRef ?? taskId}: ${e instanceof Error ? e.message : e}`,
              );
            }
          }
          if (allOk) {
            r.closed = true;
            delete state[r.fp]; // if it ever fails again it is a new cluster -> new task
          }
        }
      }
    }
  } finally {
    // Runs even if the Taiga section above threw partway through — saves every id already
    // created/closed so far instead of losing it.
    if (DRY_RUN) {
      console.log(
        '[dry-run] state NOT saved — dry runs leave no trace, so a later real run still sees these failures as new',
      );
    } else {
      fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
      fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
    }
  }

  // ----- Digest (markdown: stdout, job summary, and .triage/digest.md) -----
  const digest: string[] = [
    `## Triage${RELEASE ? ` — release ${RELEASE}` : ' — daily'}${CLOSE_ONLY ? ' (close-only sweep)' : ''} — ${today}`,
    '',
  ];
  digest.push(
    `**${hardFailures.length} failures** in **${clusters.size} clusters** · ${flakyTests.length} flaky · ${resolved.length} resolved`,
  );
  if (versionLine) digest.push(versionLine);
  if (changelog) {
    digest.push(
      `App changes since last triage: **${changelog.total} commits** — [compare](${changelog.compareUrl})`,
    );
  }
  if (RUN_ID) digest.push(`Run: \`${RUN_ID}\``);
  if (REPORT_URL) digest.push(`[Full HTML report](${REPORT_URL})`);
  if (CLOSE_ONLY)
    digest.push(
      '',
      `_--close-only sweep: nothing new was filed (${newClusters.length + knownClusters.length} cluster(s) left untouched for the next full triage)._`,
    );
  digest.push('');
  if (newClusters.length && !CLOSE_ONLY) {
    digest.push(`### New clusters (${newClusters.length})`);
    for (const c of newClusters) {
      const entry = state[c.fingerprint];
      digest.push(
        `- ${entry?.taigaRef || entry?.taskRef ? `${entryLink(entry)} — ` : ''}\`${conciseError(c.errorSample)}\` in ${[...c.files].join(', ')} (${c.tests.length} test${c.tests.length > 1 ? 's' : ''})${qaseList(c)}`,
      );
    }
    digest.push('');
  }
  if (knownClusters.length && !CLOSE_ONLY) {
    digest.push(`### known clusters still failing (${knownClusters.length})`);
    for (const c of knownClusters) {
      const e = state[c.fingerprint];
      const closedFlag = acknowledged.has(c.fingerprint)
        ? ' _(triaged)_'
        : ' — **needs triage**';
      digest.push(
        `- ${entryLink(e)}${closedFlag} — \`${conciseError(c.errorSample)}\` in ${[...c.files].join(', ')} (${c.tests.length} test${c.tests.length > 1 ? 's' : ''}, failing ${e.consecutiveRuns} runs in a row)${qaseList(c)}`,
      );
    }
    digest.push('');
  }
  if (resolvedInfo.length) {
    digest.push(`### resolved (gone next run)`);
    for (const r of resolvedInfo) {
      const link = r.taskRefs.length
        ? r.taskRefs.map((ref) => taigaTaskLink(ref)).join(', ')
        : taigaLink(r.storyRef);
      const label = r.subject ? ` — \`${r.subject}\`` : '';
      digest.push(
        `- ${link}${label}${r.closed ? ' → auto-closed & assigned' : r.taskIds.length ? ' → pending auto-close' : ' → close manually (no task recorded — run with --close-ref)'}`,
      );
    }
  }
  const digestText = digest.join('\n');
  console.log('\n' + digestText);
  fs.mkdirSync('.triage', { recursive: true });
  fs.writeFileSync('.triage/digest.md', digestText);

  // ----- Mattermost (compressed: verdict + new clusters + resolved; details live in Taiga) -----
  const releaseStoryRef = RELEASE
    ? ((state as any)['__release_story__'] as StateEntry | undefined)?.taigaRef
    : undefined;
  const mm: string[] = [];
  const verdict = `**:mag: Triage${RELEASE ? ` release ${RELEASE}` : ''}${CLOSE_ONLY ? ' (close-only sweep)' : ''}** — ${CLOSE_ONLY ? `${newClusters.length + knownClusters.length} cluster(s) left untouched` : `${newClusters.length} new · ${knownClusters.length} known${acknowledged.size ? ` (${acknowledged.size} triaged)` : ''}`} · ${resolved.length} resolved${releaseStoryRef ? ` · ${taigaLink(releaseStoryRef)}` : ''}${APP_VERSION ? `\napp \`${APP_VERSION}\`${versionChanged ? ` :warning: changed from \`${prevVersion!.version}\`${changelog ? ` ([${changelog.total} commits](${changelog.compareUrl}))` : ''}` : ''}` : ''}`;
  mm.push(verdict);
  if (newClusters.length && !CLOSE_ONLY) {
    mm.push('', '**New:**');
    for (const c of newClusters) {
      mm.push(
        `- \`${conciseError(c.errorSample)}\` — ${c.tests.length} test${c.tests.length > 1 ? 's' : ''}${qaseList(c)}`,
      );
    }
  }
  if (resolvedInfo.length) {
    const closed = resolvedInfo.filter((r) => r.closed);
    const manual = resolvedInfo.filter((r) => !r.closed);
    if (closed.length)
      mm.push(
        '',
        `**Auto-closed (gone next run):** ${closed.map((r) => r.taskRefs.map((ref) => taigaTaskLink(ref)).join(', ')).join(', ')}`,
      );
    if (manual.length)
      mm.push(
        '',
        `**Resolved — close manually:** ${manual.map((r) => (r.taskRefs.length ? r.taskRefs.map((ref) => taigaTaskLink(ref)).join(', ') : taigaLink(r.storyRef))).join(', ')}`,
      );
  }
  mm.push(
    '',
    `${hardFailures.length} failures · ${flakyTests.length} flaky${RUN_ID ? ` · run \`${RUN_ID}\`` : ''}${REPORT_URL ? ` · [HTML report](${REPORT_URL})` : ''}`,
  );
  const nothingChanged =
    newClusters.length === 0 && resolved.length === 0 && knownClusters.length > 0;
  const mmText = nothingChanged
    ? `**:mag: Triage${RELEASE ? ` release ${RELEASE}` : ''}** — re-run: nothing new, ${knownClusters.length} known cluster${knownClusters.length > 1 ? 's' : ''} still failing${acknowledged.size ? ` (${acknowledged.size} triaged)` : ''}.${releaseStoryRef ? ` ${taigaLink(releaseStoryRef)}` : ''}`
    : mm.join('\n');

  const mmWebhook = process.env.MATTERMOST_WEBHOOK_URL;
  if (mmWebhook && !DRY_RUN) {
    const r = await fetch(mmWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Daily Triage',
        icon_emoji: ':test_tube:',
        text: mmText,
      }),
    });
    if (!r.ok)
      console.error(`Mattermost post failed: ${r.status} ${await r.text()}`);
    else console.log('Digest posted to Mattermost');
  } else if (DRY_RUN) {
    console.log(
      '\n----- MATTERMOST PREVIEW -----\n' +
        mmText +
        '\n------------------------------',
    );
  }
}

function shortError(msg: string): string {
  return msg.split('\n')[0].slice(0, 90);
}

function qaseList(c: Cluster): string {
  const ids = c.tests.map((t) => t.qaseId).filter(Boolean);
  return ids.length ? ` [Qase: ${ids.join(', ')}]` : '';
}

/**
 * Playwright's first error line is generic ("expect(locator).toBeVisible() failed");
 * the concrete facts (which element, expected vs received) are on later lines.
 * Build a one-line summary that includes them.
 */
function conciseError(msg: string): string {
  const first = msg.split('\n')[0].slice(0, 90);
  const parts: string[] = [];
  const loc = msg.match(/(?:Locator:|waiting for)\s+(.+)/);
  if (loc) parts.push(`@ ${loc[1].trim().slice(0, 70)}`);
  const exp = msg.match(/Expected(?: string| pattern)?:\s+(.+)/);
  const rec = msg.match(/Received(?: string)?:\s+(.+)/);
  if (exp && rec)
    parts.push(
      `expected ${exp[1].trim().slice(0, 40)}, got ${rec[1].trim().slice(0, 40)}`,
    );
  else if (exp) parts.push(`expected ${exp[1].trim().slice(0, 40)}`);
  return parts.length ? `${first} — ${parts.join(' — ')}` : first;
}

// ---------- App changelog (public repo compare) ----------

/** Extract the commit hash from a git-describe style version: 2.17.0-RC3-18-g85dbf14344 -> 85dbf14344 */
function commitFromVersion(v?: string): string | undefined {
  return v?.match(/-g([0-9a-f]{7,40})$/i)?.[1];
}

interface Changelog {
  compareUrl: string;
  total: number;
  lines: string[];
}

/**
 * List commits between two deployed versions via the app repo's public compare API.
 * Never throws — changelog is enrichment, not a dependency.
 */
async function fetchChangelog(
  prevVersion: string,
  currVersion: string,
): Promise<Changelog | null> {
  const repo = process.env.APP_REPO || 'penpot/penpot';
  const oldSha = commitFromVersion(prevVersion);
  const newSha = commitFromVersion(currVersion);
  if (!oldSha || !newSha) return null;
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'qa-triage',
    };
    if (process.env.GITHUB_TOKEN)
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const r = await fetch(
      `https://api.github.com/repos/${repo}/compare/${oldSha}...${newSha}`,
      { headers },
    );
    if (!r.ok) {
      console.log(`Changelog fetch skipped: compare API -> ${r.status}`);
      return null;
    }
    const data = await r.json();
    const commits: Array<{ sha: string; commit: { message: string } }> =
      data.commits ?? [];
    const lines = commits
      .map(
        (c) =>
          `- \`${c.sha.slice(0, 10)}\` ${c.commit.message.split('\n')[0].slice(0, 100)}`,
      )
      .slice(-30); // most recent 30
    return {
      compareUrl: `https://github.com/${repo}/compare/${oldSha}...${newSha}`,
      total: data.total_commits ?? commits.length,
      lines,
    };
  } catch (e) {
    console.log(`Changelog fetch skipped: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

function taigaTaskLink(ref?: number): string {
  if (!ref) return 'Taiga task #?';
  const base = process.env.TAIGA_PUBLIC_URL || process.env.TAIGA_URL;
  const project = process.env.TAIGA_PROJECT;
  return base && project
    ? `[Task #${ref}](${base}/project/${project}/task/${ref})`
    : `Task #${ref}`;
}

/** Prefer the cluster's own task link; fall back to the story link. */
function entryLink(e?: StateEntry): string {
  if (e?.taskRef) return taigaTaskLink(e.taskRef);
  return taigaLink(e?.taigaRef);
}

function taigaLink(ref?: number): string {
  if (!ref) return 'Taiga #?';
  // Links must use the web UI host (tree.taiga.io on cloud), not the API host.
  // Also: TAIGA_URL is a GitHub *secret*, so any link built from it gets masked
  // to *** in job summaries — TAIGA_PUBLIC_URL is a plain variable and doesn't.
  // `||` not `??`: GitHub Actions passes unset vars as empty strings.
  const base = process.env.TAIGA_PUBLIC_URL || process.env.TAIGA_URL;
  const project = process.env.TAIGA_PROJECT;
  return base && project
    ? `[Taiga #${ref}](${base}/project/${project}/us/${ref})`
    : `Taiga #${ref}`;
}

function clusterDescription(c: Cluster): string {
  const qaseIds = c.tests.map((t: Failure) => t.qaseId).filter(Boolean);
  const lines = [
    `**Error:** \`${conciseError(c.errorSample)}\``,
    '',
    `**Spec files affected (${c.files.size}):**`,
    ...[...c.files].map((f: string) => `- \`${f}\``),
    '',
    `**Qase IDs affected:** ${qaseIds.length ? qaseIds.map((q) => `\`${q}\``).join(', ') : '_none linked_'}`,
    '',
    `**Affected tests (${c.tests.length}):**`,
    ...c.tests.map(
      (t: Failure) =>
        `- \`${t.title}\`${t.qaseId ? ` (Qase: ${t.qaseId})` : ''} — \`${t.file}\`${t.retries ? ` (${t.retries} retries)` : ''}`,
    ),
    '',
    '**Full error:**',
    '```',
    c.errorSample,
    '```',
    '',
    RUN_ID ? `Run: ${RUN_ID}` : '',
    REPORT_URL ? `[HTML report](${REPORT_URL})` : '',
    `_Cluster \`${c.fingerprint}\` — auto-created by daily triage. Classify: real bug vs test to update._`,
  ];
  return lines.join('\n');
}

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env var ${name}`);
    process.exit(1);
  }
  return v;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
