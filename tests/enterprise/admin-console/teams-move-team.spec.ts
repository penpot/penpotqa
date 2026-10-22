/**
 * Qase suite: Admin Console > Sidebar Menu > Teams > Move Team
 * Not merged: each case needs a different account setup and dialog state.
 */
import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { NewTeamMembersPermission } from '@pages/admin-console/advanced-permissions-page';
import { activateEnterpriseLicense } from 'helpers/organizations/activate-enterprise-license';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createSecondOrgFromAdminConsole } from 'helpers/organizations/create-second-org-from-admin-console';
import {
  enterpriseActivatedPageTest,
  ownerAndInviteeActivatedTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Teams > Move Team',
  () => {
    ownerAndInviteeActivatedTest(
      qase(
        [3894],
        'Move a team to another organization from the Admin Console Teams page',
      ),
      async ({ ownerPage, invitee, orgPage, adminConsolePage }) => {
        ownerAndInviteeActivatedTest.slow();
        const orgAName = createOrgName();
        const orgBName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);
        let orgAAdminConsoleUrl = '';

        await ownerAndInviteeActivatedTest.step(
          'Setup: create OrgA, invite the second account to it, and create OrgB',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgAName);
            orgAAdminConsoleUrl = ownerPage.url();
            await adminConsolePage.invitePersonToOrganization(invitee.email);
            await createSecondOrgFromAdminConsole(
              adminConsolePage,
              orgPage,
              orgBName,
            );
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Setup: User2 joins OrgA and creates "Team Apple" with a file in it (the owner is not a team member)',
          async () => {
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgAName);
            await inviteeOrgPage.switchToOrg(orgAName);
            await inviteeTeamPage.createTeam(teamName);
            await new DashboardPage(invitee.page).createFileViaPlaceholder();
            await new MainPage(invitee.page).isMainPageLoaded();
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Open OrgA > Teams and the "Team options" menu of the team',
          async () => {
            await ownerPage.goto(orgAAdminConsoleUrl);
            await ownerPage.reload();
            await adminConsolePage.openTeamsTab();
            await adminConsolePage.openTeamOptionsMenu(teamName);
            await adminConsolePage.isTeamOptionsMenuShown();
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Click "Move to another org" → dialog with OrgB, the only destination, already selected',
          async () => {
            await adminConsolePage.moveTeamMenuItem.click();
            await adminConsolePage.isMoveTeamDialogShown(teamName);
            await adminConsolePage.hasMoveTeamDestinations([orgBName]);
            await adminConsolePage.isMoveTeamDestinationSelected(orgBName);
            await adminConsolePage.isMoveTeamButtonEnabled();
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Cancel → dialog closes and the team is still listed in OrgA',
          async () => {
            await adminConsolePage.cancelMoveTeam();
            await adminConsolePage.isTeamListedInTeamsTable(teamName);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Move the team → toast confirms it and it is no longer listed in OrgA',
          async () => {
            await adminConsolePage.openMoveTeamDialog(teamName);
            await adminConsolePage.confirmMoveTeam(teamName, orgBName);
            await adminConsolePage.isTeamListedInTeamsTable(teamName, false);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'OrgB > Teams lists the team with User2 as owner and its file',
          async () => {
            await adminConsolePage.switchToOrg(orgBName);
            await adminConsolePage.isOnOrganizationAdminConsole(orgBName);
            await ownerPage.reload();
            await adminConsolePage.openTeamsTab();
            await adminConsolePage.isTeamListedInTeamsTable(teamName);
            await adminConsolePage.hasTeamOwnerInTeamsTable(teamName, invitee.name);
            await adminConsolePage.hasTeamCountsInTeamsTable(teamName, {
              projects: 0,
              files: 1,
              members: 1,
            });
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'User2 is an OrgB member with 1 team, and is still an OrgA member',
          async () => {
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.isMemberListedInPeopleTable(invitee.name);
            await adminConsolePage.hasMemberTeamsCountInPeopleTable(invitee.name, 1);

            await adminConsolePage.switchToOrg(orgAName);
            await adminConsolePage.isOnOrganizationAdminConsole(orgAName);
            await ownerPage.reload();
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.isMemberListedInPeopleTable(invitee.name);
          },
        );
      },
    );

    ownerAndInviteeActivatedTest(
      qase([3895], 'Show only the organizations owned by the user as destinations'),
      async ({ ownerPage, invitee, orgPage, adminConsolePage }) => {
        ownerAndInviteeActivatedTest.slow();
        // The mover is the invitee: it must accept the OrgX invite (real inbox).
        const orgXName = createOrgName();
        const orgAName = createOrgName();
        const orgBName = createOrgName();
        const orgCName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeAdminConsolePage = new AdminConsolePage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);
        let orgAAdminConsoleUrl = '';

        await ownerAndInviteeActivatedTest.step(
          'Setup: another user creates OrgX and invites the mover to it',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgXName);
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Setup: the mover activates their own license, creates OrgA (with "Team 1"), OrgB and OrgC',
          async () => {
            await activateEnterpriseLicense(invitee.page.context().request);
            await invitee.page.goto('/');
            await createOrgForLicensedAccount(inviteeOrgPage, orgAName);
            orgAAdminConsoleUrl = invitee.page.url();
            await createSecondOrgFromAdminConsole(
              inviteeAdminConsolePage,
              inviteeOrgPage,
              orgBName,
            );
            await createSecondOrgFromAdminConsole(
              inviteeAdminConsolePage,
              inviteeOrgPage,
              orgCName,
            );
            await invitee.page.goto(orgAAdminConsoleUrl);
            await inviteeAdminConsolePage.goToFiles(orgAName);
            await inviteeTeamPage.createTeam(teamName);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Setup: the mover accepts the OrgX invite and becomes a non-owner member',
          async () => {
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgXName);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Open the "Move to another org" dialog of "Team 1" → only OrgB and OrgC are listed, none selected, "Move team" disabled',
          async () => {
            await invitee.page.goto(orgAAdminConsoleUrl);
            await invitee.page.reload();
            await inviteeAdminConsolePage.openTeamsTab();
            await inviteeAdminConsolePage.openMoveTeamDialog(teamName);
            await inviteeAdminConsolePage.hasMoveTeamDestinations([
              orgBName,
              orgCName,
            ]);
            await inviteeAdminConsolePage.isNoMoveTeamDestinationSelected();
            await inviteeAdminConsolePage.isMoveTeamButtonEnabled(false);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Select OrgB → it is selected and "Move team" is enabled',
          async () => {
            await inviteeAdminConsolePage.selectMoveTeamDestination(orgBName);
            await inviteeAdminConsolePage.isMoveTeamDestinationSelected(orgBName);
            await inviteeAdminConsolePage.isMoveTeamButtonEnabled();
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3897],
        'Warn about revoking pending external invitations when moving a team to a restricted organization',
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        teamPage,
        advancedPermissionsPage,
      }) => {
        enterpriseActivatedPageTest.slow();
        const orgAName = createOrgName();
        const orgBName = createOrgName();
        const orgCName = createOrgName();
        const invitedTeamName = createTeamName();
        const uninvitedTeamName = createTeamName();
        const externalInviteEmail = `pending-external-${Date.now()}@demo.example.com`;
        let orgAAdminConsoleUrl = '';
        let invitedTeamId = '';

        await enterpriseActivatedPageTest.step(
          'Setup: create OrgA, OrgB (restricted to "Organization members only") and OrgC',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgAName);
            orgAAdminConsoleUrl = page.url();
            await createSecondOrgFromAdminConsole(
              adminConsolePage,
              orgPage,
              orgBName,
            );
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              NewTeamMembersPermission.OrganizationMembersOnly,
            );
            await createSecondOrgFromAdminConsole(
              adminConsolePage,
              orgPage,
              orgCName,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'Setup: in OrgA, create "Team Coconut" with a pending external invitation, and "Team Durian" without invitations',
          async () => {
            await page.goto(orgAAdminConsoleUrl);
            await adminConsolePage.goToFiles(orgAName);
            await teamPage.createTeam(invitedTeamName);
            invitedTeamId = teamPage.getTeamIdFromUrl();
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(externalInviteEmail);
            await teamPage.clickSendInvitationButton();
            await teamPage.isInvitationRecordDisplayed([
              { email: externalInviteEmail, role: 'Editor', status: 'Pending' },
            ]);
            await teamPage.createTeam(uninvitedTeamName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Setup: the external invitation is listed as pending in OrgA',
          async () => {
            await page.goto(orgAAdminConsoleUrl);
            await adminConsolePage.openPeopleTab();
            // Team invites take longer than org invites to reach this list.
            await expect(async () => {
              await page.reload();
              await adminConsolePage.openPendingTab();
              await adminConsolePage.isPendingInvitationListed(externalInviteEmail);
            }).toPass({ timeout: 20000 });
          },
        );

        await enterpriseActivatedPageTest.step(
          'Move dialog of "Team Durian" with OrgB selected → no alert',
          async () => {
            await adminConsolePage.openTeamsTab();
            await adminConsolePage.openMoveTeamDialog(uninvitedTeamName);
            await adminConsolePage.selectMoveTeamDestination(orgBName);
            await adminConsolePage.isMoveTeamRevokeInvitationsAlertShown(
              uninvitedTeamName,
              orgBName,
              false,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'Move dialog of "Team Coconut" with OrgC selected → no alert',
          async () => {
            await adminConsolePage.cancelMoveTeam();
            await adminConsolePage.openMoveTeamDialog(invitedTeamName);
            await adminConsolePage.selectMoveTeamDestination(orgCName);
            await adminConsolePage.isMoveTeamRevokeInvitationsAlertShown(
              invitedTeamName,
              orgCName,
              false,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'Select OrgB → alert warns that the pending invitations will be revoked',
          async () => {
            await adminConsolePage.selectMoveTeamDestination(orgBName);
            await adminConsolePage.isMoveTeamRevokeInvitationsAlertShown(
              invitedTeamName,
              orgBName,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'Move the team → toast confirms it and OrgA no longer lists the invitation as pending',
          async () => {
            await adminConsolePage.confirmMoveTeam(invitedTeamName, orgBName);
            await page.reload();
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.openPendingTab();
            await adminConsolePage.isPendingInvitationListed(
              externalInviteEmail,
              false,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'The team\'s Invitations page in OrgB shows "No pending invitations."',
          async () => {
            await teamPage.goToTeamDashboard(invitedTeamId);
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.isInvitationRecordRemoved();
          },
        );
      },
    );
  },
);
