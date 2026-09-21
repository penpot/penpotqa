/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Move teams across organizations (Permission)
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
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
          'Admin Console > Advanced Permissions > Move Teams Across Organizations → all 3 options available',
          async () => {
            await advancedPermissionsPage.isPermissionVisible(
              MoveTeamsPermission.NeverAllowed,
            );
            await advancedPermissionsPage.isPermissionVisible(
              MoveTeamsPermission.OnlyWithinOwnOrganizations,
            );
            await advancedPermissionsPage.isPermissionVisible(
              MoveTeamsPermission.AlwaysAllowed,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "Select 'Never allowed' → option becomes selected (autosaved), persists after reload",
          async () => {
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.NeverAllowed,
            );
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.NeverAllowed,
            );
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
          "Select 'Only within my own organizations' → option becomes selected (autosaved), persists after reload",
          async () => {
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.OnlyWithinOwnOrganizations,
            );
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.OnlyWithinOwnOrganizations,
            );
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
              MoveTeamsPermission.NeverAllowed,
            );
            // Confirm the baseline persisted before making a second change
            // in the same session.
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.NeverAllowed,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "Select 'Always allowed' → option becomes selected (autosaved), persists after reload",
          async () => {
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.AlwaysAllowed,
            );
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.AlwaysAllowed,
            );
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
          "Setup: create OrgA, and set 'Move teams across organizations' to 'Never allowed'",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgAName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.NeverAllowed,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'Create a team while OrgA is the active sidebar context → it auto-joins OrgA',
          async () => {
            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            teamId = teamPage.getTeamIdFromUrl();
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.isTeamPartOfOrganization(orgAName);
          },
        );

        await enterpriseActivatedPageTest.step(
          // "Change team organization" only renders once the owner has
          // another org to move into — see PENPOT-3211/3212's setup.
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
            await page.goto(`/#/dashboard/recent?team-id=${teamId}`);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.openChangeTeamOrgModal();
            await teamPage.isMoveTeamBlockedModalShown(orgAName);
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
        // Gmail polling for the org invite can be slow.
        ownerAndInviteeTest.slow();
        const orgDName = createOrgName();
        const orgEName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeAdminConsolePage = new AdminConsolePage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        await ownerAndInviteeTest.step(
          "Setup: create OrgD, set 'Move teams across organizations' to 'Only within my own organizations', and invite the second account",
          async () => {
            await activateEnterpriseLicense(ownerPage.context().request);
            await ownerPage.goto('/');
            await createOrgForLicensedAccount(orgPage, orgDName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.OnlyWithinOwnOrganizations,
            );
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeTest.step(
          // "Change team organization" only renders once the actor has
          // another org to move into (see the create-teams-requires-2-orgs
          // memory) — OrgE gives the invitee that second org, owned by
          // neither of them jointly with OrgD's owner. Activating BEFORE
          // creating the team, not after — a team created before the
          // invitee's first Enterprise entitlement silently drops out of
          // their team switcher once that entitlement takes effect.
          'Invitee separately activates their own Enterprise license and creates OrgE, then creates their own team (auto-joins OrgE)',
          async () => {
            await activateEnterpriseLicense(invitee.page.context().request);
            await invitee.page.goto('/');
            await createOrgForLicensedAccount(inviteeOrgPage, orgEName);
            await inviteeAdminConsolePage.goToFiles();
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
          // Accepting the OrgD invite switches the invitee's active ORG
          // context to OrgD, which scopes the team switcher down to
          // Personal Projects + OrgD's own teams — OrgE's team drops out of
          // it entirely until the org context is switched back to OrgE.
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
            await inviteeTeamPage.isMoveTeamBlockedModalShown(orgDName);
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
          "Setup: create OrgA, and set 'Move teams across organizations' to 'Only within my own organizations'",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgAName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.OnlyWithinOwnOrganizations,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'Create a team while OrgA is the active sidebar context → it auto-joins OrgA, then create OrgB (a second org for the same owner)',
          async () => {
            await adminConsolePage.goToFiles();
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
            await page.goto(`/#/dashboard/recent?team-id=${teamId}`);
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
        // Gmail polling for the org invite can be slow.
        ownerAndInviteeTest.slow();
        const orgDName = createOrgName();
        const orgAName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeAdminConsolePage = new AdminConsolePage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        await ownerAndInviteeTest.step(
          "Setup: create OrgD (kept at the default 'Always allowed'), and invite the second account",
          async () => {
            await activateEnterpriseLicense(ownerPage.context().request);
            await ownerPage.goto('/');
            await createOrgForLicensedAccount(orgPage, orgDName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.AlwaysAllowed,
            );
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeTest.step(
          // Activating BEFORE creating the team, not after — a team created
          // before the invitee's first Enterprise entitlement silently
          // drops out of their team switcher once that entitlement takes
          // effect.
          'Invitee separately activates their own Enterprise license and creates OrgA, then creates their own team (auto-joins OrgA)',
          async () => {
            await activateEnterpriseLicense(invitee.page.context().request);
            await invitee.page.goto('/');
            await createOrgForLicensedAccount(inviteeOrgPage, orgAName);
            await inviteeAdminConsolePage.goToFiles();
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
          // Accepting the OrgD invite switches the invitee's active ORG
          // context to OrgD, which scopes the team switcher down to
          // Personal Projects + OrgD's own teams — OrgA's team drops out of
          // it entirely until the org context is switched back to OrgA.
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
          "Setup: create an org with a team in it, and set 'Move teams across organizations' to 'Never allowed'",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.NeverAllowed,
            );

            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.isTeamPartOfOrganization(orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Under 'Never allowed', 'Remove team from organization' → blocking modal names the organization",
          async () => {
            await teamPage.openRemoveTeamFromOrgDialog();
            await teamPage.isMoveTeamBlockedModalShown(orgName);
            await teamPage.closeMoveTeamBlockedModal();
          },
        );

        await enterpriseActivatedPageTest.step(
          "Org owner switches the setting to 'Only within my own organizations'",
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.clickGoToAdminConsole();
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.OnlyWithinOwnOrganizations,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "Under 'Only within my own organizations', 'Remove team from organization' → the same blocking modal appears again",
          async () => {
            await adminConsolePage.goToFiles();
            await teamPage.switchTeam(teamName);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.openRemoveTeamFromOrgDialog();
            await teamPage.isMoveTeamBlockedModalShown(orgName);
          },
        );
      },
    );
  },
);
