/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Change team organization
 *
 * PENPOT-3211/3212/3213 merged into one test (Qase notes them sequential).
 * User1/User2 are real accounts (need readable inboxes); this test's own demo account owns OrgC.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { waitMessage, waitSecondMessage } from 'helpers/gmail';
import { createInviteeSession } from 'helpers/accounts/create-invitee-session';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Change team organization',
  () => {
    enterprisePageTest(
      qase(
        [3211, 3212, 3213],
        'Move a team between organizations, across owners, observed live',
      ),
      async ({ page, browser, orgPage, adminConsolePage, stripePage }) => {
        enterprisePageTest.slow();

        const orgAName = createOrgName();
        const orgBName = createOrgName();
        const orgCName = createOrgName();
        const teamName = createTeamName();

        const user1 = await createInviteeSession(browser);
        const user1OrgPage = new OrganizationPage(user1.page);
        const user1AdminConsolePage = new AdminConsolePage(user1.page);
        const user1TeamPage = new TeamPage(user1.page);
        const user1StripePage = new StripePage(user1.page);

        const user2 = await createInviteeSession(browser);
        const user2TeamPage = new TeamPage(user2.page);

        let teamId = '';

        await enterprisePageTest.step(
          'Setup: User1 subscribes to Enterprise, creates OrgA and OrgB, and a team in OrgA',
          async () => {
            await subscribeAndCreateOrg(
              user1OrgPage,
              user1AdminConsolePage,
              user1StripePage,
              orgAName,
            );
            await user1AdminConsolePage.goToFiles();
            await user1TeamPage.createTeam(teamName);
            teamId = user1TeamPage.getTeamIdFromUrl();

            await user1OrgPage.openOrgSwitcher();
            await user1OrgPage.clickCreateOrgFromDropdown();
            await user1OrgPage.createOrganization(orgBName);
            await user1AdminConsolePage.goToFiles();
          },
        );

        await enterprisePageTest.step(
          '3211: Move the team from OrgA to OrgB (same user)',
          async () => {
            await user1.page.goto(`/#/dashboard/recent?team-id=${teamId}`);
            await user1TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user1TeamPage.isTeamPartOfOrganization(orgAName);

            await user1TeamPage.changeTeamOrganization(orgBName);
            await user1TeamPage.isTeamPartOfOrganization(orgBName);
          },
        );

        await enterprisePageTest.step(
          'Setup: a different user subscribes to Enterprise, creates OrgC, and invites User1 into it',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgCName,
            );
            await adminConsolePage.invitePersonToOrganization(user1.email);

            await user1OrgPage.acceptOrgInviteFromInbox(user1.email, orgCName);
          },
        );

        await enterprisePageTest.step(
          '3212: Move the team from OrgB to OrgC (an organization belonging to a different user)',
          async () => {
            await user1.page.goto(`/#/dashboard/recent?team-id=${teamId}`);
            await user1TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user1TeamPage.isTeamPartOfOrganization(orgBName);

            await user1TeamPage.changeTeamOrganization(orgCName);
            await user1TeamPage.isTeamPartOfOrganization(orgCName);
          },
        );

        await enterprisePageTest.step(
          'Setup: User1 invites User2 to the team, User2 accepts and lands on its dashboard',
          async () => {
            await user1TeamPage.openInvitationsPageViaOptionsMenu();
            await user1TeamPage.clickInviteMembersToTeamButton();
            await user1TeamPage.enterEmailToInviteMembersPopUp(user2.email);
            await user1TeamPage.clickSendInvitationButton();

            await waitSecondMessage(page, user2.email, 40);
            const invite = await waitMessage(page, user2.email, 40);
            await user2.page.goto(invite!.inviteUrl);
          },
        );

        await enterprisePageTest.step(
          '3213: User1 moves the team from OrgC to OrgA; User2, already viewing the dashboard, sees the move without refreshing',
          async () => {
            await user1TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user1TeamPage.changeTeamOrganization(orgAName);

            await user2TeamPage.isSuccessMessageDisplayed(
              `This team is now part of the organization ${orgAName}`,
            );
          },
        );

        await user1.close();
        await user2.close();
      },
    );
  },
);
