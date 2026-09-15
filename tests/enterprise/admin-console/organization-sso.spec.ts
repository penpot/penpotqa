/**
 * Qase suite: Admin Console > Sidebar Menu > Organization SSO
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
  'Admin Console > Sidebar Menu > Organization SSO',
  () => {
    demoAccountApiFixture.skip(
      qase([3527], 'Activate SSO, test connection passes'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3527 for full detail):
         * 1. Fill mandatory SSO fields with a valid config, click "Activate SSO" → confirmation modal
         * 2. Confirm → test connection passes, "SSO is enabled for OrgA" notification, form shows applied config + Deactivate button, notification email sent to the owner
         *
         * Accounts: different from the invitee cases elsewhere in this suite —
         * here it's the ORG OWNER's own inbox that must be read (step 2), and
         * the owner also has to own an Enterprise-plan org, so this can't be
         * solved with createDemoUser() (unreadable inbox) or createInviteEmail()
         * (that helper is for invite targets, not for provisioning an org
         * owner). Needs an org owner with a real, readable inbox — no current
         * helper provides both a real inbox and org ownership together.
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase([3535], 'Existing sessions at activation go to login SSO'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3535 for full detail):
         * 1. Activate SSO for OrgA → "SSO is enabled" notification
         * 2. A member with an existing session/open file suffers an immediate hard cutoff and is sent through SSO login
         *
         * Accounts: owner and member → createDemoUser() for both; no email is
         * read in this case (only the owner-inbox notification from PENPOT-3527
         * needs a real inbox, not this one).
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(qase([3587], 'Deactivate SSO'), async ({ page }) => {
      /**
       * Qase steps (see PENPOT-3587 for full detail):
       * 1. Click "Deactivate SSO" → confirmation modal opens
       * 2. Confirm → "SSO is disabled for OrgA" notification
       * 3. A member logs in and can access OrgA’s teams normally
       *
       * Accounts: owner and member → createDemoUser() for both; no email
       * reading involved.
       */
      // TODO: automate — see automation plan (not yet unblocked, or not yet reached
      // in the implementation order from section 4).
    });
  },
);
