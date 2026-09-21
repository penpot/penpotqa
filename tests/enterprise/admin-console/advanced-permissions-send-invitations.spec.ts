/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Send invitations (Permission)
 *
 */
import { type Page } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { waitMessage } from 'helpers/gmail';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { SendInvitationsPermission } from '@pages/admin-console/advanced-permissions-page';
import { TeamPage } from '@pages/dashboard/team-page';
import {
  enterprisePageTest,
  ownerAndInviteeTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';

/**
 * Accepts a team invite from the invitee's own inbox, then jumps straight to
 * the team's own dashboard by id — same proven pattern as
 * team-settings-change-org.spec.ts. More reliable than the org/team
 * switchers, whose backing lists can lag behind a team-originated invite.
 */
async function acceptTeamInvite(
  ownerPage: Page,
  invitee: { page: Page; email: string },
  teamId: string,
) {
  const invite = await waitMessage(ownerPage, invitee.email, 40);
  await invitee.page.goto(invite!.inviteUrl);
  // The invite link's own client-side redirect (e.g. into a project the
  // invitee has no direct access to) can still be in flight when the next
  // goto fires, surfacing a stray "You don't have access to this project"
  // dialog on top of the team dashboard — let it settle first.
  await invitee.page.waitForLoadState('networkidle');
  await invitee.page.goto(`/#/dashboard/recent?team-id=${teamId}`);
}

enterprisePageTest.describe(
  'Admin Console > Sidebar Menu > Advanced Permissions > Send invitations (Permission)',
  () => {
    ownerAndInviteeTest(
      qase(
        [3359, 3360],
        'Team owner and team admin can invite members under default configuration',
      ),
      async ({
        ownerPage,
        orgPage,
        adminConsolePage,
        stripePage,
        teamPage,
        invitee,
      }) => {
        await ownerAndInviteeTest.slow();

        const orgName = createOrgName();
        const teamName = createTeamName();
        const inviteeTeamPage = new TeamPage(invitee.page);
        let teamId = '';

        await ownerAndInviteeTest.step(
          'Setup: subscribe to Enterprise, create an org with a team, and invite the second account as a team admin',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            teamId = teamPage.getTeamIdFromUrl();
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(invitee.email);
            await teamPage.selectInvitationRoleInPopUp('Admin');
            await teamPage.clickSendInvitationButton();
            await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
          },
        );

        await ownerAndInviteeTest.step(
          'Invitee accepts the team invite from their inbox and becomes a team admin',
          async () => {
            await acceptTeamInvite(ownerPage, invitee, teamId);
          },
        );

        await ownerAndInviteeTest.step(
          '3359: Team owner > Members > Invitations → invite option is available and the invite flow starts',
          async () => {
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.isInviteMembersPopUpHeaderVisible();
          },
        );

        await ownerAndInviteeTest.step(
          '3360: Team admin > Members > Invitations → invite option is available and the invite flow starts',
          async () => {
            await inviteeTeamPage.openInvitationsPageViaOptionsMenu();
            await inviteeTeamPage.clickInviteMembersToTeamButton();
            await inviteeTeamPage.isInviteMembersPopUpHeaderVisible();
          },
        );
      },
    );

    enterprisePageTest(
      qase([3361], 'Switch invitation permission setting to Team owners only'),
      async ({ orgPage, adminConsolePage, stripePage, advancedPermissionsPage }) => {
        const orgName = createOrgName();

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise and create an organization',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.openAdvancedPermissionsTab();
          },
        );

        await enterprisePageTest.step(
          'Admin Console > Advanced Permissions > Send invitations → both options available',
          async () => {
            await advancedPermissionsPage.isPermissionVisible(
              SendInvitationsPermission.OwnersAndAdmins,
            );
            await advancedPermissionsPage.isPermissionVisible(
              SendInvitationsPermission.OwnersOnly,
            );
          },
        );

        await enterprisePageTest.step(
          "Select 'Team owners only' → option becomes selected (autosaved)",
          async () => {
            await advancedPermissionsPage.selectPermission(
              SendInvitationsPermission.OwnersOnly,
            );
            await advancedPermissionsPage.isPermissionSelected(
              SendInvitationsPermission.OwnersOnly,
            );
          },
        );
      },
    );

    ownerAndInviteeTest(
      qase(
        [3362, 3364],
        'Team owners only setting restricts team admins from inviting and managing invitations',
      ),
      async ({
        ownerPage,
        orgPage,
        adminConsolePage,
        stripePage,
        teamPage,
        advancedPermissionsPage,
        invitee,
      }) => {
        await ownerAndInviteeTest.slow();

        const orgName = createOrgName();
        const teamName = createTeamName();
        const pendingEmail = `pending-${Date.now()}@demo.example.com`;
        const inviteeTeamPage = new TeamPage(invitee.page);
        let teamId = '';

        await ownerAndInviteeTest.step(
          'Setup: subscribe to Enterprise, create an org with a team, invite the second account as a team admin, and leave one more invitation pending',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            teamId = teamPage.getTeamIdFromUrl();
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(invitee.email);
            await teamPage.selectInvitationRoleInPopUp('Admin');
            await teamPage.clickSendInvitationButton();
            await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
            // The invitations table can still show its empty state for a
            // moment after the modal closes — race the header's own Invite
            // people button with a lingering "empty" one below otherwise.
            await teamPage.isInvitationRecordDisplayed([
              { email: invitee.email, role: 'Admin', status: 'Pending' },
            ]);
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(pendingEmail);
            await teamPage.clickSendInvitationButton();
            await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
          },
        );

        await ownerAndInviteeTest.step(
          'Invitee accepts the team invite from their inbox and becomes a team admin',
          async () => {
            await acceptTeamInvite(ownerPage, invitee, teamId);
          },
        );

        await ownerAndInviteeTest.step(
          "Org owner switches the Send invitations permission to 'Team owners only'",
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.clickGoToAdminConsole();
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              SendInvitationsPermission.OwnersOnly,
            );
          },
        );

        await ownerAndInviteeTest.step(
          '3362: Team admin > Members > Invitations → no invite button, permission message shown instead',
          async () => {
            // The invitee's session predates the permission switch above —
            // reload to pick up the now-restrictive permission.
            await invitee.page.reload();
            await inviteeTeamPage.openInvitationsPageViaOptionsMenu();
            await inviteeTeamPage.isInviteMembersToTeamButtonDisabled();
            await inviteeTeamPage.isNoPermissionToInviteMessageVisible();
          },
        );

        await ownerAndInviteeTest.step(
          '3364: Team admin cannot change role, resend, delete, or copy the link of the existing pending invitation — preview only',
          async () => {
            await inviteeTeamPage.isInvitationRoleInPopUpNotDisplayed(
              pendingEmail,
              'Admin',
            );
            await inviteeTeamPage.isInvitationSelectionDisabled(pendingEmail);
            await inviteeTeamPage.isInvitationRecordOptionsDisabled(pendingEmail);
            await inviteeTeamPage.isCopyInvitationLinkButtonVisible(
              pendingEmail,
              false,
            );
          },
        );
      },
    );
  },
);
