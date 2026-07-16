#!/usr/bin/env npx tsx
/**
 * Tallies per-Qase-ID flaky/failed occurrences from a single Playwright
 * results.json and merges them into a rolling flaky-history.json aggregate,
 * so the weekly github_dashboard build can cross-reference automated test
 * cases against the tests that are actually unreliable in CI.
 *
 * Meant to run once per daily regression run, right after results.json is
 * produced (see .github/workflows/playwright_pre_daily.yml), against the
 * previous flaky-history.json pulled from S3:
 *
 *   npx tsx scripts/github-dashboard/flaky-tally.ts \
 *     --results playwright-report/results.json \
 *     --history /tmp/flaky-history.json \
 *     --run-id "$GITHUB_RUN_ID" \
 *     --date "$(date -u +%F)" \
 *     --out /tmp/flaky-history.json
 *
 * Only tests that actually flaked or failed get an entry — a fully green
 * test never appears, so the file stays proportional to the tests that are
 * actually a problem rather than the full Qase inventory. Occurrences older
 * than --window-days are dropped on every merge, and a test is removed
 * entirely once it has no occurrences left in the window.
 *
 * Node 18+, no dependencies.
 */

import * as fs from 'node:fs';

// ---------- CLI ----------

function arg(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  console.error(`Missing --${name}`);
  process.exit(1);
}

const RESULTS_PATH = arg('results', 'playwright-report/results.json');
const HISTORY_PATH = arg('history', ''); // existing aggregate to merge into, if any
const OUT_PATH = arg('out', 'flaky-history.json');
const RUN_ID = arg('run-id', '');
const DATE = arg('date', new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
const WINDOW_DAYS = Number(arg('window-days', '30'));

// ---------- Types ----------

interface Occurrence {
  date: string; // YYYY-MM-DD
  run_id: string;
  status: 'flaky' | 'failed';
}
interface TestHistory {
  title: string;
  occurrences: Occurrence[]; // chronological, oldest first
}
type History = Record<string, TestHistory>; // keyed by Qase id (string)

interface TodayResult {
  qaseId: string;
  title: string;
  status: 'flaky' | 'failed';
}

// ---------- Parse Playwright JSON (failures/flaky only — same shape as triage.ts) ----------

function walkSuites(suite: any, out: TodayResult[]) {
  for (const child of suite.suites ?? []) walkSuites(child, out);
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const results = test.results ?? [];
      const last = results[results.length - 1];
      if (!last) continue;

      const everFailed = results.some(
        (attempt: any) =>
          attempt.status === 'failed' || attempt.status === 'timedOut',
      );
      const finallyPassed = last.status === 'passed';
      const isFailure = test.status === 'unexpected';
      const isFlaky = test.status === 'flaky' || (everFailed && finallyPassed);
      if (!isFailure && !isFlaky) continue;

      const qaseId = extractQaseId(spec.title, test.annotations ?? []);
      if (!qaseId) continue; // not linked to a Qase case, nothing to cross-reference

      out.push({
        qaseId,
        title: spec.title,
        status: isFlaky && !isFailure ? 'flaky' : 'failed',
      });
    }
  }
}

/**
 * Qase links live either in annotations ({type:'QaseID', description:'123'},
 * added by qase() / playwright-qase-reporter) or in the title itself
 * ("... (Qase ID: 123)" suffix, or a "PROJ-123:" prefix convention).
 * Mirrors the same extraction in triage.ts.
 */
function extractQaseId(
  title: string,
  annotations: Array<{ type?: string; description?: string }>,
): string | undefined {
  const qaseAnnotation = annotations.find((annotation) =>
    /qase/i.test(annotation?.type ?? ''),
  );
  if (qaseAnnotation?.description) return String(qaseAnnotation.description);
  const titleMatch =
    title.match(/\(\s*Qase(?:\s*ID)?\s*[:=]?\s*([\w-]+)\s*\)/i) ??
    title.match(/^([A-Z][A-Z0-9]+-\d+)\s*[:.]/);
  return titleMatch?.[1];
}

// ---------- Merge ----------

function loadHistory(historyPath: string): History {
  if (!historyPath || !fs.existsSync(historyPath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    return parsed.tests ?? {};
  } catch {
    console.warn(
      `Could not parse existing history at ${historyPath}, starting fresh`,
    );
    return {};
  }
}

// Adds today's results to the history, then drops occurrences older than the
// window and any test left with none.
function mergeHistory(history: History, todayResults: TodayResult[]): History {
  for (const todayResult of todayResults) {
    const testHistory = history[todayResult.qaseId] ?? {
      title: todayResult.title,
      occurrences: [],
    };
    testHistory.title = todayResult.title; // keep title in sync if it was renamed
    testHistory.occurrences.push({
      date: DATE,
      run_id: RUN_ID,
      status: todayResult.status,
    });
    history[todayResult.qaseId] = testHistory;
  }

  const cutoffDate = new Date(DATE);
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - WINDOW_DAYS);
  const cutoffDateStr = cutoffDate.toISOString().slice(0, 10);

  const merged: History = {};
  for (const [qaseId, testHistory] of Object.entries(history)) {
    const recentOccurrences = testHistory.occurrences.filter(
      (occurrence) => occurrence.date >= cutoffDateStr,
    );
    if (recentOccurrences.length > 0)
      merged[qaseId] = { title: testHistory.title, occurrences: recentOccurrences };
  }
  return merged;
}

// ---------- Entry point ----------

function main() {
  const resultsJson = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
  const todayResults: TodayResult[] = [];
  for (const suite of resultsJson.suites ?? []) walkSuites(suite, todayResults);

  const history = mergeHistory(loadHistory(HISTORY_PATH), todayResults);

  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        window_days: WINDOW_DAYS,
        tests: history,
      },
      null,
      2,
    ),
  );

  const flakyCount = todayResults.filter(
    (result) => result.status === 'flaky',
  ).length;
  const failedCount = todayResults.filter(
    (result) => result.status === 'failed',
  ).length;
  console.log(
    `✔ ${OUT_PATH}: ${flakyCount} flaky + ${failedCount} failed today, ${Object.keys(history).length} tests tracked in the last ${WINDOW_DAYS}d`,
  );
}

main();
