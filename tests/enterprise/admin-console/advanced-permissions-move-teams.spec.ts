/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Move teams across organizations (Permission)
 *
 * The permission is a dropdown: "Team owners" (the old 'Always allowed'), or
 * "Only me, from the Admin Console" (the old 'Never allowed'). Under "Team
 * owners", the "Only between organizations under this Enterprise
 * subscription" checkbox is the old 'Only within my own organizations'. The
 * Qase titles still use the old option names.
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) for a
 * single actor — Enterprise-entitled via activation code, no Stripe
 * checkout; `ownerAndInviteeTest` for cases needing a real second account
 * (entitled the same way, applied manually via `activateEnterpriseLicense`).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MoveTeamsPermission } from '@pages/admin-console/advanced-permissions-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { activateEnterpriseLicense } from 'helpers/organizations/activate-enterprise-license';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import {
  ownerAndInviteeTest,
  enterpriseActivatedPageTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Advanced Permissions > Move teams across organizations (Permission)',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3342],
        "Set team movement permission to 'Never allowed' and verify setting is autosaved",
      ),
      async ({ orgPage, adminConsolePage, advancedPermissionsPage }) => {
        const orgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: create an organization',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openAdvancedPermissionsTab();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Admin Console > Advanced Permissions > Move Teams Across Organizations → both options and the same subscription checkbox available',
          async () => {
            await advancedPermissionsPage.isPermissionVisible(
              MoveTeamsPermission.TeamOwners,
            );
            await advancedPermissionsPage.isPermissionVisible(
              MoveTeamsPermission.OnlyMeFromAdminConsole,
            );
            await advancedPermissionsPage.isSameSubscriptionOnlyVisible();
          },
        );

        await enterpriseActivatedPageTest.step(
          "Select 'Only me, from the Admin Console' → option becomes selected (autosaved), persists after reload, and hides the checkbox",
          async () => {
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.OnlyMeFromAdminConsole,
            );
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.OnlyMeFromAdminConsole,
            );
            await advancedPermissionsPage.isSameSubscriptionOnlyVisible(false);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3343],
        "Set team movement permission to 'Only within my own organizations' and verify setting is autosaved",
      ),
      async ({ orgPage, adminConsolePage, advancedPermissionsPage }) => {
        const orgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: create an organization',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openAdvancedPermissionsTab();
          },
        );

        await enterpriseActivatedPageTest.step(
          "Check 'Only between organizations under this Enterprise subscription' → stays checked under 'Team owners' (autosaved) after reload",
          async () => {
            await advancedPermissionsPage.setSameSubscriptionOnly(true);
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.TeamOwners,
            );
            await advancedPermissionsPage.isSameSubscriptionOnlyChecked();
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3344],
        "Set team movement permission to 'Always allowed' and verify setting is autosaved",
      ),
      async ({ orgPage, adminConsolePage, advancedPermissionsPage }) => {
        const orgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: create an organization, and switch off the default permission',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.OnlyMeFromAdminConsole,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "Select 'Team owners' → option becomes selected (autosaved), persists after reload, with the same subscription checkbox unchecked",
          async () => {
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.TeamOwners,
            );
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.TeamOwners,
            );
            await advancedPermissionsPage.isSameSubscriptionOnlyChecked(false);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3345],
        "Restricted move attempt under 'Never allowed' shows modal with correct organization name",
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
        teamPage,
      }) => {
        const orgAName = createOrgName();
        const orgBName = createOrgName();
        const teamName = createTeamName();
        let teamId = '';

        await enterpriseActivatedPageTest.step(
          "Setup: create OrgA, and set 'Move teams across organizations' to 'Only me, from the Admin Console'",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgAName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.OnlyMeFromAdminConsole,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'Create a team while OrgA is the active sidebar context → it auto-joins OrgA',
          async () => {
            await adminConsolePage.goToFiles(orgAName);
            await teamPage.createTeam(teamName);
            teamId = teamPage.getTeamIdFromUrl();
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.isTeamPartOfOrganization(orgAName);
          },
        );

        await enterpriseActivatedPageTest.step(
          // "Change team organization" only renders once the owner has
          // another org to move into
          'Create OrgB, a second organization for the same owner',
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.clickCreateOrgFromDropdown();
            await orgPage.createOrganization(orgBName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Team Settings > three-dot menu > "Change team organization" → blocking modal names OrgA',
          async () => {
            await teamPage.goToTeamDashboard(teamId);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.openChangeTeamOrgModal();
            await teamPage.isMoveTeamBlockedModalVisible(orgAName);
          },
        );
      },
    );

    ownerAndInviteeTest(
      qase(
        [3346],
        "Restricted move attempt under 'Only within my own organizations' shows modal when moving from OrgD",
      ),
      async ({
        ownerPage,
        invitee,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
      }) => {
        ownerAndInviteeTest.slow();
        const orgDName = createOrgName();
        const orgEName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeAdminConsolePage = new AdminConsolePage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        await ownerAndInviteeTest.step(
          "Setup: create OrgD, limit 'Move teams across organizations' to organizations under this Enterprise subscription, and invite the second account",
          async () => {
            await activateEnterpriseLicense(ownerPage.context().request);
            await ownerPage.goto('/');
            await createOrgForLicensedAccount(orgPage, orgDName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.setSameSubscriptionOnly(true);
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeTest.step(
          // OrgE is the invitee's 2nd org, needed for "Change team organization" to render.
          // Activate before creating the team, or it drops out of the switcher.
          'Invitee separately activates their own Enterprise license and creates OrgE, then creates their own team (auto-joins OrgE)',
          async () => {
            await activateEnterpriseLicense(invitee.page.context().request);
            await invitee.page.goto('/');
            await createOrgForLicensedAccount(inviteeOrgPage, orgEName);
            await inviteeAdminConsolePage.goToFiles(orgEName);
            await inviteeTeamPage.createTeam(teamName);
          },
        );

        await ownerAndInviteeTest.step(
          'Invitee accepts the OrgD invite from their inbox and becomes a non-owner org member',
          async () => {
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgDName);
          },
        );

        await ownerAndInviteeTest.step(
          // Accepting the invite switched the active org to OrgD, hiding OrgE's team from the switcher.
          "Invitee switches back to OrgE's context, then to their team, and moves it into OrgD",
          async () => {
            await inviteeOrgPage.switchToOrg(orgEName);
            await inviteeTeamPage.switchTeam(teamName);
            await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
            await inviteeTeamPage.isTeamPartOfOrganization(orgEName);
            await inviteeTeamPage.changeTeamOrganization(orgDName);
          },
        );

        await ownerAndInviteeTest.step(
          'Team Settings > three-dot menu > "Change team organization" → blocking modal names OrgD',
          async () => {
            await inviteeTeamPage.openChangeTeamOrgModal();
            await inviteeTeamPage.isMoveTeamBlockedModalVisible(orgDName);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3348],
        "Allowed move under 'Only within my own organizations' from OrgA to OrgB succeeds",
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
        teamPage,
      }) => {
        const orgAName = createOrgName();
        const orgBName = createOrgName();
        const teamName = createTeamName();
        let teamId = '';

        await enterpriseActivatedPageTest.step(
          "Setup: create OrgA, and limit 'Move teams across organizations' to organizations under this Enterprise subscription",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgAName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.setSameSubscriptionOnly(true);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Create a team while OrgA is the active sidebar context → it auto-joins OrgA, then create OrgB (a second org for the same owner)',
          async () => {
            await adminConsolePage.goToFiles(orgAName);
            await teamPage.createTeam(teamName);
            teamId = teamPage.getTeamIdFromUrl();
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.isTeamPartOfOrganization(orgAName);

            await orgPage.openOrgSwitcher();
            await orgPage.clickCreateOrgFromDropdown();
            await orgPage.createOrganization(orgBName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Move the team from OrgA to OrgB → completes without a restriction modal, team is now part of OrgB',
          async () => {
            await teamPage.goToTeamDashboard(teamId);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.changeTeamOrganization(orgBName);
            await teamPage.isTeamPartOfOrganization(orgBName);
          },
        );
      },
    );

    ownerAndInviteeTest(
      qase([3349], "Allowed move under 'Always allowed' from OrgD to OrgA succeeds"),
      async ({
        ownerPage,
        invitee,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
      }) => {
        ownerAndInviteeTest.slow();
        const orgDName = createOrgName();
        const orgAName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeAdminConsolePage = new AdminConsolePage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        await ownerAndInviteeTest.step(
          "Setup: create OrgD (kept at the default 'Team owners', with no destination limit), and invite the second account",
          async () => {
            await activateEnterpriseLicense(ownerPage.context().request);
            await ownerPage.goto('/');
            await createOrgForLicensedAccount(orgPage, orgDName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.TeamOwners,
            );
            await advancedPermissionsPage.isSameSubscriptionOnlyChecked(false);
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeTest.step(
          // Activate before creating the team, or it drops out of the switcher.
          'Invitee separately activates their own Enterprise license and creates OrgA, then creates their own team (auto-joins OrgA)',
          async () => {
            await activateEnterpriseLicense(invitee.page.context().request);
            await invitee.page.goto('/');
            await createOrgForLicensedAccount(inviteeOrgPage, orgAName);
            await inviteeAdminConsolePage.goToFiles(orgAName);
            await inviteeTeamPage.createTeam(teamName);
          },
        );

        await ownerAndInviteeTest.step(
          'Invitee accepts the OrgD invite from their inbox and becomes a non-owner org member',
          async () => {
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgDName);
          },
        );

        await ownerAndInviteeTest.step(
          // Accepting the invite switched the active org to OrgD, hiding OrgA's team from the switcher.
          "Invitee switches back to OrgA's context, then to their team, and moves it into OrgD",
          async () => {
            await inviteeOrgPage.switchToOrg(orgAName);
            await inviteeTeamPage.switchTeam(teamName);
            await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
            await inviteeTeamPage.isTeamPartOfOrganization(orgAName);
            await inviteeTeamPage.changeTeamOrganization(orgDName);
          },
        );

        await ownerAndInviteeTest.step(
          'Move the team from OrgD to OrgA → completes without a restriction modal, team is now part of OrgA',
          async () => {
            await inviteeTeamPage.changeTeamOrganization(orgAName);
            await inviteeTeamPage.isTeamPartOfOrganization(orgAName);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3626],
        "'Remove team from organization' is blocked under both restriction settings ('Never allowed' and 'Only within my own organizations')",
      ),
      async ({ orgPage, adminConsolePage, advancedPermissionsPage, teamPage }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();

        await enterpriseActivatedPageTest.step(
          "Setup: create an org with a team in it, and set 'Move teams across organizations' to 'Only me, from the Admin Console'",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.OnlyMeFromAdminConsole,
            );

            await adminConsolePage.goToFiles(orgName);

            await teamPage.createTeam(teamName);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.isTeamPartOfOrganization(orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Under 'Only me, from the Admin Console', 'Remove team from organization' → blocking modal names the organization",
          async () => {
            await teamPage.openRemoveTeamFromOrgDialog();
            await teamPage.isMoveTeamBlockedModalVisible(orgName);
            await teamPage.closeMoveTeamBlockedModal();
          },
        );

        await enterpriseActivatedPageTest.step(
          "Org owner switches the setting to 'Team owners', only between organizations under this Enterprise subscription",
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.clickGoToAdminConsole();
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.TeamOwners,
            );
            await advancedPermissionsPage.setSameSubscriptionOnly(true);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Under the same subscription limit, 'Remove team from organization' → the same blocking modal appears again",
          async () => {
            await adminConsolePage.goToFiles(orgName);
            await teamPage.switchTeam(teamName);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.openRemoveTeamFromOrgDialog();
            await teamPage.isMoveTeamBlockedModalVisible(orgName);
          },
        );
      },
    );
  },
);
