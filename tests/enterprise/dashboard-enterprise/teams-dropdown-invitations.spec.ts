/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Team Management Options > Invitations (Enterprise)
 *
 * Base: `ownerAndInviteeTest` for cases needing a real, existing Penpot
 * account as the invite target — a demo profile's inbox is unreadable (see
 * the enterprise-demo-account-email memory). `enterprisePageTest` for the
 * one case that only reads the invite record's own UI state.
 */
import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import {
  checkEnterpriseInviteSubject,
  checkEnterpriseInviteText,
  getMessageSubject,
  waitMessage,
  waitSecondMessage,
} from 'helpers/gmail';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import {
  enterprisePageTest,
  ownerAndInviteeTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Enterprise Dashboard > Teams Dropdown > Team Management Options > Invitations (Enterprise)',
  () => {
    ownerAndInviteeTest(
      qase(
        [3078, 3079, 3080],
        'Invite an existing Penpot user to a team, email content, and acceptance',
      ),
      async ({
        ownerPage,
        orgPage,
        adminConsolePage,
        stripePage,
        teamPage,
        invitee,
      }) => {
        // 3 cases' worth of setup + two real email waits no longer fit the
        // default per-test timeout, now that they share one test.
        ownerAndInviteeTest.setTimeout(150_000);

        const orgName = createOrgName();
        const teamName = createTeamName();

        await ownerAndInviteeTest.step(
          'Setup: subscribe to Enterprise and create an org with a team already in it',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
          },
        );

        await ownerAndInviteeTest.step(
          '3078: Team Settings > Invitations tab → invite the existing user → confirmation message',
          async () => {
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(invitee.email);
            await teamPage.clickSendInvitationButton();
            await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
          },
        );

        let invite: { inviteUrl: string; inviteText: string } | undefined;

        await ownerAndInviteeTest.step(
          "3079: Invitee's inbox → subject names the team, body names both the team and the organization",
          async () => {
            await waitSecondMessage(ownerPage, invitee.email, 40);
            const subject = await getMessageSubject(invitee.email);
            await checkEnterpriseInviteSubject(subject, teamName, orgName);

            invite = await waitMessage(ownerPage, invitee.email, 40);
            await checkEnterpriseInviteText(invite!.inviteText, teamName, orgName);
          },
        );

        await ownerAndInviteeTest.step(
          '3080: Invitee follows the invite link from their own inbox → success message, then listed as an org member',
          async () => {
            const inviteeDashboardPage = new DashboardPage(invitee.page);
            await invitee.page.goto(invite!.inviteUrl);
            await inviteeDashboardPage.isSuccessMessageDisplayed(
              'Joined the team successfully',
            );

            await orgPage.openOrgSwitcher();
            await orgPage.clickGoToAdminConsole();
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.isMemberListedInPeopleTable(invitee.name);
          },
        );
      },
    );

    enterprisePageTest(
      qase([3081], 'Pending invitation displays in Admin Console invitations list'),
      async ({ page, orgPage, adminConsolePage, stripePage, teamPage }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();
        const inviteeEmail = `pending-${Date.now()}@demo.example.com`;

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise, create an org with a team, and invite from the team',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(inviteeEmail);
            await teamPage.clickSendInvitationButton();
          },
        );

        await enterprisePageTest.step(
          'Admin Console > People > Members tab → members list and Invite people button shown',
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.clickGoToAdminConsole();
            await adminConsolePage.openPeopleTab();
          },
        );

        await enterprisePageTest.step(
          'Admin Console > People > Pending tab → the team-originated invitation is listed as a pending org invitation',
          async () => {
            // A team-originated invite takes longer to reach the org-level
            // Pending list than a direct org-level invite does.
            await expect(async () => {
              await page.reload();
              await adminConsolePage.openPendingTab();
              await adminConsolePage.isPendingInvitationListed(inviteeEmail);
            }).toPass({ timeout: 20000 });
          },
        );
      },
    );
  },
);
