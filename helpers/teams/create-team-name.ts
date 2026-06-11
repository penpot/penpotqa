import { random } from 'helpers/string-generator';

export function createTeamName(): string {
  const runId = process.env.TEST_RUN_ID;
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, '');

  return `at-${random()}${date}-${runId}`;
}
