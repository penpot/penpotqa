/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Change team organization
 *
 * PENPOT-3211, 3212 and 3213 are noted in Qase to be automated sequentially (each builds on the previous one’s end state) — keep them in this file, in this order, and consider test.describe.configure({ mode: 'serial' }) once implemented.
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
  'Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Change team organization',
  () => {
    demoAccountApiFixture.skip(
      qase([3211], 'Move a team to another organization within the same user'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3211 for full detail):
         * 1. Log in as User1, Team-Apple Settings shows OrgA as current org
         * 2. Three-dot menu > "Change team organization" → modal with "Move to" listing OrgB
         * 3. Select OrgB, confirm → move applied
         * 4. Team organization section shows OrgB, top nav shows OrgB, toast confirms move
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3212],
        'Move a team to an organization that belongs to a different user',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3212 for full detail):
         * 1. Log in as User1, Team-Apple Settings shows current org
         * 2. Settings page shows renderer control defaulted to legacy SVG (disabled)
         * 3. "Change team organization" → modal "Move to" lists OrgA and OrgC
         * 4. Select OrgC, confirm → move applied
         * 5. Team organization section shows OrgC, top nav shows OrgC, toast confirms move
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3213],
        'Team member viewing the dashboard sees the navigation update without refreshing',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3213 for full detail):
         * 1. As User1, move Team-Apple to OrgA
         * 2. As User2 (viewing the dashboard), without refreshing: top menu shows OrgA, Team-Apple selected under OrgA, toast confirms move
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );
  },
);
