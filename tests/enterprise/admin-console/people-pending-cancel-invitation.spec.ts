/**
 * Qase suite: Admin Console > Sidebar Menu > People > Pending (tab) > Cancel Invitation
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) — these
 * cases don't exercise the checkout UI itself, so the account is
 * Enterprise-entitled via the activation-code path (PRE/dev only) instead
 * of a real Stripe checkout.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > People > Pending (tab) > Cancel Invitation',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3185],
        'Cancel a pending invitation via Cancel button shows confirmation modal',
      ),
      async ({ orgPage, adminConsolePage }) => {
        const orgName = createOrgName();
        const email = `pending-${Date.now()}@demo.example.com`;

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization, and send a pending invitation',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.invitePersonToOrganization(email);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Locate the pending invitation and click Cancel → confirmation modal names the invitee',
          async () => {
            await adminConsolePage.openPendingTab();
            await adminConsolePage.openCancelPendingInvitationDialog(email);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Confirm → success message, and the invitation no longer appears',
          async () => {
            await adminConsolePage.confirmCancelPendingInvitation();
            await adminConsolePage.isPendingInvitationListed(email, false);
          },
        );
      },
    );
  },
);
