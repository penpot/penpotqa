import { request } from '@playwright/test';

const AUTOTEST_REGEX = /autotest/i;
const CONCURRENCY = 15;
const MAX_RETRIES = 3;

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

async function deleteWithRetry(api: any, team: Team): Promise<boolean> {
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

export default async function globalTeardown() {
  const { BASE_URL, LOGIN_EMAIL, LOGIN_PWD, TEST_RUN_ID } = process.env;
  if (!BASE_URL || !LOGIN_EMAIL || !LOGIN_PWD || !TEST_RUN_ID)
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
    console.log('🌍 Cleaning autotest teams...');

    const teams: Team[] = await (await api.get(API.GET_TEAMS)).json();
    const targets = teams.filter(
      (t) =>
        !t.isDefault && AUTOTEST_REGEX.test(t.name) && t.name.includes(TEST_RUN_ID),
    );
    console.log(
      `🧹 Found ${targets.length} autotest team(s) for run ${TEST_RUN_ID}`,
    );

    if (!targets.length) {
      console.log(`✅ Nothing to clean up for run ${TEST_RUN_ID}`);
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
  }
}
