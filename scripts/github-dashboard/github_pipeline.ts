#!/usr/bin/env npx tsx
/**
 * Penpot QA GitHub Pipeline: Automated Test Coverage vs. Real Bugs
 *
 * TypeScript port of github_pipeline.py — same logic, same outputs.
 * No runtime dependencies: uses the native fetch API (Node >= 18) and fs.
 *
 * Usage:
 *   export QASE_TOKEN=xxxx
 *   export GITHUB_TOKEN=ghp_xxxx   // Classic PAT with the read:project scope
 *   npx tsx scripts/github-dashboard/github_pipeline
 *
 * Retrieves:
 *   - Test suites and test cases from Qase (API v1, paginated in batches of 100)
 *   - Issues from the GitHub Project v2 (GraphQL, including the Status and Type fields)
 *
 * Generates the following files in out/ (run daily via cron, so the dashboard
 * filename is date-prefixed to keep one snapshot per day):
 *   - decision-matrix.csv
 *   - mapped-bugs.csv
 *   - mapped-features.csv
 *   - monthly-trend.csv
 *   - regression-tests.csv
 *   - YYYY-MM-DD-penpot-qa-dashboard.html (self-contained)
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

function die(msg: string): never {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

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

// ---------------------------------------------------------------------------
// 1. Qase (REST, paginated in batches of 100)
// ---------------------------------------------------------------------------
const QASE_BASE = 'https://api.qase.io/v1';
const QASE_FILTERS = new Map<string, string>([
  ['type', 'regression'],
  ['automation', 'automated'],
]);

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

const dedupeById = <T extends { id: number }>(arr: T[]): T[] => {
  const seen = new Map<number, T>();
  for (const x of arr) if (!seen.has(x.id)) seen.set(x.id, x);
  if (seen.size < arr.length)
    console.log(
      `  (deduplicated ${arr.length - seen.size} entities repeated across pages)`,
    );
  return [...seen.values()];
};

async function fetchQase(): Promise<{ suites: Suite[]; cases: TestCase[] }> {
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

  console.log(
    `• Qase: downloading test cases ${[...QASE_FILTERS.values()].join(', ')}…`,
  );
  const cases: TestCase[] = dedupeById(
    (await qaseGetPaginated('case', Object.fromEntries(QASE_FILTERS))).map((c) => ({
      id: c.id,
      title: c.title,
      suite_id: c.suite_id,
      automation: c.automation,
    })),
  );
  console.log(`  ${cases.length} ${[...QASE_FILTERS.values()].join(', ')} cases`);
  return { suites, cases };
}

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

async function fetchGithubProject(): Promise<Issue[]> {
  console.log('• GitHub: downloading project items…');
  const rows: Issue[] = [];
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
      rows.push({
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
  console.log(`  ${rows.length} items`);
  return rows;
}

// ---------------------------------------------------------------------------
// 3. Issue -> area mapping
// ---------------------------------------------------------------------------
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

function countBy<T>(items: T[], key: (x: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return m;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

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

export function build(suites: Suite[], cases: TestCase[], projectItems: Issue[]) {
  const { rootOf, inventory, rootNames } = resolveRoots(suites);

  const tests = cases.map((c) => ({
    ...c,
    area: rootOf.get(c.suite_id) ?? '(unknown suite)',
    is_automated: ['automated', '2'].includes(String(c.automation)),
  }));

  // Split the project by type, applying the filters defined above
  const ignore = new RegExp(EXCLUDED.titlePatterns.join('|') || '$^', 'i');
  const excludedLabels = new Set(EXCLUDED.labels.map((l) => l.toLowerCase()));
  const hasExcludedLabel = (labels: string) =>
    labels
      .split(',')
      .map((l) => l.trim().toLowerCase())
      .some((l) => excludedLabels.has(l));
  const items = projectItems.filter(
    (i) => i.Type && !ignore.test(i.Title) && !hasExcludedLabel(i.Labels),
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
  for (const df of [bugs, feats])
    for (const issue of df) {
      const [area, method] = mapIssue(issue.Title, issue.Labels);
      issue.area = area;
      issue.map_method = method;
    }

  // Matrix by area
  const bugsBy = countBy(bugs, (b) => b.area!);
  const openBy = countBy(
    bugs.filter((b) => !b.Closed),
    (b) => b.area!,
  );
  const featsBy = countBy(feats, (f) => f.area!);
  const testsBy = countBy(tests, (t) => t.area);
  const autoBy = countBy(
    tests.filter((t) => t.is_automated),
    (t) => t.area,
  );

  const allAreas = new Set<string>([
    ...rootNames,
    ...bugsBy.keys(),
    ...featsBy.keys(),
  ]);
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

  // Monthly trend
  const month = (iso: string) => iso.slice(0, 7);
  const createdBy = countBy(bugs, (b) => month(b.Created));
  const closedBy = countBy(
    bugs.filter((b) => b.Closed),
    (b) => month(b.Closed!),
  );
  const months = [...new Set([...createdBy.keys(), ...closedBy.keys()])].sort();
  const trend = months.map((month) => ({
    month,
    created: createdBy.get(month) ?? 0,
    closed: closedBy.get(month) ?? 0,
  }));

  // Outputs
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

  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10); // YYYY-MM-DD, used as a filename prefix for daily runs
  const data = {
    kpi: {
      automated_tests: tests.filter((t) => t.is_automated).length,
      total_inventory: [...inventory.values()].reduce((a, b) => a + b, 0),
      bugs: bugs.length,
      open_bugs: bugs.filter((b) => !b.Closed).length,
      features: feats.length,
    },
    areas: rows,
    trend,
    medians: { bugs: medBugs, tests: medTests },
    generated_at: now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
  };
  const template = fs.readFileSync(
    path.join(HERE, 'dashboard_template.html'),
    'utf-8',
  );
  const dashboardFilename = `${dateStamp}-penpot-qa-dashboard.html`;
  fs.writeFileSync(
    path.join(OUT, dashboardFilename),
    template.replace('__DATA__', JSON.stringify(data)),
  );

  console.log(`\n✔ Generated in ${OUT}/`);
  const w = Math.max(...rows.map((r) => r.area.length));
  for (const r of rows)
    console.log(
      `${r.area.padEnd(w)}  auto:${String(r.automated).padStart(4)}  bugs:${String(r.bugs).padStart(4)}  ${r.decision}`,
    );
}

// ---------------------------------------------------------------------------
async function main() {
  if (!QASE_TOKEN) die('Missing QASE_TOKEN environment variable');
  if (!GH_TOKEN)
    die('Missing GITHUB_TOKEN environment variable (PAT with read:project scope)');
  const { suites, cases } = await fetchQase();
  const items = await fetchGithubProject();
  build(suites, cases, items);
}

// Only run main() when invoked directly (allows importing build() in tests)
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  main().catch((e) => die(String(e?.stack ?? e)));
}
