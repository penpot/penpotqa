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
        ownerAndInviteeTest.slow(); // two full Enterprise subscriptions (owner + invitee)
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
          // neither of them jointly with OrgD's owner. Subscribing BEFORE
          // creating the team, not after — a team created before the
          // invitee's first Enterprise sign-up silently drops out of their
          // team switcher once the Stripe checkout flow completes.
          'Invitee separately subscribes to Enterprise and creates OrgE, then creates their own team (auto-joins OrgE)',
          async () => {
            await subscribeAndCreateOrg(
              inviteeOrgPage,
              inviteeAdminConsolePage,
              inviteeStripePage,
              orgEName,
            );
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

    enterprisePageTest(
      qase(
        [3348],
        "Allowed move under 'Only within my own organizations' from OrgA to OrgB succeeds",
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
          "Setup: subscribe to Enterprise, create OrgA, and set 'Move teams across organizations' to 'Only within my own organizations'",
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgAName,
            );
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              MoveTeamsPermission.OnlyWithinOwnOrganizations,
            );
          },
        );

        await enterprisePageTest.step(
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

        await enterprisePageTest.step(
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
        invitee,
        orgPage,
        adminConsolePage,
        stripePage,
        advancedPermissionsPage,
      }) => {
        ownerAndInviteeTest.slow(); // two full Enterprise subscriptions (owner + invitee)
        const orgDName = createOrgName();
        const orgAName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeAdminConsolePage = new AdminConsolePage(invitee.page);
        const inviteeStripePage = new StripePage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        await ownerAndInviteeTest.step(
          "Setup: subscribe to Enterprise, create OrgD (kept at the default 'Always allowed'), and invite the second account",
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgDName,
            );
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.AlwaysAllowed,
            );
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeTest.step(
          // Subscribing BEFORE creating the team, not after — a team
          // created before the invitee's first Enterprise sign-up silently
          // drops out of their team switcher once the Stripe checkout flow
          // completes.
          'Invitee separately subscribes to Enterprise and creates OrgA, then creates their own team (auto-joins OrgA)',
          async () => {
            await subscribeAndCreateOrg(
              inviteeOrgPage,
              inviteeAdminConsolePage,
              inviteeStripePage,
              orgAName,
            );
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

    enterprisePageTest(
      qase(
        [3626],
        "'Remove team from organization' is blocked under both restriction settings ('Never allowed' and 'Only within my own organizations')",
      ),
      async ({
        orgPage,
        adminConsolePage,
        stripePage,
        advancedPermissionsPage,
        teamPage,
      }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();

        await enterprisePageTest.step(
          "Setup: subscribe to Enterprise, create an org with a team in it, and set 'Move teams across organizations' to 'Never allowed'",
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

            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.isTeamPartOfOrganization(orgName);
          },
        );

        await enterprisePageTest.step(
          "Under 'Never allowed', 'Remove team from organization' → blocking modal names the organization",
          async () => {
            await teamPage.openRemoveTeamFromOrgDialog();
            await teamPage.isMoveTeamBlockedModalShown(orgName);
            await teamPage.closeMoveTeamBlockedModal();
          },
        );

        await enterprisePageTest.step(
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

        await enterprisePageTest.step(
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
