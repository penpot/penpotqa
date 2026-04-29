import { randomUUID } from 'crypto';

export default async function globalSetup(): Promise<void> {
  const runId = randomUUID().slice(0, 8);

  process.env.TEST_RUN_ID = runId;

  console.log(`🧪 Test Run ID: ${runId}`);
}
