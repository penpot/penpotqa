/**
 * Qase suites:
 * - Admin Console > Sidebar Menu > People > Members (tab) > Invite People (Button & Modal)
 * - Admin Console > Sidebar Menu > People > Pending (tab) > Cancel Invitation
 *
 * One flow: invite, check the pending list, then cancel one of the
 * invitations.
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
  'Admin Console > Sidebar Menu > People > Members (tab) > Invite People (Button & Modal)',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3302, 3308, 3185],
        'Invite several users, see the pending invitations with their date sent, and cancel one of them',
      ),
      async ({ orgPage, adminConsolePage }) => {
        const orgName = createOrgName();
        const email1 = `pending1-${Date.now()}@demo.example.com`;
        const email2 = `pending2-${Date.now()}@demo.example.com`;

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          '(3302) Admin Console > Members > Invite people → add several valid emails → all appear in the invitation list',
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

        await enterpriseActivatedPageTest.step(
          '(3308) Pending invitations section → each entry shows the invited email and a date sent',
          async () => {
            await adminConsolePage.hasPendingInvitationDateAdded(email1);
            await adminConsolePage.hasPendingInvitationDateAdded(email2);
          },
        );

        await enterpriseActivatedPageTest.step(
          '(3185) Locate a pending invitation and click Cancel → confirmation modal names the invitee',
          async () => {
            await adminConsolePage.openCancelPendingInvitationDialog(email2);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Confirm → success message, the invitation no longer appears, and the other one stays',
          async () => {
            await adminConsolePage.confirmCancelPendingInvitation();
            await adminConsolePage.isPendingInvitationListed(email2, false);
            await adminConsolePage.isPendingInvitationListed(email1);
          },
        );
      },
    );
  },
);
