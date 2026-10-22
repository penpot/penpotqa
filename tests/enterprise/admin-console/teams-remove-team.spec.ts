/**
 * Qase suite: Admin Console > Sidebar Menu > Teams > Remove Team
 * 3900/3905/3908 share one setup and flow, so they're merged; 3912 stays separate.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { SendInvitationsPermission } from '@pages/admin-console/advanced-permissions-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { acceptTeamInvite } from 'helpers/teams/accept-team-invite';
import { goToOtherTeam } from 'helpers/teams/go-to-other-team';
import { ownerAndInviteeActivatedTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

ownerAndInviteeActivatedTest.describe(
  'Admin Console > Sidebar Menu > Teams > Remove Team',
  () => {
    ownerAndInviteeActivatedTest(
      qase(
        [3900, 3905, 3908],
        'Remove a team the org owner is not a member of: access-loss warning, live notice to members, and lost access',
      ),
      async ({ ownerPage, invitee, orgPage, adminConsolePage }) => {
        ownerAndInviteeActivatedTest.slow();
        const orgAName = createOrgName();
        const teamName = createTeamName();
        const ownerTeamPage = new TeamPage(ownerPage);
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);
        let orgAAdminConsoleUrl = '';
        let teamId = '';
        let teamDashboardUrl = '';
        let fileUrl = '';

        await ownerAndInviteeActivatedTest.step(
          'Setup: User1 creates OrgA and invites User2, who joins and creates "Team Apple" with a file',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgAName);
            orgAAdminConsoleUrl = ownerPage.url();
            await adminConsolePage.invitePersonToOrganization(invitee.email);

            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgAName);
            await inviteeTeamPage.createTeam(teamName);
            teamId = inviteeTeamPage.getTeamIdFromUrl();
            teamDashboardUrl = invitee.page.url();
            await new DashboardPage(invitee.page).createFileViaPlaceholder();
            await new MainPage(invitee.page).isMainPageLoaded();
            fileUrl = invitee.page.url();
          },
        );

        await ownerAndInviteeActivatedTest.step(
          '3908: User2 keeps the Team Apple dashboard open',
          async () => {
            await inviteeTeamPage.goToTeamDashboard(teamId);
            await inviteeTeamPage.waitForTeamBtn();
          },
        );

        await ownerAndInviteeActivatedTest.step(
          '3900: User1 opens OrgA > Teams > "Team options" of Team Apple → "Remove from org" warns of losing access',
          async () => {
            await ownerPage.goto(orgAAdminConsoleUrl);
            await ownerPage.reload();
            await adminConsolePage.openTeamsTab();
            await adminConsolePage.isTeamListedInTeamsTable(teamName);
            await adminConsolePage.openTeamOptionsMenu(teamName);
            await adminConsolePage.isTeamOptionsMenuShown();
            await adminConsolePage.removeTeamFromOrgMenuItem.click();
            await adminConsolePage.isRemoveTeamDialogShown(teamName, orgAName, {
              notMember: true,
            });
          },
        );

        await ownerAndInviteeActivatedTest.step(
          '3905: User1 confirms → Team Apple disappears from the Teams page',
          async () => {
            await adminConsolePage.confirmRemoveTeamFromOrg();
            await adminConsolePage.isTeamListedInTeamsTable(teamName, false);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          '3908: without reloading, User2 sees the team is no longer part of OrgA, and it is under "Other teams" in the switcher',
          async () => {
            await inviteeTeamPage.isTeamNoLongerPartOfOrgMessageShown(
              teamName,
              orgAName,
            );
            await inviteeOrgPage.openOrgSwitcher();
            await inviteeOrgPage.otherTeamsDropdownItem.click();
            await inviteeTeamPage.openTeamsListIfClosed();
            await inviteeTeamPage.isTeamListed(teamName);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          "3905: User1 can no longer open Team Apple's dashboard or file from their links",
          async () => {
            await ownerPage.goto(teamDashboardUrl);
            await ownerTeamPage.isRequestAccessProjectDialogVisible();
            await ownerPage.goto(fileUrl);
            await ownerTeamPage.isRequestFileAccessDialogVisible();
          },
        );
      },
    );

    ownerAndInviteeActivatedTest(
      qase(
        [3912],
        'Advanced permissions of the organization no longer apply to the removed team',
      ),
      async ({
        ownerPage,
        invitee,
        orgPage,
        adminConsolePage,
        teamPage,
        advancedPermissionsPage,
      }) => {
        ownerAndInviteeActivatedTest.slow();
        const orgAName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);
        let orgAAdminConsoleUrl = '';
        let teamId = '';

        await ownerAndInviteeActivatedTest.step(
          'Setup: User1 creates OrgA and "Team Apple", and User3 joins the team as Admin',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgAName);
            orgAAdminConsoleUrl = ownerPage.url();
            await adminConsolePage.goToFiles(orgAName);
            await teamPage.createTeam(teamName);
            teamId = teamPage.getTeamIdFromUrl();
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(invitee.email);
            await teamPage.selectInvitationRoleInPopUp('Admin');
            await teamPage.clickSendInvitationButton();
            await teamPage.isInvitationRecordDisplayed([
              { email: invitee.email, role: 'Admin', status: 'Pending' },
            ]);
            await acceptTeamInvite(ownerPage, invitee, teamId);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          "Setup: User1 sets OrgA's Send invitations permission to 'Team owners only'",
          async () => {
            await ownerPage.goto(orgAAdminConsoleUrl);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              SendInvitationsPermission.OwnersOnly,
            );
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'User3 (team Admin) cannot invite people to Team Apple',
          async () => {
            // Load by id, not reload: the invite link may have left a project URL.
            await inviteeTeamPage.goToTeamDashboard(teamId);
            await inviteeTeamPage.openInvitationsPageViaOptionsMenu();
            // Empty state hides the button (it's only disabled with pending invites).
            await inviteeTeamPage.isInviteMembersToTeamButtonHidden();
            await inviteeTeamPage.isNoPermissionToInviteMessageVisible();
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'User1 removes Team Apple from OrgA from the Admin Console Teams page',
          async () => {
            await adminConsolePage.openTeamsTab();
            await adminConsolePage.openRemoveTeamFromOrgDialog(teamName);
            await adminConsolePage.isRemoveTeamDialogShown(teamName, orgAName);
            await adminConsolePage.confirmRemoveTeamFromOrg();
            await adminConsolePage.isTeamListedInTeamsTable(teamName, false);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'User3 reopens Team Apple and can invite people again, as its Admin role allows',
          async () => {
            await goToOtherTeam(inviteeOrgPage, inviteeTeamPage, teamName);
            await inviteeTeamPage.openInvitationsPageViaOptionsMenu();
            await inviteeTeamPage.clickInviteMembersToTeamButton();
            await inviteeTeamPage.isInviteMembersPopUpHeaderVisible();
          },
        );
      },
    );
  },
);
