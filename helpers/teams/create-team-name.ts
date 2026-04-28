import { random } from 'helpers/string-generator';

export function createTeamName(prefix = 'autotest'): string {
  const runId = process.env.TEST_RUN_ID;

  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');

  return `${prefix}-${random()}-${date}-${runId}`;
}
