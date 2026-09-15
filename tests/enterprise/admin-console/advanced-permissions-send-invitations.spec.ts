/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Send invitations (Permission)
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
  'Admin Console > Sidebar Menu > Advanced Permissions > Send invitations (Permission)',
  () => {
    demoAccountApiFixture.skip(
      qase([3359], 'Team owner can invite members under default configuration'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3359 for full detail):
         * 1. Team > Members > Invitations → invite option available to owner
         * 2. Click INVITE PEOPLE → invitation flow starts
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase([3360], 'Team admin can invite members under default configuration'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3360 for full detail):
         * 1. Team > Members > Invitations → invite option available to admin
         * 2. Click INVITE PEOPLE → invitation flow starts
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase([3361], 'Switch invitation permission setting to Team owners only'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3361 for full detail):
         * 1. OrgA > Advanced Permissions → Send invitations settings shown
         * 2. Select "Team owners only" → selected and applied
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase([3362], 'Team owners only setting restricts team admins from inviting'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3362 for full detail):
         * 1. Team > Members > Invitations as a team admin → no invite button, permission message shown instead
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3364],
        'Restricted team admin cannot manage invitations under Team owners only, only preview',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3364 for full detail):
         * 1. Team > Members > Invitations as team admin → permission message shown
         * 2. Attempt to edit an existing invitation → no role dropdown, resend/delete/copy-link controls all absent
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );
  },
);
