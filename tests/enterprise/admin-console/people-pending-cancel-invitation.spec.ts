/**
 * Qase suite: Admin Console > Sidebar Menu > People > Pending (tab) > Cancel Invitation
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterprisePageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeTest` for cases needing a real second account.
 * Per-case "Accounts:" notes cover invitees needing a real, readable
 * inbox instead (see the enterprise-demo-account-email memory).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Admin Console > Sidebar Menu > People > Pending (tab) > Cancel Invitation',
  () => {
    enterprisePageTest(
      qase(
        [3185],
        'Cancel a pending invitation via Cancel button shows confirmation modal',
      ),
      async ({ orgPage, adminConsolePage, stripePage }) => {
        const orgName = createOrgName();
        const email = `pending-${Date.now()}@demo.example.com`;

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise, create an organization, and send a pending invitation',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.invitePersonToOrganization(email);
          },
        );

        await enterprisePageTest.step(
          'Locate the pending invitation and click Cancel → confirmation modal names the invitee',
          async () => {
            await adminConsolePage.openPendingTab();
            await adminConsolePage.openCancelPendingInvitationDialog(email);
          },
        );

        await enterprisePageTest.step(
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
