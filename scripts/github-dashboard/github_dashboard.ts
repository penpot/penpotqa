#!/usr/bin/env npx tsx
/**
 * Penpot QA GitHub Pipeline: Automated Test Coverage vs. Real Bugs
 *
 * TypeScript port of github_dashboard.ts — same logic, same outputs.
 * No runtime dependencies: uses the native fetch API (Node >= 18) and fs.
 *
 * Usage:
 *   export QASE_TOKEN=xxxx
 *   export GITHUB_TOKEN=ghp_xxxx   // Classic PAT with the read:project scope
 *   npx tsx scripts/github-dashboard/github_dashboard
 *
 * Retrieves:
 *   - Test suites and test cases from Qase (API v1, paginated in batches of 100)
 *   - Issues from the GitHub Project v2 (GraphQL, including the Status and Type fields)
 *
 * Generates the following files in out/ (run weekly via cron, so the dashboard
 * filename is date-prefixed to keep one snapshot per run):
 *   - decision-matrix.csv
 *   - mapped-bugs.csv
 *   - mapped-features.csv
 *   - monthly-trend.csv
 *   - regression-tests.csv
 *   - YYYY-MM-DD-github-dashboard.html (self-contained)
 *   - YYYY-MM-DD-github-dashboard.zip (added by the workflow: this directory's
 *     input files + out/, so a run's raw data can be pulled straight from the
 *     dashboard's own "download raw data" link)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const QASE_PROJECT = 'PENPOT';
const GH_ORG = 'penpot';
const GH_PROJECT_NUMBER = 8;

const QASE_TOKEN = process.env.QASE_TOKEN;
const GH_TOKEN = process.env.GITHUB_TOKEN;
// S3 prefix the workflow publishes under (see .github/workflows/github-dashboard.yml);
// only used to build the "download raw data" zip link embedded in the HTML.
const S3_PREFIX = process.env.S3_PREFIX || 'github-dashboard';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');

interface Mapping {
  label_map: Record<string, string>;
  keyword_map: [string, string][];
  fallback_area: string;
  ignore_title_patterns: string[];
  exclude_labels: string[];
}
const MAPPING: Mapping = JSON.parse(
  fs.readFileSync(path.join(HERE, 'mapping.json'), 'utf-8'),
);

// Logs a fatal error and exits the process.
function die(msg: string): never {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

// Promise-based delay, used to throttle paginated requests.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------
interface Suite {
  id: number;
  title: string;
  parent_id: number | null;
  cases_count: number;
}
interface TestCase {
  id: number;
  title: string;
  suite_id: number;
  automation: string | number;
  area?: string;
  is_automated?: boolean;
}
interface Issue {
  number: number;
  Title: string;
  URL: string;
  state: string;
  Created: string;
  Closed: string | null;
  Type: string | null;
  Labels: string;
  Status: string | null;
  area?: string;
  map_method?: string;
}
interface FlakyOccurrence {
  date: string;
  run_id: string;
  status: 'flaky' | 'failed';
}
interface FlakyTestHistory {
  title: string;
  occurrences: FlakyOccurrence[];
}

// ---------------------------------------------------------------------------
// 1. Qase (REST, paginated in batches of 100)
// ---------------------------------------------------------------------------
const QASE_BASE = 'https://api.qase.io/v1';
const QASE_REG_FILTERS = new Map<string, string>([['type', 'regression']]);
const QASE_REG_AUTO_FILTERS = new Map<string, string>([
  ['type', 'regression'],
  ['automation', 'automated'],
]);

// Fetches all pages of a Qase entity (suite, case, ...) in batches of 100.
async function qaseGetPaginated(
  entity: string,
  params: Record<string, string> = {},
): Promise<any[]> {
  const out: any[] = [];
  let offset = 0;
  for (;;) {
    const qs = new URLSearchParams({
      limit: '100',
      offset: String(offset),
      ...params,
    });
    const res = await fetch(`${QASE_BASE}/${entity}/${QASE_PROJECT}?${qs}`, {
      headers: { Token: QASE_TOKEN!, Accept: 'application/json' },
    });
    if (!res.ok) die(`Qase ${entity}: HTTP ${res.status} ${await res.text()}`);
    const { result } = (await res.json()) as any;
    out.push(...result.entities);
    offset += result.entities.length;
    if (offset >= result.total || result.entities.length === 0) return out;
    await sleep(300); // be polite to the rate limit
  }
}

// Removes duplicate entities (by id) that can appear across paginated pages.
const dedupeById = <T extends { id: number }>(arr: T[]): T[] => {
  const seen = new Map<number, T>();
  for (const x of arr) if (!seen.has(x.id)) seen.set(x.id, x);
  if (seen.size < arr.length)
    console.log(
      `  (deduplicated ${arr.length - seen.size} entities repeated across pages)`,
    );
  return [...seen.values()];
};

// Downloads and dedupes Qase test cases matching the given filters (e.g. regression/automated).
async function fetchQaseCases(filters: Map<string, string>): Promise<TestCase[]> {
  console.log(`• Qase: downloading test cases ${[...filters.values()].join(', ')}…`);
  const cases: TestCase[] = dedupeById(
    (await qaseGetPaginated('case', Object.fromEntries(filters))).map((c) => ({
      id: c.id,
      title: c.title,
      suite_id: c.suite_id,
      automation: c.automation,
    })),
  );
  console.log(`  ${cases.length} ${[...filters.values()].join(', ')} cases`);
  return cases;
}

// Downloads all suites plus regression and regression+automated test cases from Qase.
async function fetchQase(): Promise<{
  suites: Suite[];
  regCases: TestCase[];
  regAutoCases: TestCase[];
}> {
  console.log('• Qase: downloading suites…');
  const suites: Suite[] = dedupeById(
    (await qaseGetPaginated('suite')).map((s) => ({
      id: s.id,
      title: s.title,
      parent_id: s.parent_id ?? null,
      cases_count: s.cases_count ?? 0,
    })),
  );
  console.log(`  ${suites.length} suites`);

  const regCases = await fetchQaseCases(QASE_REG_FILTERS);
  const regAutoCases = await fetchQaseCases(QASE_REG_AUTO_FILTERS);
  return { suites, regCases, regAutoCases };
}

// Walks each suite's parent chain to find its top-level root, and tallies case
// counts per root (the "area" used throughout the dashboard).
function resolveRoots(suites: Suite[]): {
  rootOf: Map<number, string>;
  inventory: Map<string, number>;
  rootNames: string[];
} {
  const parent = new Map(suites.map((s) => [s.id, s.parent_id]));
  const name = new Map(suites.map((s) => [s.id, s.title]));
  const root = (sid: number): number => {
    const seen = new Set<number>();
    while (parent.get(sid) != null && !seen.has(sid)) {
      seen.add(sid);
      sid = parent.get(sid)!;
    }
    return sid;
  };
  const rootOf = new Map<number, string>();
  const inventory = new Map<string, number>();
  for (const s of suites) {
    const r = name.get(root(s.id))!;
    rootOf.set(s.id, r);
    inventory.set(r, (inventory.get(r) ?? 0) + s.cases_count);
  }
  const rootNames = suites.filter((s) => s.parent_id == null).map((s) => s.title);
  return { rootOf, inventory, rootNames };
}

// ---------------------------------------------------------------------------
// 2. GitHub Project v2 (GraphQL — the only way to get the Status field)
// ---------------------------------------------------------------------------
const PROJECT_QUERY = `
query($org: String!, $number: Int!, $cursor: String) {
  organization(login: $org) {
    projectV2(number: $number) {
      items(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field { ... on ProjectV2FieldCommon { name } }
              }
            }
          }
          content {
            ... on Issue {
              number title url state createdAt closedAt
              issueType { name }
              labels(first: 20) { nodes { name } }
            }
          }
        }
      }
    }
  }
}`;

// Paginates through the GitHub Project v2 GraphQL API to collect all issue
// items (bugs, features and enhancements) along with their Status/Type project fields.
async function fetchGithubProject(): Promise<Issue[]> {
  console.log('• GitHub: downloading project items…');
  const githubIssues: Issue[] = [];
  let cursor: string | null = null;
  for (;;) {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: PROJECT_QUERY,
        variables: { org: GH_ORG, number: GH_PROJECT_NUMBER, cursor },
      }),
    });
    if (!res.ok) die(`GitHub GraphQL: HTTP ${res.status} ${await res.text()}`);
    const payload = (await res.json()) as any;
    if (payload.errors) die(`GraphQL: ${JSON.stringify(payload.errors)}`);
    const project = payload.data.organization.projectV2;
    if (project == null)
      die(
        'GitHub returned projectV2=null: the token cannot see the project. ' +
          'Use a classic PAT with the read:project scope (fine-grained tokens ' +
          'only work if you are an org member with Projects:Read permission).',
      );
    for (const node of project.items.nodes) {
      const issue = node.content;
      if (!issue?.number) continue; // drafts / PRs
      const fields: Record<string, string> = {};
      for (const fv of node.fieldValues.nodes) {
        if (fv?.field?.name) fields[fv.field.name] = fv.name;
      }
      githubIssues.push({
        number: issue.number,
        Title: issue.title,
        URL: issue.url,
        state: issue.state,
        Created: issue.createdAt,
        Closed: issue.closedAt ?? null,
        Type: issue.issueType?.name ?? null,
        Labels: issue.labels.nodes.map((l: any) => l.name).join(', '),
        Status: fields['Status'] ?? null,
      });
    }
    if (!project.items.pageInfo.hasNextPage) break;
    cursor = project.items.pageInfo.endCursor;
  }
  console.log(`  ${githubIssues.length} items`);
  return githubIssues;
}

// ---------------------------------------------------------------------------
// 2b. Flaky-test history (rolling aggregate fed daily by playwright_pre_daily.yml
// / scripts/github-dashboard/flaky-tally.ts, published to a public S3 URL — no
// AWS credentials needed here, just a plain GET, so this stays a no-dependency script).
// ---------------------------------------------------------------------------
const FLAKY_HISTORY_URL =
  'https://kaleidos-qa-reports.s3.eu-west-1.amazonaws.com/flaky-history.json';

const DEFAULT_RELIABILITY_WINDOW_DAYS = 30;

// Best-effort fetch: a missing or unreachable aggregate shouldn't fail the whole
// dashboard build, since it's a supplementary dimension on top of the Qase/GitHub data.
async function fetchFlakyHistory(): Promise<{
  tests: Record<string, FlakyTestHistory>;
  windowDays: number;
}> {
  console.log('• Fetching flaky-test history…');
  try {
    const res = await fetch(FLAKY_HISTORY_URL);
    if (!res.ok) {
      console.log(`  (no flaky history yet: HTTP ${res.status})`);
      return { tests: {}, windowDays: DEFAULT_RELIABILITY_WINDOW_DAYS };
    }
    const payload = (await res.json()) as {
      tests: Record<string, FlakyTestHistory>;
      window_days?: number;
    };
    const tests = payload.tests ?? {};
    console.log(
      `  ${Object.keys(tests).length} tests with flaky/failed occurrences`,
    );
    return {
      tests,
      windowDays: payload.window_days ?? DEFAULT_RELIABILITY_WINDOW_DAYS,
    };
  } catch (e) {
    console.log(`  (flaky history unavailable: ${e})`);
    return { tests: {}, windowDays: DEFAULT_RELIABILITY_WINDOW_DAYS };
  }
}

// ---------------------------------------------------------------------------
// 3. Issue -> area mapping
// ---------------------------------------------------------------------------
// Maps an issue to a dashboard area, first by label then by title keyword,
// falling back to the configured fallback area.
function mapIssue(title: string, labels: string): [string, string] {
  const labs = (labels || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  for (const lab of labs) {
    if (lab in MAPPING.label_map) return [MAPPING.label_map[lab], `label:${lab}`];
  }
  const t = String(title).toLowerCase();
  for (const [pat, area] of MAPPING.keyword_map) {
    if (new RegExp(pat, 'i').test(t)) return [area, 'keyword'];
  }
  return [MAPPING.fallback_area, 'none'];
}

// ---------------------------------------------------------------------------
// Utilities: CSV, aggregation, median
// ---------------------------------------------------------------------------
// Serializes rows to CSV, quoting values that contain commas, quotes, or newlines.
function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return '';
  const cols = columns ?? Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return (
    [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join(
      '\n',
    ) + '\n'
  );
}

// Counts items grouped by a derived key.
function countBy<T>(items: T[], key: (x: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return m;
}

// Buckets items into arrays grouped by a derived key.
function groupBy<T>(items: T[], key: (x: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    const arr = m.get(k);
    if (arr) arr.push(it);
    else m.set(k, [it]);
  }
  return m;
}

// Computes the median of a numeric array.
function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Rounds a number to d decimal places.
const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

// ---------------------------------------------------------------------------
// 4. Metrics and dashboard
// ---------------------------------------------------------------------------
interface AreaRow {
  area: string;
  total_inventory: number;
  regression_tests: number;
  automated: number;
  bugs: number;
  open_bugs: number;
  features: number;
  bugs_per_test: number | null;
  pct_inv_automated: number | null;
  decision: string;
}

// Per-area references shown as links in the HTML report (not part of the CSVs).
interface IssueRef {
  number: number;
  title: string;
  url: string;
  closed: boolean;
}
interface TestRef {
  id: number;
  title: string;
  automated: boolean;
}
interface AreaLinks {
  bugs: IssueRef[];
  features: IssueRef[];
  tests: TestRef[];
}

// ---------------------------------------------------------------------------
// GitHub project item filters.
// Edit these maps to change what is excluded from / considered in the
// dashboard — no need to touch the filtering logic below.
// ---------------------------------------------------------------------------

// Items excluded outright, regardless of Type.
const EXCLUDED: {
  titlePatterns: string[]; // regex patterns matched against the issue title
  labels: string[]; // labels matched case-insensitively against Labels
} = {
  titlePatterns: MAPPING.ignore_title_patterns,
  labels: MAPPING.exclude_labels,
};

// Issue Status values excluded per considered category (key = category below).
const EXCLUDED_STATUSES: Record<'bug' | 'feature', string[]> = {
  bug: ['Rejected'],
  feature: [],
};

// Issue Type values considered for each category.
const CONSIDERED_TYPES: Record<'bug' | 'feature', string[]> = {
  bug: ['Bug'],
  feature: ['Feature', 'Enhancement'],
};

type RegressionTest = TestCase & { area: string; is_automated: boolean };
type AutomatedTest = TestCase & { area: string };
interface AreaCounts {
  allAreas: Set<string>;
  bugsBy: Map<string, number>;
  openBy: Map<string, number>;
  featsBy: Map<string, number>;
  testsBy: Map<string, number>;
  autoBy: Map<string, number>;
}

// Attaches an `area` (derived from the suite tree) to each regression test case,
// plus an `is_automated` flag based on the Qase automation status.
function enrichTestCases(
  qaseRegrCases: TestCase[],
  qaseRegrAutoCases: TestCase[],
  rootOf: Map<number, string>,
): { tests: RegressionTest[]; autoTests: AutomatedTest[] } {
  const tests = qaseRegrCases.map((c) => ({
    ...c,
    area: rootOf.get(c.suite_id) ?? '(unknown suite)',
    is_automated: ['automated', '2'].includes(String(c.automation)),
  }));
  const autoTests = qaseRegrAutoCases.map((c) => ({
    ...c,
    area: rootOf.get(c.suite_id) ?? '(unknown suite)',
  }));
  return { tests, autoTests };
}

interface ReliabilityRow {
  id: string;
  title: string;
  area: string;
  flaky: number;
  failed: number;
  total: number;
  last_seen: string;
  last_seen_run_id: string;
}

// Joins the flaky-test history (keyed by Qase id, fed daily) against the known
// regression tests, so every occurrence can be attributed to its area. Tests
// that flaked/failed but aren't in the current regression export (removed,
// re-suited, or not automation-tagged in Qase) still show up with area "—"
// rather than being silently dropped. Sorted by most failed first, ties
// broken by most flaky (the dashboard's columns are also click-to-sort).
function buildReliabilityRows(
  tests: RegressionTest[],
  flakyHistory: Record<string, FlakyTestHistory>,
): ReliabilityRow[] {
  const areaByTestId = new Map(tests.map((test) => [String(test.id), test.area]));
  const rows = Object.entries(flakyHistory).map(([qaseId, testHistory]) => {
    const flakyCount = testHistory.occurrences.filter(
      (occurrence) => occurrence.status === 'flaky',
    ).length;
    const failedCount = testHistory.occurrences.filter(
      (occurrence) => occurrence.status === 'failed',
    ).length;
    const lastOccurrence = testHistory.occurrences.reduce((latest, occurrence) =>
      occurrence.date > latest.date ? occurrence : latest,
    );
    return {
      id: qaseId,
      title: testHistory.title,
      area: areaByTestId.get(qaseId) ?? '—',
      flaky: flakyCount,
      failed: failedCount,
      total: flakyCount + failedCount,
      last_seen: lastOccurrence.date,
      // The run's raw report on S3 expires after ~10 days (see README), so this
      // link is best-effort — it's most likely to still resolve for recent runs.
      last_seen_run_id: lastOccurrence.run_id,
    };
  });
  rows.sort((a, b) => b.failed - a.failed || b.flaky - a.flaky);
  return rows;
}

// Drops excluded titles/labels, splits the remaining GitHub items into bugs vs.
// features (per CONSIDERED_TYPES/EXCLUDED_STATUSES), and tags each with an area via mapIssue().
function classifyIssues(githubIssues: Issue[]): { bugs: Issue[]; feats: Issue[] } {
  const excludedTitleRegExpr = new RegExp(
    EXCLUDED.titlePatterns.join('|') || '$^',
    'i',
  );
  const excludedLabels = new Set(
    EXCLUDED.labels.map((label) => label.toLowerCase()),
  );
  const hasExcludedLabel = (labels: string) =>
    labels
      .split(',')
      .map((label) => label.trim().toLowerCase())
      .some((label) => excludedLabels.has(label));

  const items = githubIssues.filter(
    (i) =>
      i.Type && !excludedTitleRegExpr.test(i.Title) && !hasExcludedLabel(i.Labels),
  );
  const bugs = items.filter(
    (i) =>
      CONSIDERED_TYPES.bug.includes(i.Type!) &&
      !EXCLUDED_STATUSES.bug.includes(i.Status ?? ''),
  );
  const feats = items.filter(
    (i) =>
      CONSIDERED_TYPES.feature.includes(i.Type!) &&
      !EXCLUDED_STATUSES.feature.includes(i.Status ?? ''),
  );
  for (const issues of [bugs, feats])
    for (const issue of issues) {
      const [area, method] = mapIssue(issue.Title, issue.Labels);
      issue.area = area;
      issue.map_method = method;
    }
  return { bugs, feats };
}

// Tallies bugs/open-bugs/features/tests/automated-tests per area, and the full
// set of areas (suite roots plus any area only referenced by an issue).
function buildAreaCounts(
  bugs: Issue[],
  feats: Issue[],
  tests: RegressionTest[],
  autoTests: AutomatedTest[],
  rootNames: string[],
): AreaCounts {
  const bugsBy = countBy(bugs, (b) => b.area!);
  const openBy = countBy(
    bugs.filter((b) => !b.Closed),
    (b) => b.area!,
  );
  const featsBy = countBy(feats, (f) => f.area!);
  const testsBy = countBy(tests, (t) => t.area);
  const autoBy = countBy(autoTests, (t) => t.area);
  const allAreas = new Set<string>([
    ...rootNames,
    ...bugsBy.keys(),
    ...featsBy.keys(),
  ]);
  return { allAreas, bugsBy, openBy, featsBy, testsBy, autoBy };
}

// Builds the per-area bug/feature/test references shown as "check from here"
// links in the HTML report.
function buildAreaLinks(
  allAreas: Set<string>,
  bugs: Issue[],
  feats: Issue[],
  tests: RegressionTest[],
): Map<string, AreaLinks> {
  const toIssueRef = (i: Issue): IssueRef => ({
    number: i.number,
    title: i.Title,
    url: i.URL,
    closed: !!i.Closed,
  });
  const toTestRef = (t: RegressionTest): TestRef => ({
    id: t.id,
    title: t.title,
    automated: t.is_automated,
  });
  const bugsByArea = groupBy(bugs, (b) => b.area!);
  const featsByArea = groupBy(feats, (f) => f.area!);
  const testsByArea = groupBy(tests, (t) => t.area);
  return new Map(
    [...allAreas].map((area) => [
      area,
      {
        bugs: (bugsByArea.get(area) ?? []).map(toIssueRef),
        features: (featsByArea.get(area) ?? []).map(toIssueRef),
        tests: (testsByArea.get(area) ?? []).map(toTestRef),
      },
    ]),
  );
}

// Builds one decision-matrix row per area, then assigns each a COVER/REINFORCE/
// MAINTAIN/... decision based on its bug and automated-test counts relative to
// the cross-area medians. Rows are returned sorted by bug count, descending.
function buildAreaRows(
  counts: AreaCounts,
  inventory: Map<string, number>,
): { rows: AreaRow[]; medBugs: number; medTests: number } {
  const { allAreas, bugsBy, openBy, featsBy, testsBy, autoBy } = counts;
  const fallback = MAPPING.fallback_area;

  const rows: AreaRow[] = [...allAreas].map((area) => {
    const automated = autoBy.get(area) ?? 0;
    const inv = inventory.get(area) ?? 0;
    const nBugs = bugsBy.get(area) ?? 0;
    return {
      area,
      total_inventory: inv,
      regression_tests: testsBy.get(area) ?? 0,
      automated,
      bugs: nBugs,
      open_bugs: openBy.get(area) ?? 0,
      features: featsBy.get(area) ?? 0,
      bugs_per_test: automated > 0 ? round(nBugs / automated, 2) : null,
      pct_inv_automated: inv > 0 ? round((100 * automated) / inv, 1) : null,
      decision: '',
    };
  });

  const medBugs = median(rows.filter((r) => r.area !== fallback).map((r) => r.bugs));
  const medTests = median(rows.map((r) => r.automated));
  for (const r of rows) {
    if (r.area === fallback) r.decision = 'Out of scope (non-UI)';
    else if (r.automated === 0 && r.bugs > 0)
      r.decision = 'COVER: bugs with no test at all';
    else if (r.bugs > medBugs && r.automated <= medTests)
      r.decision = 'REINFORCE: many bugs, few tests';
    else if (r.bugs <= medBugs && r.automated > medTests)
      r.decision = 'REVIEW PRUNING: few bugs, many tests';
    else if (r.bugs > medBugs && r.automated > medTests)
      r.decision = 'MAINTAIN: investment justified';
    else r.decision = 'OK: low risk, low investment';
  }
  rows.sort((a, b) => b.bugs - a.bugs);

  return { rows, medBugs, medTests };
}

// Counts bugs by created/closed month to drive the trend chart in the HTML report.
function buildMonthlyTrend(bugs: Issue[]) {
  const month = (iso: string) => iso.slice(0, 7);
  const createdBy = countBy(bugs, (b) => month(b.Created));
  const closedBy = countBy(
    bugs.filter((b) => b.Closed),
    (b) => month(b.Closed!),
  );
  const months = [...new Set([...createdBy.keys(), ...closedBy.keys()])].sort();
  return months.map((month) => ({
    month,
    created: createdBy.get(month) ?? 0,
    closed: closedBy.get(month) ?? 0,
  }));
}

// Writes the decision matrix, mapped bugs/features, monthly trend, and
// regression tests CSVs to out/.
function writeCsvOutputs(
  rows: AreaRow[],
  bugs: Issue[],
  feats: Issue[],
  trend: ReturnType<typeof buildMonthlyTrend>,
  tests: RegressionTest[],
  reliability: ReliabilityRow[],
) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'decision-matrix.csv'), toCsv(rows as any[]));
  fs.writeFileSync(path.join(OUT, 'mapped-bugs.csv'), toCsv(bugs as any[]));
  fs.writeFileSync(path.join(OUT, 'mapped-features.csv'), toCsv(feats as any[]));
  fs.writeFileSync(path.join(OUT, 'monthly-trend.csv'), toCsv(trend));
  fs.writeFileSync(
    path.join(OUT, 'regression-tests.csv'),
    toCsv(tests as any[], [
      'id',
      'title',
      'suite_id',
      'automation',
      'area',
      'is_automated',
    ]),
  );
  fs.writeFileSync(path.join(OUT, 'flaky-tests.csv'), toCsv(reliability as any[]));
}

// Assembles the dashboard JSON payload and writes the self-contained,
// date-stamped HTML report (one snapshot per day).
function writeDashboardHtml(
  rows: AreaRow[],
  bugs: Issue[],
  feats: Issue[],
  autoTests: AutomatedTest[],
  inventory: Map<string, number>,
  trend: ReturnType<typeof buildMonthlyTrend>,
  medBugs: number,
  medTests: number,
  linksByArea: Map<string, AreaLinks>,
  reliability: ReliabilityRow[],
  reliabilityWindowDays: number,
) {
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10); // YYYY-MM-DD, used as a filename prefix for daily runs
  const data = {
    kpi: {
      automated_tests: autoTests.length,
      total_inventory: [...inventory.values()].reduce((a, b) => a + b, 0),
      bugs: bugs.length,
      open_bugs: bugs.filter((b) => !b.Closed).length,
      features: feats.length,
      flaky_tests: reliability.length,
    },
    areas: rows.map((r) => ({
      ...r,
      links: linksByArea.get(r.area) ?? { bugs: [], features: [], tests: [] },
    })),
    trend,
    medians: { bugs: medBugs, tests: medTests },
    reliability,
    reliability_window_days: reliabilityWindowDays,
    generated_at: now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
    // Stable pointer (see the workflow's "Publish to S3" step): the zip is
    // republished under this fixed name on every run, so the link never breaks.
    zip_url: `https://kaleidos-qa-reports.s3.eu-west-1.amazonaws.com/${S3_PREFIX}/latest/github-dashboard.zip`,
  };
  const template = fs.readFileSync(
    path.join(HERE, 'dashboard_template.html'),
    'utf-8',
  );
  const dashboardFilename = `${dateStamp}-github-dashboard.html`;
  fs.writeFileSync(
    path.join(OUT, dashboardFilename),
    template.replace('__DATA__', JSON.stringify(data)),
  );
}

// Prints a one-line-per-area summary table to the console.
function logSummary(rows: AreaRow[]) {
  console.log(`\n✔ Generated in ${OUT}/`);
  const w = Math.max(...rows.map((r) => r.area.length));
  for (const r of rows)
    console.log(
      `${r.area.padEnd(w)}  auto:${String(r.automated).padStart(4)}  bugs:${String(r.bugs).padStart(4)}  ${r.decision}`,
    );
}

// Cross-references Qase test inventory with GitHub bugs/features per area,
// computes the decision matrix and monthly trend, and writes the CSVs and
// self-contained HTML dashboard to out/.
export function build(
  qaseSuites: Suite[],
  qaseRegrCases: TestCase[],
  qaseRegrAutoCases: TestCase[],
  githubIssues: Issue[],
  flakyHistory: Record<string, FlakyTestHistory> = {},
  reliabilityWindowDays: number = DEFAULT_RELIABILITY_WINDOW_DAYS,
) {
  const { rootOf, inventory, rootNames } = resolveRoots(qaseSuites);
  const { tests, autoTests } = enrichTestCases(
    qaseRegrCases,
    qaseRegrAutoCases,
    rootOf,
  );
  const { bugs, feats } = classifyIssues(githubIssues);

  const counts = buildAreaCounts(bugs, feats, tests, autoTests, rootNames);
  const linksByArea = buildAreaLinks(counts.allAreas, bugs, feats, tests);
  const { rows, medBugs, medTests } = buildAreaRows(counts, inventory);
  const trend = buildMonthlyTrend(bugs);
  const reliability = buildReliabilityRows(tests, flakyHistory);

  writeCsvOutputs(rows, bugs, feats, trend, tests, reliability);
  writeDashboardHtml(
    rows,
    bugs,
    feats,
    autoTests,
    inventory,
    trend,
    medBugs,
    medTests,
    linksByArea,
    reliability,
    reliabilityWindowDays,
  );
  logSummary(rows);
}

// ---------------------------------------------------------------------------
// Entry point: validates env vars, fetches Qase + GitHub data, and builds the dashboard.
async function main() {
  if (!QASE_TOKEN) die('Missing QASE_TOKEN environment variable');
  if (!GH_TOKEN)
    die('Missing GITHUB_TOKEN environment variable (PAT with read:project scope)');
  const { suites, regCases, regAutoCases } = await fetchQase();
  const githubIssues = await fetchGithubProject();
  const { tests: flakyHistory, windowDays } = await fetchFlakyHistory();
  build(suites, regCases, regAutoCases, githubIssues, flakyHistory, windowDays);
}

// Only run main() when invoked directly (allows importing build() in tests)
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  main().catch((e) => die(String(e?.stack ?? e)));
}
