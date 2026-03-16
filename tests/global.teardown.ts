import { request } from '@playwright/test';

const AUTOTEST_REGEX = /autotest/i;
const CONCURRENCY = 15;

export default async function globalTeardown() {
  console.log('🌍 Cleaning autotest teams via API...');

  const api = await request.newContext({
    baseURL: process.env.BASE_URL?.replace(/\/$/, ''),
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  });

  try {
    // Login
    const loginResponse = await api.post(
      '/api/rpc/command/login-with-password?_fmt=json',
      {
        data: {
          email: process.env.LOGIN_EMAIL,
          password: process.env.LOGIN_PWD,
        },
      },
    );

    if (!loginResponse.ok()) {
      throw new Error(`Login failed: ${loginResponse.status()}`);
    }

    console.log('✅ Logged in via API');

    // Fetch teams (GET request)
    const teamsResponse = await api.get('/api/rpc/command/get-teams?_fmt=json');

    if (!teamsResponse.ok()) {
      throw new Error(`Failed fetching teams: ${teamsResponse.status()}`);
    }

    const teams = await teamsResponse.json();

    const autotestTeams = teams.filter(
      (team: any) => !team.isDefault && AUTOTEST_REGEX.test(team.name),
    );

    console.log(`🧹 Found ${autotestTeams.length} autotest teams`);

    if (!autotestTeams.length) {
      console.log('✅ Nothing to clean');
      return;
    }

    // Delete with concurrency
    const queue = [...autotestTeams];

    const workers = Array.from({ length: CONCURRENCY }).map(async () => {
      while (queue.length) {
        const team = queue.pop();
        if (!team) return;

        try {
          const res = await api.post('/api/rpc/command/delete-team?_fmt=json', {
            data: { id: team.id },
          });

          if (!res.ok()) {
            console.warn(`⚠️ Failed deleting ${team.name}`);
            continue;
          }

          console.log(`🗑️ Deleted ${team.name}`);
        } catch (err) {
          console.warn(`⚠️ Error deleting ${team.name}`, err);
        }
      }
    });

    await Promise.all(workers);

    console.log('✅ Global teardown complete');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  } finally {
    await api.dispose();
  }
}
