import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';

const RUN_ID_FILE = '.test-run-id';

export default async function globalSetup(): Promise<void> {
  const runId = process.env.TEST_RUN_ID ?? randomUUID().slice(0, 8);

  process.env.TEST_RUN_ID = runId;
  writeFileSync(RUN_ID_FILE, runId, 'utf-8');

  console.log(`🧪 Test Run ID: ${runId}`);
}
