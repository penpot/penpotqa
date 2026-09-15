/**
 * Qase suite: Enterprise Dashboard > Organizations Dropdown > Organization Management > Leave Org
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base fixture: `demoAccountApiFixture` (does NOT grant Enterprise
 * entitlement by itself — see enterprise-fixtures.ts's `enterprisePageTest`/
 * `ownerAndInviteeTest`). Per-case "Accounts:" notes cover invitees
 * needing a real, readable inbox instead (see the
 * enterprise-demo-account-email memory).
 */
import { demoAccountApiFixture } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

demoAccountApiFixture.describe(
  'Enterprise Dashboard > Organizations Dropdown > Organization Management > Leave Org',
  () => {
    demoAccountApiFixture.skip(
      qase([3120], 'Team owner leaves organization with other members'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3120 for full detail):
         * 1. Navigate to organizations list
         * 2. Click leave trigger next to OrgA
         * 3. Confirmation modal asks to choose a new owner for Team-Coconut
         * 4. User7 (admin) suggested as default new owner
         * 5. New owner can be selected from team members
         * 6. Confirm leaving → redirected to Personal Projects in the ghost organization
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase([3123], 'Team ownership is transferred when owner leaves'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3123 for full detail):
         * 1. Navigate to Team-Coconut settings
         * 2. Check the team owner section
         * 3. User7 is shown as the current owner of Team-Coconut
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase([3127], 'User is redirected to ghost organization dashboard'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3127 for full detail):
         * 1. Confirm leaving the organization
         * 2. Wait for page redirect
         * 3. User lands on Personal Projects dashboard in the ghost organization
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );
  },
);
