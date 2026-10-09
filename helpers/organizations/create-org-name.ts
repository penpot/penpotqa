const ORG_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let orgCounter = 0;

/** A, B, C... per call, wrapping after Z — debug-readability only, not a
 * uniqueness guarantee. Scoped per worker process, not per test. */
function nextOrgLabel(): string {
  const label = ORG_LABELS[orgCounter % ORG_LABELS.length];
  orgCounter += 1;
  return label;
}

export function createOrgName(prefix = 'at'): string {
  const runId = process.env.TEST_RUN_ID;
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, '');

  // Lowercase — the backend lowercases org names for its URL slug anyway,
  // so a mixed-case name here just invites case-mismatch bugs wherever a
  // test compares it against that slug.
  return `${prefix}-organization-${nextOrgLabel()}-${date}-${runId}`.toLowerCase();
}
