/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Create Teams (Permission)
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterprisePageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeTest` for cases needing a real second account.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { CreateTeamsPermission } from '@pages/admin-console/advanced-permissions-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import {
  ownerAndInviteeTest,
  enterprisePageTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Admin Console > Sidebar Menu > Advanced Permissions > Create Teams (Permission)',
  () => {
    enterprisePageTest(
      qase(
        [3328],
        "Org owner can change team creation permission to 'Only me' and is autosaved",
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
          'Admin Console > Advanced Permissions > Create Teams → both options available',
          async () => {
            await advancedPermissionsPage.isPermissionVisible(
              CreateTeamsPermission.AnyMember,
            );
            await advancedPermissionsPage.isPermissionVisible(
              CreateTeamsPermission.OnlyMe,
            );
          },
        );

        await enterprisePageTest.step(
          "Select 'Only me' → option becomes selected (autosaved)",
          async () => {
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.OnlyMe,
            );
            await advancedPermissionsPage.isPermissionSelected(
              CreateTeamsPermission.OnlyMe,
            );
          },
        );
      },
    );

    enterprisePageTest(
      qase(
        [3329],
        "Org owner can change team creation permission to 'Any member of the organization' and is autosaved",
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
              CreateTeamsPermission.OnlyMe,
            );
            // Confirm the baseline persisted before making a second change
            // in the same session.
            await advancedPermissionsPage.isPermissionSelected(
              CreateTeamsPermission.OnlyMe,
            );
          },
        );

        await enterprisePageTest.step(
          "Select 'Any member of the organization' → option becomes selected (autosaved)",
          async () => {
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.AnyMember,
            );
            await advancedPermissionsPage.isPermissionSelected(
              CreateTeamsPermission.AnyMember,
            );
          },
        );
      },
    );

    enterprisePageTest(
      qase(
        [3332],
        "When permission is 'Only me', org owner can create a team successfully",
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        stripePage,
        advancedPermissionsPage,
        teamPage,
      }) => {
        /**
         * "Create Teams" gates Team Settings' "Add to an organization" link.
         * Owners bypass it unconditionally, so this creates a team and adds
         * it to the org as owner under 'Only me', to prove the bypass.
         *
         * Team created BEFORE the org exists (same ordering as PENPOT-3192)
         * — a team created while an org is the active sidebar context
         * auto-associates with it, leaving no "Add to an organization" link
         * to exercise here otherwise.
         */
        const orgName = createOrgName();
        const teamName = createTeamName();

        await enterprisePageTest.step(
          "Setup: create a team before any organization exists, then subscribe to Enterprise, create an organization, and set Create Teams permission to 'Only me'",
          async () => {
            await teamPage.createTeam(teamName);
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.OnlyMe,
            );
          },
        );

        await enterprisePageTest.step(
          'Org owner switches to their pre-existing team and adds it to the org → succeeds, no restriction shown',
          async () => {
            await adminConsolePage.goToFiles();
            // A real reload — the team switcher's in-memory list can go
            // stale right after an Admin Console round-trip, otherwise.
            await page.goto('/');
            await teamPage.switchTeam(teamName);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.addTeamToOrganization(orgName);
          },
        );
      },
    );

    ownerAndInviteeTest(
      qase(
        [3333],
        "When permission is 'Only me', non-owner user sees restricted modal when attempting to create a team",
      ),
      async ({
        invitee,
        orgPage,
        adminConsolePage,
        stripePage,
        advancedPermissionsPage,
      }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        await ownerAndInviteeTest.step(
          "Setup: subscribe to Enterprise, create an organization, set Create Teams permission to 'Only me', and invite the second account",
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.OnlyMe,
            );
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeTest.step(
          'Invitee accepts the org invite from their inbox and becomes a non-owner org member',
          async () => {
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgName);
          },
        );

        await ownerAndInviteeTest.step(
          'Non-owner member creates their own team, then attempts to add it to the org → restriction modal is shown',
          async () => {
            await invitee.page.goto('/');
            await inviteeTeamPage.createTeam(teamName);
            await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
            await inviteeTeamPage.openAddTeamToOrgModal();
            await inviteeTeamPage.isNoPermissionToAddTeamMessageVisible();
          },
        );
      },
    );

    ownerAndInviteeTest(
      qase(
        [3334],
        "When permission is 'Any member of the organization', non-owner member can create a team",
      ),
      async ({
        invitee,
        orgPage,
        adminConsolePage,
        stripePage,
        advancedPermissionsPage,
      }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        await ownerAndInviteeTest.step(
          "Setup: subscribe to Enterprise, create an organization, set Create Teams permission to 'Any member', and invite the second account",
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.openAdvancedPermissionsTab();
            // "Any member" is the real default — switch away and back so
            // the click actually registers a change (an already-selected
            // radio fires no confirmation toast to wait on).
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.OnlyMe,
            );
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.AnyMember,
            );
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeTest.step(
          'Invitee accepts the org invite from their inbox and becomes a non-owner org member',
          async () => {
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgName);
          },
        );

        await ownerAndInviteeTest.step(
          'Non-owner member creates their own team and adds it to the org → succeeds, no restriction',
          async () => {
            await invitee.page.goto('/');
            await inviteeTeamPage.createTeam(teamName);
            await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
            await inviteeTeamPage.addTeamToOrganization(orgName);
          },
        );
      },
    );
  },
);
