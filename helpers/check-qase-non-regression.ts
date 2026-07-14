/**
 * Check Qase test cases and print only non-regression ones.
 *
 * Qase test case types:
 * - 0: Not set
 * - 1: Other
 * - 2: Smoke
 * - 3: Regression
 * - 4: Security
 * - 5: Usability
 * - 6: Performance
 * - 7: Acceptance
 * - 8: Functional
 * - 9: Compatibility
 * - 10: Integration
 * - 11: Exploratory
 *
 * Usage: npx ts-node helpers/check-qase-non-regression.ts
 * from the root of the project.
 *
 * After running the script you will see the output in the console,
 * showing the test case IDs and their status (NON-REGRESSION or NOT FOUND).
 */
import { config } from 'dotenv';
import { QaseApi } from 'qaseio';

config();

/** Qase API token. Get one at https://app.qase.io/user/api/token */
const TOKEN = process.env.QASE_TOKEN;
if (!TOKEN) {
  console.error('QASE_TOKEN not set in .env');
  process.exit(1);
}

const api = new QaseApi({ token: TOKEN });
const projectCode = 'PENPOT';

/** Qase test case IDs to check */
const IDS: number[] = [
  // Fill this array with Qase test case IDs to check
];

(async () => {
  if (IDS.length === 0) {
    console.error('No IDs to check. Fill the IDS array.');
    process.exit(1);
  }

  for (const id of IDS) {
    try {
      const res = await api.cases.getCase(projectCode, id);
      const tc = res.data?.result;
      if (!tc) {
        console.log(`PENPOT-${id}: NOT FOUND`);
        continue;
      }
      /** Type 3 = Regression, skip it */
      if (tc.type === 3) continue;
      console.log(`PENPOT-${id}: NON-REGRESSION`);
    } catch (e: any) {
      console.log(`PENPOT-${id}: ERROR — ${e.message}`);
    }
  }
})();
