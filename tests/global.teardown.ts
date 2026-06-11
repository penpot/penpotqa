import { request } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { readFileSync, unlinkSync, existsSync } from 'fs';

const AUTOTEST_REGEX = /^at-/;
const CONCURRENCY = 15;
const MAX_RETRIES = 3;
const RUN_ID_FILE = '.test-run-id';

const API = {
  LOGIN: '/api/rpc/command/login-with-password?_fmt=json',
  GET_TEAMS: '/api/rpc/command/get-teams?_fmt=json',
  DELETE_TEAM: '/api/rpc/command/delete-team?_fmt=json',
} as const;

interface Team {
  id: string;
  name: string;
  isDefault: boolean;
}

/**
 * Attempts to delete a team via the API, retrying up to MAX_RETRIES times
 * on network failures or non-ok responses.
 *
 * @returns true if the team was deleted successfully, false if all attempts failed
 */
async function deleteWithRetry(
  api: APIRequestContext,
  team: Team,
): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await api.post(API.DELETE_TEAM, { data: { id: team.id } });
      if (res.ok()) return true;
    } catch {
      // network hiccup — retry
    }
    if (attempt < MAX_RETRIES)
      console.warn(`⚠️ Retry ${attempt}/${MAX_RETRIES} for "${team.name}"`);
  }
  return false;
}

/**
 * Resolves the TEST_RUN_ID to use for scoped cleanup.
 *
 * Priority:
 *  1. process.env.TEST_RUN_ID — set by CI or propagated from globalSetup
 *  2. .test-run-id file — written by globalSetup as a fallback for
 *     cases where env vars don't persist across Node processes (e.g. Playwright workers)
 *
 * @returns the run ID string, or undefined if neither source is available
 */
function resolveRunId(): string | undefined {
  if (process.env.TEST_RUN_ID) return process.env.TEST_RUN_ID;
  if (existsSync(RUN_ID_FILE)) return readFileSync(RUN_ID_FILE, 'utf-8').trim();
  return undefined;
}

/**
 * Filters the full list of teams down to those that should be deleted.
 *
 * Two modes:
 *  - Full cleanup (FULL_CLEANUP=true): deletes all non-default teams matching
 *    the `at-` prefix, regardless of run. Use for manual recovery or nightly CI jobs.
 *  - Scoped cleanup (default): deletes only teams from the current run,
 *    matched by both the `at-` prefix and the TEST_RUN_ID suffix.
 */
function resolveTargets(
  teams: Team[],
  isFullCleanup: boolean,
  runId?: string,
): Team[] {
  if (isFullCleanup)
    return teams.filter((t) => !t.isDefault && AUTOTEST_REGEX.test(t.name));

  return teams.filter(
    (t) =>
      !t.isDefault &&
      AUTOTEST_REGEX.test(t.name) &&
      !!runId &&
      t.name.includes(runId),
  );
}

/**
 * Global teardown — runs once after all Playwright tests complete.
 *
 * Deletes autotest teams created during the test run to keep the environment clean.
 * Supports two cleanup modes controlled by env vars:
 *
 *  - Default: scoped to the current TEST_RUN_ID (safe for parallel CI runs)
 *  - FULL_CLEANUP=true: deletes all `at-` prefixed teams across all runs
 *
 * Teams are deleted in parallel batches (CONCURRENCY) with per-team retry
 * logic (MAX_RETRIES). Any teams that fail all retries are reported and
 * cause the teardown to throw so the failure is visible in CI.
 */
export default async function globalTeardown() {
  const { BASE_URL, LOGIN_EMAIL, LOGIN_PWD, FULL_CLEANUP } = process.env;
  const isFullCleanup = FULL_CLEANUP === 'true';
  const TEST_RUN_ID = resolveRunId();

  if (!BASE_URL || !LOGIN_EMAIL || !LOGIN_PWD || (!TEST_RUN_ID && !isFullCleanup))
    throw new Error(
      'Missing env vars: BASE_URL, LOGIN_EMAIL, LOGIN_PWD, TEST_RUN_ID',
    );

  const api = await request.newContext({
    baseURL: BASE_URL.replace(/\/$/, ''),
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });

  try {
    const loginRes = await api.post(API.LOGIN, {
      data: { email: LOGIN_EMAIL, password: LOGIN_PWD },
    });
    if (!loginRes.ok()) throw new Error(`Login failed: ${loginRes.status()}`);

    console.log(
      isFullCleanup
        ? '🌍 Full cleanup mode — deleting ALL autotest teams...'
        : `🌍 Cleaning autotest teams for run ${TEST_RUN_ID}...`,
    );

    const teamsRes = await api.get(API.GET_TEAMS);
    if (!teamsRes.ok()) throw new Error(`Get teams failed: ${teamsRes.status()}`);
    const teams: Team[] = await teamsRes.json();

    const targets = resolveTargets(teams, isFullCleanup, TEST_RUN_ID);

    console.log(
      isFullCleanup
        ? `🧹 Found ${targets.length} autotest team(s) across all runs`
        : `🧹 Found ${targets.length} autotest team(s) for run ${TEST_RUN_ID}`,
    );

    if (!targets.length) {
      console.log('✅ Nothing to clean up');
      return;
    }

    const failed: string[] = [];
    for (let i = 0; i < targets.length; i += CONCURRENCY) {
      await Promise.all(
        targets.slice(i, i + CONCURRENCY).map(async (team) => {
          const ok = await deleteWithRetry(api, team);
          ok ? console.log(`🗑️ Deleted "${team.name}"`) : failed.push(team.name);
        }),
      );
    }

    if (failed.length)
      throw new Error(
        `Failed to delete ${failed.length} team(s): ${failed.join(', ')}`,
      );

    console.log('✅ Teardown complete');
  } finally {
    await api.dispose();
    // Remove the run ID file to avoid stale fallback on subsequent runs
    if (existsSync(RUN_ID_FILE)) unlinkSync(RUN_ID_FILE);
  }
}
