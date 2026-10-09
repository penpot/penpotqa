/**
 * Qase suite: Admin Console > Sidebar Menu > People > Members (tab) > Invite People (Button & Modal)
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
  'Admin Console > Sidebar Menu > People > Members (tab) > Invite People (Button & Modal)',
  () => {
    enterpriseActivatedPageTest(
      qase([3302], 'Invite users: add multiple valid emails to invitation list'),
      async ({ orgPage, adminConsolePage }) => {
        const orgName = createOrgName();
        const email1 = `pending1-${Date.now()}@demo.example.com`;
        const email2 = `pending2-${Date.now()}@demo.example.com`;

        await enterpriseActivatedPageTest.step(
          'Setup: create an Enterprise-activated organization',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
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

        await enterpriseActivatedPageTest.step(
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

    enterpriseActivatedPageTest(
      qase(
        [3308],
        'Invite users: pending invitations display email and date sent after sending',
      ),
      async ({ orgPage, adminConsolePage }) => {
        const orgName = createOrgName();
        const email = `pending-${Date.now()}@demo.example.com`;

        await enterpriseActivatedPageTest.step(
          'Setup: create an Enterprise-activated organization, and send an invitation',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.invitePersonToOrganization(email);
          },
        );

        await enterpriseActivatedPageTest.step(
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
