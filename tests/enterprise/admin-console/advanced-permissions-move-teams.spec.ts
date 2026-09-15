/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Move teams across organizations (Permission)
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
  'Admin Console > Sidebar Menu > Advanced Permissions > Move teams across organizations (Permission)',
  () => {
    demoAccountApiFixture.skip(
      qase(
        [3342],
        "Set team movement permission to 'Never allowed' and verify setting is autosaved",
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3342 for full detail):
         * 1. Advanced Permissions > Move Teams Across Organizations → 3 options visible
         * 2. Select 'Never allowed' → autosaved
         * 3. Reload page → value persists
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3343],
        "Set team movement permission to 'Only within my own organizations' and verify setting is autosaved",
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3343 for full detail):
         * 1. Advanced Permissions > Move Teams Across Organizations → 3 options visible
         * 2. Select 'Only within my own organizations' → autosaved
         * 3. Reload page → value persists
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3344],
        "Set team movement permission to 'Always allowed' and verify setting is autosaved",
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3344 for full detail):
         * 1. Advanced Permissions > Move Teams Across Organizations → 3 options visible
         * 2. Select 'Always allowed' → autosaved
         * 3. Reload page → value persists
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3345],
        "Restricted move attempt under 'Never allowed' shows modal with correct organization name",
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3345 for full detail):
         * 1. Team Settings > three-dot menu > "Change team organization" → blocking modal appears naming the org
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3346],
        "Restricted move attempt under 'Only within my own organizations' shows modal when moving from OrgD",
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3346 for full detail):
         * 1. Team Settings > three-dot menu > "Change team organization" → blocking modal appears
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3348],
        "Allowed move under 'Only within my own organizations' from OrgA to OrgB succeeds",
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3348 for full detail):
         * 1. Move a team from OrgA to OrgB → completes without restriction modal
         * 2. Team is now part of OrgB
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase([3349], "Allowed move under 'Always allowed' from OrgD to OrgA succeeds"),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3349 for full detail):
         * 1. Move a team from OrgD to OrgA → completes without restriction modal
         * 2. Team is now part of OrgA
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3626],
        "'Remove team from organization' is blocked under both restriction settings ('Never allowed' and 'Only within my own organizations')",
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3626 for full detail):
         * 1. Team Settings > 'Remove team from organization' under 'Never allowed' → blocking modal naming the org
         * 2. Org owner switches setting to 'Only within my own organizations', repeat → same blocking modal
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );
  },
);
