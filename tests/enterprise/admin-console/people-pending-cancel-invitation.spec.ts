/**
 * Qase suite: Admin Console > Sidebar Menu > People > Pending (tab) > Cancel Invitation
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeActivatedTest` for cases needing a real second account.
 * Per-case "Accounts:" notes cover invitees needing a real, readable
 * inbox instead (see the enterprise-demo-account-email memory).
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
          'Setup: create an Enterprise-activated organization, and send a pending invitation',
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
