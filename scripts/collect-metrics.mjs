#!/usr/bin/env node
/**
 * GitHub Issues Quality Metrics Collector
 * ----------------------------------------
 * Pulls every issue from the target repo (default: penpot/penpot),
 * classifies bugs and feature areas, and writes an aggregated
 * metrics.json consumed by the static dashboard.
 *
 * Zero runtime dependencies. Requires Node >= 18 (global fetch).
 *
 * Usage:
 *   GITHUB_TOKEN=xxx node scripts/collect-metrics.mjs \
 *     [--repo penpot/penpot] [--out dashboard/data/metrics.json]
 *
 * The token only needs public read access; in GitHub Actions the
 * default GITHUB_TOKEN works. Unauthenticated also works but the
 * rate limit (60 req/h) is too low for ~10k issues.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- config
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);

const REPO = args.repo ?? 'penpot/penpot';
const OUT = args.out ?? join(__dirname, '..', 'dashboard', 'data', 'metrics.json');
const TOKEN = process.env.GITHUB_TOKEN ?? '';
const API = `https://api.github.com/repos/${REPO}/issues`;

// Labels that identify a bug when the issue "type" field is absent.
const BUG_LABELS = new Set(['bug', 'regression']);
// Labels excluded from bug stats even if labelled bug.
const INVALID_LABELS = new Set(['invalid', 'duplicate', 'wontfix']);

const featureMap = JSON.parse(
  readFileSync(join(__dirname, 'feature-map.json'), 'utf8'),
);
// Pre-compile the title regexes once.
const featureRules = featureMap.features.map((f) => ({
  name: f.name,
  labels: new Set((f.labels ?? []).map((l) => l.toLowerCase())),
  title: (f.title ?? []).map((p) => new RegExp(p, 'i')),
}));

// ---------------------------------------------------------------- fetch
async function fetchAllIssues() {
  const issues = [];
  let page = 1;
  for (;;) {
    const url = `${API}?state=all&per_page=100&page=${page}&sort=created&direction=asc`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
    });
    if (res.status === 403 || res.status === 429) {
      const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
      const wait = Math.max(reset - Date.now(), 5000);
      console.warn(`Rate limited; sleeping ${Math.round(wait / 1000)}s…`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    }
    const batch = await res.json();
    // The issues endpoint also returns PRs — drop them.
    const onlyIssues = batch.filter((i) => !i.pull_request);
    issues.push(...onlyIssues);
    process.stdout.write(`\rFetched page ${page} (${issues.length} issues)…`);
    if (batch.length < 100) break;
    page++;
  }
  console.log();
  return issues;
}

// ---------------------------------------------------------------- classify
const labelNames = (issue) =>
  issue.labels.map((l) => (typeof l === 'string' ? l : l.name).toLowerCase());

function isBug(issue) {
  const labels = labelNames(issue);
  if (labels.some((l) => INVALID_LABELS.has(l))) return false;
  if (issue.type?.name?.toLowerCase() === 'bug') return true;
  if (labels.some((l) => BUG_LABELS.has(l))) return true;
  if (/^\s*(🐛|\[bug\])/i.test(issue.title)) return true;
  return false;
}

function featureOf(issue) {
  const labels = labelNames(issue);
  for (const rule of featureRules) {
    if (labels.some((l) => rule.labels.has(l))) return rule.name;
  }
  for (const rule of featureRules) {
    if (rule.title.some((re) => re.test(issue.title))) return rule.name;
  }
  return featureMap.fallback;
}

// ---------------------------------------------------------------- helpers
const DAY = 86400000;
const daysBetween = (a, b) => (new Date(b) - new Date(a)) / DAY;
const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const isoWeekStart = (d) => {
  const date = new Date(d);
  const day = (date.getUTCDay() + 6) % 7; // Monday = 0
  date.setUTCDate(date.getUTCDate() - day);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
};
const monthOf = (d) => new Date(d).toISOString().slice(0, 7);

// ---------------------------------------------------------------- main
const now = new Date();
const issues = await fetchAllIssues();
const bugs = issues.filter(isBug).map((i) => ({
  number: i.number,
  title: i.title,
  state: i.state,
  created_at: i.created_at,
  closed_at: i.closed_at,
  labels: labelNames(i),
  milestone: i.milestone?.title ?? null,
  feature: featureOf(i),
}));

console.log(`Total issues: ${issues.length} — classified as bugs: ${bugs.length}`);

const openBugs = bugs.filter((b) => b.state === 'open');
const closedBugs = bugs.filter((b) => b.closed_at);
const since90 = new Date(now - 90 * DAY);
const since30 = new Date(now - 30 * DAY);

// --- by feature ---------------------------------------------------------
const featureNames = [...featureRules.map((f) => f.name), featureMap.fallback];
const byFeature = featureNames
  .map((name) => {
    const all = bugs.filter((b) => b.feature === name);
    const open = all.filter((b) => b.state === 'open');
    const opened90 = all.filter((b) => new Date(b.created_at) >= since90);
    const closed90 = all.filter(
      (b) => b.closed_at && new Date(b.closed_at) >= since90,
    );
    const closeTimes = all
      .filter((b) => b.closed_at)
      .map((b) => daysBetween(b.created_at, b.closed_at));
    return {
      feature: name,
      openBugs: open.length,
      totalBugs: all.length,
      opened90d: opened90.length,
      closed90d: closed90.length,
      medianDaysToClose:
        median(closeTimes) !== null ? +median(closeTimes).toFixed(1) : null,
      oldestOpenDays: open.length
        ? Math.round(Math.max(...open.map((b) => daysBetween(b.created_at, now))))
        : 0,
    };
  })
  .filter((f) => f.totalBugs > 0)
  .sort((a, b) => b.openBugs - a.openBugs);

// --- weekly trend (last 52 weeks) ---------------------------------------
const weeks = [];
for (let i = 51; i >= 0; i--) {
  weeks.push(isoWeekStart(new Date(now - i * 7 * DAY)));
}
const weekly = weeks.map((w) => ({ week: w, opened: 0, closed: 0 }));
const weekIndex = new Map(weeks.map((w, i) => [w, i]));
for (const b of bugs) {
  const wo = weekIndex.get(isoWeekStart(b.created_at));
  if (wo !== undefined) weekly[wo].opened++;
  if (b.closed_at) {
    const wc = weekIndex.get(isoWeekStart(b.closed_at));
    if (wc !== undefined) weekly[wc].closed++;
  }
}
// Net open backlog at the end of each week (computed from full history).
let backlogStart = bugs.filter(
  (b) =>
    new Date(b.created_at) < new Date(weeks[0]) &&
    (!b.closed_at || new Date(b.closed_at) >= new Date(weeks[0])),
).length;
let running = backlogStart;
for (const w of weekly) {
  running += w.opened - w.closed;
  w.netOpen = running;
}

// --- monthly MTTR (last 12 months) --------------------------------------
const monthlyMTTR = [];
for (let i = 11; i >= 0; i--) {
  const m = monthOf(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)),
  );
  const closedInMonth = closedBugs.filter((b) => monthOf(b.closed_at) === m);
  const times = closedInMonth.map((b) => daysBetween(b.created_at, b.closed_at));
  monthlyMTTR.push({
    month: m,
    medianDays: median(times) !== null ? +median(times).toFixed(1) : null,
    closed: closedInMonth.length,
  });
}

// --- aging buckets of open bugs ------------------------------------------
const aging = { '0-7d': 0, '8-30d': 0, '31-90d': 0, '91-365d': 0, '>1y': 0 };
for (const b of openBugs) {
  const age = daysBetween(b.created_at, now);
  if (age <= 7) aging['0-7d']++;
  else if (age <= 30) aging['8-30d']++;
  else if (age <= 90) aging['31-90d']++;
  else if (age <= 365) aging['91-365d']++;
  else aging['>1y']++;
}

// --- headline KPIs --------------------------------------------------------
const opened30 = bugs.filter((b) => new Date(b.created_at) >= since30).length;
const closed30 = bugs.filter(
  (b) => b.closed_at && new Date(b.closed_at) >= since30,
).length;
const closed90Times = closedBugs
  .filter((b) => new Date(b.closed_at) >= since90)
  .map((b) => daysBetween(b.created_at, b.closed_at));
const bugs90 = bugs.filter((b) => new Date(b.created_at) >= since90);
const regressions90 = bugs90.filter((b) => b.labels.includes('regression')).length;

const totals = {
  openBugs: openBugs.length,
  totalBugsAllTime: bugs.length,
  opened30d: opened30,
  closed30d: closed30,
  netChange30d: opened30 - closed30,
  medianDaysToClose90d:
    median(closed90Times) !== null ? +median(closed90Times).toFixed(1) : null,
  regressionShare90d: bugs90.length
    ? +((regressions90 / bugs90.length) * 100).toFixed(1)
    : 0,
  releaseBlockersOpen: openBugs.filter((b) => b.labels.includes('release blocker'))
    .length,
  needsTriageOpen: openBugs.filter((b) => b.labels.includes('needs triage')).length,
  unclassifiedShare: bugs.length
    ? +(
        (bugs.filter((b) => b.feature === featureMap.fallback).length /
          bugs.length) *
        100
      ).toFixed(1)
    : 0,
};

// --- top open offenders ----------------------------------------------------
const oldestOpen = [...openBugs]
  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  .slice(0, 10)
  .map((b) => ({
    number: b.number,
    title: b.title,
    feature: b.feature,
    ageDays: Math.round(daysBetween(b.created_at, now)),
    releaseBlocker: b.labels.includes('release blocker'),
  }));

const metrics = {
  generatedAt: now.toISOString(),
  repo: REPO,
  totals,
  byFeature,
  weekly,
  monthlyMTTR,
  aging,
  oldestOpen,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(metrics, null, 2));
console.log(`Wrote ${OUT}`);
