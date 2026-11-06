import { randomUUID } from 'crypto';

// Gives every run an ID that createTeamName/createOrgName append to the names
// they generate. Playwright passes env vars set here on to the workers.
export default async function globalSetup(): Promise<void> {
  const runId = process.env.TEST_RUN_ID ?? randomUUID().slice(0, 8);

  process.env.TEST_RUN_ID = runId;

  console.log(`🧪 Test Run ID: ${runId}`);
}
