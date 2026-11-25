/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Move teams across organizations (Permission)
 *
 * The permission is a dropdown: "Team owners" (the old 'Always allowed'), or
 * "Only me, from the Admin Console" (the old 'Never allowed'). Under "Team
 * owners", the "Only between organizations under this Enterprise
 * subscription" checkbox is the old 'Only within my own organizations'.
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) —
 * Enterprise-entitled via activation code, no Stripe checkout. A second
 * account is a `createDemoMember()` that joins orgs via the API
 * (`joinOrganization()`, no email) and, when it needs its own org, gets its
 * own license via `activateEnterpriseLicense`.
 */
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { MoveTeamsPermission } from '@pages/admin-console/advanced-permissions-page';
import { MoveTeamsMessage } from '@pages/admin-console/move-teams-permission-component';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import {
  TeamFormMessage,
  TeamFormTitle,
} from '@pages/dashboard/team-form-modal-component';
import { TeamPage } from '@pages/dashboard/team-page';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { activateEnterpriseLicense } from 'helpers/organizations/activate-enterprise-license';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createSecondOrgFromAdminConsole } from 'helpers/organizations/create-second-org-from-admin-console';
import { joinOrganization } from 'helpers/organizations/join-organization';
import { createTeam } from 'helpers/teams/create-team';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Advanced Permissions > Move teams across organizations (Permission)',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3342],
        "Set team movement permission to 'Only me, from the Admin Console' and verify setting is autosaved",
      ),
      async ({ orgPage, adminConsolePage, advancedPermissionsPage }) => {
        const orgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization',
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
        'Limit team movement to organizations under the same Enterprise subscription and verify it is autosaved',
      ),
      async ({ orgPage, adminConsolePage, advancedPermissionsPage }) => {
        const orgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization',
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
        "Set team movement permission to 'Team owners' and verify setting is autosaved",
      ),
      async ({ orgPage, adminConsolePage, advancedPermissionsPage }) => {
        const orgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization, and switch off the default permission',
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
        "Restricted move attempt under 'Only me, from the Admin Console' shows modal with correct organization name",
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
          "Setup: Enterprise already active (activation code), create OrgA, and set 'Move teams across organizations' to 'Only me, from the Admin Console'",
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
            await teamPage.teamFormModal.checkTitle(TeamFormTitle.changeTeamOrg);
            await teamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToMoveTeams(orgAName),
            );
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3346],
        "Restricted move attempt under 'Team owners' limited to the same subscription shows modal when moving from OrgD",
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
        createDemoMember,
      }) => {
        const orgDName = createOrgName();
        const orgEName = createOrgName();
        const teamName = createTeamName();
        const member = await createDemoMember('Member');
        let orgDId = '';
        const memberOrgPage = new OrganizationPage(member.page);
        const memberAdminConsolePage = new AdminConsolePage(member.page);
        const memberTeamPage = new TeamPage(member.page);

        await enterpriseActivatedPageTest.step(
          "Setup: Enterprise already active (activation code), create OrgD, limit 'Move teams across organizations' to organizations under this Enterprise subscription",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgDName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.setSameSubscriptionOnly(true);
            orgDId = adminConsolePage.getOrganizationId();
          },
        );

        await enterpriseActivatedPageTest.step(
          // OrgE is the member's 2nd org, needed for "Change team organization" to render.
          // Activate before creating the team, or it drops out of the switcher.
          'Setup: the member separately activates their own Enterprise license and creates OrgE, then creates their own team (auto-joins OrgE)',
          async () => {
            await activateEnterpriseLicense(member.request);
            await member.page.goto('/');
            await createOrgForLicensedAccount(memberOrgPage, orgEName);
            await memberAdminConsolePage.goToFiles(orgEName);
            await memberTeamPage.createTeam(teamName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Setup: the member joins OrgD as a non-owner org member',
          async () => {
            await joinOrganization(page.context().request, orgDId, [member]);
            await member.page.reload();
          },
        );

        await enterpriseActivatedPageTest.step(
          // Joining OrgD can make it the active org, hiding OrgE's team from the switcher.
          "The member switches back to OrgE's context, then to their team, and moves it into OrgD",
          async () => {
            await memberOrgPage.switchToOrg(orgEName);
            await memberTeamPage.switchTeam(teamName);
            await memberTeamPage.openTeamSettingsPageViaOptionsMenu();
            await memberTeamPage.isTeamPartOfOrganization(orgEName);
            await memberTeamPage.changeTeamOrganization(orgDName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Team Settings > three-dot menu > "Change team organization" → blocking modal names OrgD',
          async () => {
            await memberTeamPage.openChangeTeamOrgModal();
            await memberTeamPage.teamFormModal.checkTitle(
              TeamFormTitle.changeTeamOrg,
            );
            await memberTeamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToMoveTeams(orgDName),
            );
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3348],
        "Allowed move under 'Team owners' limited to the same subscription from OrgA to OrgB succeeds",
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
          "Setup: Enterprise already active (activation code), create OrgA, and limit 'Move teams across organizations' to organizations under this Enterprise subscription",
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

    enterpriseActivatedPageTest(
      qase([3349], "Allowed move under 'Team owners' from OrgD to OrgA succeeds"),
      async ({
        page,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
        createDemoMember,
      }) => {
        const orgDName = createOrgName();
        const orgAName = createOrgName();
        const teamName = createTeamName();
        const member = await createDemoMember('Member');
        let orgDId = '';
        const memberOrgPage = new OrganizationPage(member.page);
        const memberAdminConsolePage = new AdminConsolePage(member.page);
        const memberTeamPage = new TeamPage(member.page);

        await enterpriseActivatedPageTest.step(
          "Setup: Enterprise already active (activation code), create OrgD (kept at the default 'Team owners', with no destination limit)",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgDName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.TeamOwners,
            );
            await advancedPermissionsPage.isSameSubscriptionOnlyChecked(false);
            orgDId = adminConsolePage.getOrganizationId();
          },
        );

        await enterpriseActivatedPageTest.step(
          // Activate before creating the team, or it drops out of the switcher.
          'Setup: the member separately activates their own Enterprise license and creates OrgA, then creates their own team (auto-joins OrgA)',
          async () => {
            await activateEnterpriseLicense(member.request);
            await member.page.goto('/');
            await createOrgForLicensedAccount(memberOrgPage, orgAName);
            await memberAdminConsolePage.goToFiles(orgAName);
            await memberTeamPage.createTeam(teamName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Setup: the member joins OrgD as a non-owner org member',
          async () => {
            await joinOrganization(page.context().request, orgDId, [member]);
            await member.page.reload();
          },
        );

        await enterpriseActivatedPageTest.step(
          // Joining OrgD can make it the active org, hiding OrgA's team from the switcher.
          "The member switches back to OrgA's context, then to their team, and moves it into OrgD",
          async () => {
            await memberOrgPage.switchToOrg(orgAName);
            await memberTeamPage.switchTeam(teamName);
            await memberTeamPage.openTeamSettingsPageViaOptionsMenu();
            await memberTeamPage.isTeamPartOfOrganization(orgAName);
            await memberTeamPage.changeTeamOrganization(orgDName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Move the team from OrgD to OrgA → completes without a restriction modal, team is now part of OrgA',
          async () => {
            await memberTeamPage.changeTeamOrganization(orgAName);
            await memberTeamPage.isTeamPartOfOrganization(orgAName);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3626],
        "'Remove team from organization' is blocked under both restriction settings ('Only me, from the Admin Console' and 'Team owners' limited to the same subscription)",
      ),
      async ({ orgPage, adminConsolePage, advancedPermissionsPage, teamPage }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();

        await enterpriseActivatedPageTest.step(
          "Setup: Enterprise already active (activation code), create an org with a team in it, and set 'Move teams across organizations' to 'Only me, from the Admin Console'",
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
            await teamPage.teamFormModal.checkTitle(TeamFormTitle.changeTeamOrg);
            await teamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToMoveTeams(orgName),
            );
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
            await teamPage.teamFormModal.checkTitle(TeamFormTitle.changeTeamOrg);
            await teamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToMoveTeams(orgName),
            );
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [4101],
        'Team owners in "Except" can\'t move their team, and the org owner still can from the Admin Console',
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
        attributesPage,
        createDemoMember,
      }) => {
        enterpriseActivatedPageTest.slow();
        const orgA = { name: createOrgName(), id: '' };
        const orgB = { name: createOrgName(), id: '' };
        const coconutName = createTeamName();
        const appleName = createTeamName();
        const bananaName = createTeamName();
        const user2 = await createDemoMember('User2');
        const user4 = await createDemoMember('User4');
        const user2TeamPage = new TeamPage(user2.page);
        const user4TeamPage = new TeamPage(user4.page);
        let appleId = '';
        let bananaId = '';

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), User1 creates OrgA and OrgB, and User2 and User4 join them',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgA.name);
            orgA.id = adminConsolePage.getOrganizationId();
            await createSecondOrgFromAdminConsole(
              adminConsolePage,
              orgPage,
              orgB.name,
            );
            orgB.id = adminConsolePage.getOrganizationId();
            const ownerRequest = page.context().request;
            await joinOrganization(ownerRequest, orgA.id, [user2, user4]);
            await joinOrganization(ownerRequest, orgB.id, [user2, user4]);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Setup: User1, User2 and User4 each own a team in OrgA',
          async () => {
            await createTeam(page.context().request, coconutName, orgA.id);
            appleId = (await createTeam(user2.request, appleName, orgA.id)).teamId;
            bananaId = (await createTeam(user4.request, bananaName, orgA.id)).teamId;
          },
        );

        await enterpriseActivatedPageTest.step(
          "Setup: in OrgA, User2 holds 'Legal' and User4 holds 'Compliance'",
          async () => {
            await adminConsolePage.switchToOrg(orgA.name);
            await adminConsolePage.refreshPage();
            await adminConsolePage.isOnOrganizationAdminConsole(orgA.name);
            await adminConsolePage.openAttributesTab();
            await attributesPage.createAttribute('Legal');
            await attributesPage.addPeopleToAttribute('Legal', [user2.name]);
            await attributesPage.createAttribute('Compliance');
            await attributesPage.addPeopleToAttribute('Compliance', [user4.name]);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Setup: Move teams across organizations is 'Team owners', not limited to the same subscription",
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.TeamOwners,
            );
            await advancedPermissionsPage.setSameSubscriptionOnly(false);
            await advancedPermissionsPage.moveTeams.checkMessages([
              MoveTeamsMessage.AlwaysPossibleFromAdminConsole,
              '3 members.',
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          "User1 adds 'Compliance' to Except → 'Compliance 1', '2 members.', Admin Console still possible, no vacancy message",
          async () => {
            await advancedPermissionsPage.moveTeams.addExclusion('Compliance');
            await advancedPermissionsPage.moveTeams.checkExclusion('Compliance', 1);
            await advancedPermissionsPage.moveTeams.checkMessages([
              MoveTeamsMessage.AlwaysPossibleFromAdminConsole,
              '2 members.',
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          "User4 chooses 'Change team organization' for their team → a modal prevents it",
          async () => {
            await user4TeamPage.goToTeamDashboard(bananaId);
            await user4TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user4TeamPage.openChangeTeamOrgModal();
            await user4TeamPage.teamFormModal.checkTitle(
              TeamFormTitle.changeTeamOrg,
            );
            await user4TeamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToMoveTeams(orgA.name),
            );
            await user4TeamPage.closeMoveTeamBlockedModal();
          },
        );

        await enterpriseActivatedPageTest.step(
          "User2 chooses 'Change team organization' for their team → the move is offered with OrgB listed, then cancels",
          async () => {
            await user2TeamPage.goToTeamDashboard(appleId);
            await user2TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user2TeamPage.openChangeTeamOrgModal();
            await user2TeamPage.teamOrgModal.openOrgPicker();
            await user2TeamPage.isOrgPickerOptionDisabled(orgB.name, false);
            await user2TeamPage.selectOrgInPicker(orgB.name);
            await user2TeamPage.teamOrgModal.close();
          },
        );

        await enterpriseActivatedPageTest.step(
          "User1 starts moving User4's team from the Admin Console Teams → OrgB is offered, then closes the dialog",
          async () => {
            await adminConsolePage.openTeamsTab();
            await adminConsolePage.openMoveTeamDialog(bananaName);
            await adminConsolePage.hasMoveTeamDestinations([orgB.name]);
            await adminConsolePage.cancelMoveTeam();
          },
        );
      },
    );
  },
);
