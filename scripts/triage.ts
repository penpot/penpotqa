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

const RESULTS_PATH = arg('results', 'playwright-report/results.json');
const STATE_PATH = arg('state', '.triage/state.json');
const REPORT_URL = arg('report-url', '');
const RELEASE = arg('release', ''); // e.g. "26.07" -> single story tagged release-26.07 with one task per cluster
const GROUP_BY = arg('group-by', 'cluster'); // release-mode tasks: 'cluster' (one per root cause) or 'file' (one per spec file)
const EPIC_REF = arg('epic-ref', ''); // optional: Taiga epic ref (#number) to link created stories under
const DRY_RUN = process.env.DRY_RUN === '1';

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
  taigaRef?: number; // Taiga issue ref
  taigaId?: number; // Taiga issue id
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
  if (ann?.description) return String(ann.description);
  const m =
    title.match(/\(\s*Qase(?:\s*ID)?\s*[:=]?\s*([\w-]+)\s*\)/i) ??
    title.match(/^([A-Z][A-Z0-9]+-\d+)\s*[:.]/);
  return m?.[1];
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
  // - snapshot/visual errors: per spec file (generic message, and visual diffs are
  //   debugged file by file against the spec's snapshots folder)
  // - functional errors: cross-file, keyed by error shape + locator. The locator's
  //   quoted text ('Select' vs 'Cancel subscription') IS the identity, so it is kept
  //   verbatim — only dynamic fragments (hex ids, numbers) inside it are neutralized.
  const basis = isSnapshotError(fail.error)
    ? `${normalizeError(fail.error)}|${fail.file}`
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
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
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
      if (!r.ok && !allowFail)
        throw new Error(`${method} ${p} -> ${r.status} ${await r.text()}`);
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
    if (fp.startsWith('__')) continue; // internal bookkeeping (release story, file->task map), not a cluster
    if (!clusters.has(fp)) {
      state[fp].seenInLastNRuns = [0, ...(state[fp].seenInLastNRuns ?? [])].slice(
        0,
        10,
      );
      state[fp].consecutiveRuns = 0;
      if (
        state[fp].seenInLastNRuns.slice(0, 3).every((x) => x === 0) &&
        state[fp].taigaRef
      ) {
        resolved.push(fp); // green 3 runs in a row -> candidate for closing
      }
    }
  }

  // ----- Taiga -----
  let taiga: Taiga | null = null;
  if (!DRY_RUN && newClusters.length + knownClusters.length > 0) {
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

  if (RELEASE) {
    // ----- Release mode: ONE user story for the whole release, one task per cluster -----
    const releaseTag = `release-${RELEASE}`.toLowerCase();
    const storyKey = '__release_story__';
    const storyState = (state as any)[storyKey] as StateEntry | undefined;

    let storyId = storyState?.taigaId;
    let storyRef = storyState?.taigaRef;

    // Someone may have deleted the story in Taiga since the last run — recreate if so.
    if (taiga && storyId && !(await taiga.storyExists(storyId))) {
      console.log(
        `Stored release story ${storyId} no longer exists in Taiga — recreating.`,
      );
      storyId = undefined;
      storyRef = undefined;
    }

    if (taiga && !storyId) {
      const subject = `[release ${RELEASE}] Daily failures triage`;
      const description = [
        `Triage of daily test failures for release **${RELEASE}**.`,
        '',
        `Run date: ${today}`,
        REPORT_URL ? `[HTML report](${REPORT_URL})` : '',
        '',
        'Each task below is one failure cluster (one root cause). Classify each as real bug or test to update.',
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
      for (const c of newClusters) {
        for (const t of c.tests) {
          byFile.set(t.file, [...(byFile.get(t.file) ?? []), t]);
        }
      }
      const fileTasks: Record<string, number> =
        (state as any)['__file_tasks__'] ?? {};

      for (const [file, tests] of byFile) {
        const lines = tests.map(
          (t) =>
            `- \`${t.title}\`${t.qaseId ? ` (Qase: ${t.qaseId})` : ''}${t.retries ? ` — ${t.retries} retries` : ''}\n  \`\`\`\n  ${conciseError(t.error)}\n  \`\`\``,
        );
        if (taiga && storyId) {
          if (fileTasks[file]) {
            await taiga.commentTask(
              fileTasks[file],
              [`New failures on ${today}:`, ...lines].join('\n'),
            );
            console.log(
              `  ~ appended ${tests.length} test(s) to existing task for ${file}`,
            );
          } else {
            const { id } = await taiga.createTask(
              storyId,
              `${path.basename(file)} — ${tests.length} failing test${tests.length > 1 ? 's' : ''}`,
              [
                `**Spec file:** \`${file}\``,
                '',
                `**Failing tests (${tests.length}):**`,
                ...lines,
                '',
                REPORT_URL ? `[HTML report](${REPORT_URL})` : '',
              ].join('\n'),
            );
            fileTasks[file] = id;
            console.log(`  + task: ${path.basename(file)} (${tests.length} tests)`);
          }
        } else {
          const qase = tests.map((t) => t.qaseId).filter(Boolean);
          console.log(
            `[dry-run]   + task: ${path.basename(file)} — ${tests.length} failing test(s)${qase.length ? ` [Qase: ${qase.join(', ')}]` : ''}`,
          );
        }
      }
      (state as any)['__file_tasks__'] = fileTasks;
      // Cluster fingerprints still track new/known/resolved against the release story.
      for (const c of newClusters) {
        state[c.fingerprint].taigaId = storyId;
        state[c.fingerprint].taigaRef = storyRef;
      }
    } else {
      for (const c of newClusters) {
        const taskSubject = `${conciseError(c.errorSample)} — ${[...c.files].map((f: string) => path.basename(f)).join(', ')} (${c.tests.length} test${c.tests.length > 1 ? 's' : ''})`;
        if (taiga && storyId) {
          await taiga.createTask(storyId, taskSubject, clusterDescription(c));
          state[c.fingerprint].taigaId = storyId;
          state[c.fingerprint].taigaRef = storyRef;
          console.log(`  + task: ${taskSubject}`);
        } else {
          console.log(`[dry-run]   + task: ${taskSubject}`);
        }
      }
    }
    if (taiga && storyId && knownClusters.length) {
      await taiga.commentStory(
        storyId,
        `Re-run on ${today}: ${knownClusters.length} cluster(s) still failing, ${newClusters.length} new. Report: ${REPORT_URL}`,
      );
    }
  } else {
    // ----- Daily mode: one user story per cluster, one task per test -----
    for (const c of newClusters) {
      const subject = `[daily] ${conciseError(c.errorSample)} — ${[...c.files].map((f: string) => path.basename(f)).join(', ')} (${c.tests.length} test${c.tests.length > 1 ? 's' : ''})`;
      const description = clusterDescription(c);
      if (taiga) {
        const { id, ref } = await taiga.createUserStory(
          subject,
          description,
          storyTags,
        );
        state[c.fingerprint].taigaId = id;
        state[c.fingerprint].taigaRef = ref;
        console.log(`Created Taiga user story #${ref} for cluster ${c.fingerprint}`);
        if (EPIC_REF)
          await taiga.linkStoryToEpic(await taiga.epicIdByRef(EPIC_REF), id);
        for (const t of c.tests) {
          await taiga.createTask(
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
        }
        console.log(`  + ${c.tests.length} task(s) inside`);
      } else {
        console.log(
          `[dry-run] Would create user story: ${subject} [tags: ${storyTags.join(', ')}]`,
        );
        for (const t of c.tests)
          console.log(`[dry-run]   + task: Review: ${t.title}`);
      }
    }

    for (const c of knownClusters) {
      const entry = state[c.fingerprint];
      if (taiga && entry.taigaId) {
        await taiga.commentStory(
          entry.taigaId,
          `Still failing on ${today} (${c.tests.length} tests, ${entry.consecutiveRuns} consecutive runs). Report: ${REPORT_URL}`,
        );
      }
    }
  }

  if (DRY_RUN) {
    console.log(
      '[dry-run] state NOT saved — dry runs leave no trace, so a later real run still sees these failures as new',
    );
  } else {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  }

  // ----- Digest (markdown, printed to stdout for Slack/summary step) -----
  const digest: string[] = [`## Daily triage — ${today}`, ''];
  digest.push(
    `**${hardFailures.length} failures** in **${clusters.size} clusters** · ${flakyTests.length} flaky · ${resolved.length} resolved`,
  );
  if (REPORT_URL) digest.push(`[Full HTML report](${REPORT_URL})`);
  digest.push('');
  if (newClusters.length) {
    digest.push(`### New clusters (${newClusters.length})`);
    for (const c of newClusters) {
      const ref = state[c.fingerprint].taigaRef;
      digest.push(
        `- ${ref ? `${taigaLink(ref)} — ` : ''}\`${conciseError(c.errorSample)}\` in ${[...c.files].join(', ')} (${c.tests.length} test${c.tests.length > 1 ? 's' : ''})${qaseList(c)}`,
      );
    }
    digest.push('');
  }
  if (knownClusters.length) {
    digest.push(`### known clusters still failing (${knownClusters.length})`);
    for (const c of knownClusters) {
      const e = state[c.fingerprint];
      digest.push(
        `- ${taigaLink(e.taigaRef)} — \`${conciseError(c.errorSample)}\` in ${[...c.files].join(', ')} (${c.tests.length} test${c.tests.length > 1 ? 's' : ''}, failing ${e.consecutiveRuns} runs in a row)${qaseList(c)}`,
      );
    }
    digest.push('');
  }
  if (resolved.length) {
    digest.push(`### resolved (green 3 runs) — consider closing`);
    for (const fp of resolved) digest.push(`- ${taigaLink(state[fp].taigaRef)}`);
  }
  const digestText = digest.join('\n');
  console.log('\n' + digestText);
  fs.mkdirSync('.triage', { recursive: true });
  fs.writeFileSync('.triage/digest.md', digestText);

  // ----- Mattermost -----
  const mmWebhook = process.env.MATTERMOST_WEBHOOK_URL;
  if (mmWebhook && !DRY_RUN) {
    const r = await fetch(mmWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Daily Triage',
        icon_emoji: ':test_tube:',
        // channel: 'qa-daily',  // optional override; defaults to the webhook's channel
        text: digestText,
      }),
    });
    if (!r.ok)
      console.error(`Mattermost post failed: ${r.status} ${await r.text()}`);
    else console.log('Digest posted to Mattermost');
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

function taigaLink(ref?: number): string {
  if (!ref) return 'Taiga #?';
  const base = process.env.TAIGA_URL;
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
