/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Move teams across organizations (Permission)
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterprisePageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeTest` for cases needing a real second account.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MoveTeamsPermission } from '@pages/admin-console/advanced-permissions-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import {
  ownerAndInviteeTest,
  enterprisePageTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Admin Console > Sidebar Menu > Advanced Permissions > Move teams across organizations (Permission)',
  () => {
    enterprisePageTest(
      qase(
        [3342],
        "Set team movement permission to 'Never allowed' and verify setting is autosaved",
      ),
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

        await enterprisePageTest.step(
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

    enterprisePageTest(
      qase(
        [3343],
        "Set team movement permission to 'Only within my own organizations' and verify setting is autosaved",
      ),
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

    enterprisePageTest(
      qase(
        [3344],
        "Set team movement permission to 'Always allowed' and verify setting is autosaved",
      ),
      async ({ orgPage, adminConsolePage, stripePage, advancedPermissionsPage }) => {
        const orgName = createOrgName();

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise, create an organization, and switch off the default permission',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
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

        await enterprisePageTest.step(
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

    enterprisePageTest(
      qase(
        [3345],
        "Restricted move attempt under 'Never allowed' shows modal with correct organization name",
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        stripePage,
        advancedPermissionsPage,
        teamPage,
      }) => {
        const orgAName = createOrgName();
        const orgBName = createOrgName();
        const teamName = createTeamName();
        let teamId = '';

        await enterprisePageTest.step(
          "Setup: subscribe to Enterprise, create OrgA, and set 'Move teams across organizations' to 'Never allowed'",
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgAName,
            );
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.NeverAllowed,
            );
          },
        );

        await enterprisePageTest.step(
          'Create a team while OrgA is the active sidebar context → it auto-joins OrgA',
          async () => {
            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            teamId = teamPage.getTeamIdFromUrl();
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.isTeamPartOfOrganization(orgAName);
          },
        );

        await enterprisePageTest.step(
          // "Change team organization" only renders once the owner has
          // another org to move into — see PENPOT-3211/3212's setup.
          'Create OrgB, a second organization for the same owner',
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.clickCreateOrgFromDropdown();
            await orgPage.createOrganization(orgBName);
          },
        );

        await enterprisePageTest.step(
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
        invitee,
        orgPage,
        adminConsolePage,
        stripePage,
        advancedPermissionsPage,
      }) => {
        const orgDName = createOrgName();
        const orgEName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeAdminConsolePage = new AdminConsolePage(invitee.page);
        const inviteeStripePage = new StripePage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        await ownerAndInviteeTest.step(
          "Setup: subscribe to Enterprise, create OrgD, set 'Move teams across organizations' to 'Only within my own organizations', and invite the second account",
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgDName,
            );
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
          // neither of them jointly with OrgD's owner.
          'Invitee creates their own team, then separately subscribes to Enterprise and creates OrgE',
          async () => {
            await inviteeTeamPage.createTeam(teamName);
            await subscribeAndCreateOrg(
              inviteeOrgPage,
              inviteeAdminConsolePage,
              inviteeStripePage,
              orgEName,
            );
          },
        );

        await ownerAndInviteeTest.step(
          'Invitee accepts the OrgD invite from their inbox and becomes a non-owner org member',
          async () => {
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgDName);
          },
        );

        await ownerAndInviteeTest.step(
          'Invitee switches to their pre-existing team and adds it to OrgD',
          async () => {
            // A real reload — the team switcher's in-memory list can go
            // stale right after an Admin Console round-trip, otherwise.
            await invitee.page.goto('/');
            await inviteeTeamPage.switchTeam(teamName);
            await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
            await inviteeTeamPage.addTeamToOrganization(orgDName);
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

    enterprisePageTest.skip(
      qase(
        [3348],
        "Allowed move under 'Only within my own organizations' from OrgA to OrgB succeeds",
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3348 for full detail):
         * 1. Move a team from OrgA to OrgB → completes without restriction modal
         * 2. Team is now part of OrgB
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    enterprisePageTest.skip(
      qase([3349], "Allowed move under 'Always allowed' from OrgD to OrgA succeeds"),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3349 for full detail):
         * 1. Move a team from OrgD to OrgA → completes without restriction modal
         * 2. Team is now part of OrgA
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    enterprisePageTest.skip(
      qase(
        [3626],
        "'Remove team from organization' is blocked under both restriction settings ('Never allowed' and 'Only within my own organizations')",
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3626 for full detail):
         * 1. Team Settings > 'Remove team from organization' under 'Never allowed' → blocking modal naming the org
         * 2. Org owner switches setting to 'Only within my own organizations', repeat → same blocking modal
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );
  },
);
