/**
 * Qase suite: Admin Console > Sidebar Menu > People > Members (tab) > Invite People (Button & Modal)
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
  'Admin Console > Sidebar Menu > People > Members (tab) > Invite People (Button & Modal)',
  () => {
    enterprisePageTest(
      qase([3302], 'Invite users: add multiple valid emails to invitation list'),
      async ({ orgPage, adminConsolePage, stripePage }) => {
        const orgName = createOrgName();
        const email1 = `pending1-${Date.now()}@demo.example.com`;
        const email2 = `pending2-${Date.now()}@demo.example.com`;

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise and create an organization',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
          },
        );

        await enterprisePageTest.step(
          'Admin Console > Members > Invite people → add several valid emails → all appear in the invitation list',
          async () => {
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.openInvitePeopleModal();
            await adminConsolePage.addEmailToInviteList(email1);
            await adminConsolePage.addEmailToInviteList(email2);
            await adminConsolePage.isEmailInInviteList(email1);
            await adminConsolePage.isEmailInInviteList(email2);
          },
        );

        await enterprisePageTest.step(
          'Send the invites → both become pending invitations',
          async () => {
            await adminConsolePage.sendInvites();
            await adminConsolePage.openPendingTab();
            await adminConsolePage.isPendingInvitationListed(email1);
            await adminConsolePage.isPendingInvitationListed(email2);
          },
        );
      },
    );

    enterprisePageTest(
      qase(
        [3308],
        'Invite users: pending invitations display email and date sent after sending',
      ),
      async ({ orgPage, adminConsolePage, stripePage }) => {
        const orgName = createOrgName();
        const email = `pending-${Date.now()}@demo.example.com`;

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise, create an organization, and send an invitation',
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
          'Pending invitations section → the entry shows the invited email and a date sent',
          async () => {
            await adminConsolePage.openPendingTab();
            await adminConsolePage.isPendingInvitationListed(email);
            await adminConsolePage.hasPendingInvitationDateAdded(email);
          },
        );
      },
    );
  },
);
