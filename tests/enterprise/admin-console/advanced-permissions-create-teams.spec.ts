/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Create Teams (Permission)
 *
 * Base: `enterprisePageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeTest` for cases needing a real second account;
 * `enterpriseActivatedPageTest` with `buildOrgMatrix` for cases with several
 * demo users, organizations, teams and attributes.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import {
  TeamFormMessage,
  TeamFormTitle,
} from '@pages/dashboard/team-form-modal-component';
import { TeamPage } from '@pages/dashboard/team-page';
import { CreateTeamsPermission } from '@pages/admin-console/advanced-permissions-page';
import { RestrictionPart } from '@pages/admin-console/permission-control-component';
import { openDashboardAfterApiLogin } from 'helpers/accounts/login-as-demo-account';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeam } from 'helpers/teams/create-team';
import { createTeamName } from 'helpers/teams/create-team-name';
import { goToOtherTeam } from 'helpers/teams/go-to-other-team';
import { openTeamDashboard } from 'helpers/teams/open-team-dashboard';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import {
  enterpriseActivatedPageTest,
  ownerAndInviteeTest,
  enterprisePageTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';
import type { OrgMatrix } from 'helpers/org-matrix/org-matrix-types';

/**
 * The set-up of the attribute restriction cases of Advanced Permissions
 * (https://github.com/penpot/penpot-nitrate/issues/508), as their Qase
 * preconditions describe it: User1 owns OrgA and OrgB and Team Coconut, the
 * other users have their roles in Team Apple and Team Banana, and OrgA has the
 * attributes Legal, Compliance, Junior and Beta testers. Build it with the
 * `buildOrgMatrix` fixture.
 *
 * Used by Qase 4094: update it when its preconditions change.
 */
const ATTRIBUTE_RESTRICTIONS_MATRIX: OrgMatrix = {
  users: ['User1', 'User2', 'User3', 'User4', 'User5', 'User6'],
  loggedInUser: 'User1',
  orgs: {
    orgA: {
      teams: {
        apple: { User2: 'owner', User3: 'admin', User6: 'editor' },
        banana: { User4: 'owner', User5: 'admin' },
        coconut: { User1: 'owner' },
      },
      attributes: {
        'Legal': ['User2', 'User3', 'User6'],
        'Compliance': ['User4'],
        'Junior': ['User3'],
        'Beta testers': [],
      },
    },
    orgB: {},
  },
};

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
            await adminConsolePage.goToFiles(orgName);
            // The pre-existing team isn't in the org, so it's under "Other teams".
            await goToOtherTeam(orgPage, teamPage, teamName);
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
          'Setup: subscribe to Enterprise, create an organization, and invite the second account',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeTest.step(
          'Setup: invitee accepts the org invite and creates a team in the org, while any member still can',
          async () => {
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgName);
            // The restriction modal names the org of the current team, so the
            // invitee needs a team inside the org, not just their Personal Projects.
            await invitee.page.goto('/');
            await inviteeOrgPage.switchToOrg(orgName);
            await inviteeTeamPage.createTeam(teamName);
            await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
            await inviteeTeamPage.isTeamPartOfOrganization(orgName);
          },
        );

        await ownerAndInviteeTest.step(
          "Setup: org owner sets Create Teams permission to 'Only me'",
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.OnlyMe,
            );
          },
        );

        await ownerAndInviteeTest.step(
          'Non-owner member attempts to create a team within the org → restriction modal is shown',
          async () => {
            await invitee.page.reload();
            await inviteeTeamPage.clickCreateNewTeamMenuItem();
            await inviteeTeamPage.teamFormModal.checkTitle(TeamFormTitle.createTeam);
            await inviteeTeamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToCreateTeams(orgName),
            );
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
            // the pick actually registers a change (picking the selected
            // option shows no toast to wait on).
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
          'Non-owner member creates a team within the org → succeeds, no restriction modal',
          async () => {
            await invitee.page.goto('/');
            await inviteeOrgPage.switchToOrg(orgName);
            await inviteeTeamPage.createTeam(teamName);
            await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
            await inviteeTeamPage.isTeamPartOfOrganization(orgName);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [4089],
        "When permission is 'Only me', non-owner member is blocked from adding an existing team to the organization",
      ),
      async ({ buildOrgMatrix, adminConsolePage, advancedPermissionsPage }) => {
        const teamName = createTeamName('team1');

        const { users } = await enterpriseActivatedPageTest.step(
          "Setup: User1 owns OrgA with 'Create Teams' set to 'Only me', and User2, a member of OrgA only, owns a team outside any organization",
          async () => {
            const matrix = await buildOrgMatrix({
              users: ['User1', 'User2'],
              loggedInUser: 'User1',
              orgs: { orgA: { members: ['User2'] } },
            });
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.OnlyMe,
            );
            await createTeam(matrix.users.User2.request, teamName);
            return matrix;
          },
        );
        const user2Page = users.User2.page;
        const user2TeamPage = new TeamPage(user2Page);

        await enterpriseActivatedPageTest.step(
          `Open the settings of "Team 1" from the team options menu → "This team is not part of any organization" under "Team organization"`,
          async () => {
            await openDashboardAfterApiLogin(user2Page);
            await goToOtherTeam(
              new OrganizationPage(user2Page),
              user2TeamPage,
              teamName,
            );
            await user2TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user2TeamPage.isTeamNotPartOfAnyOrg();
          },
        );

        await enterpriseActivatedPageTest.step(
          "Click on the 'Add to an organization' link → the modal says there's no permission to add teams, with no organization selector",
          async () => {
            await user2TeamPage.openAddTeamToOrgModal();
            await user2TeamPage.teamFormModal.checkTitle(TeamFormTitle.addTeamToOrg);
            await user2TeamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToAddTeams,
            );
            await user2TeamPage.teamOrgModal.checkOrgPickerIsVisible(false);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase([4094], 'Only members with the "Who are" attributes can create teams'),
      async ({
        page,
        buildOrgMatrix,
        adminConsolePage,
        advancedPermissionsPage,
      }) => {
        enterpriseActivatedPageTest.slow();
        const createTeams = advancedPermissionsPage.createTeams;
        const { users, orgs } = await enterpriseActivatedPageTest.step(
          "Setup: User1 to User6 with their roles in OrgA's teams, and OrgA's attributes",
          () => buildOrgMatrix(ATTRIBUTE_RESTRICTIONS_MATRIX),
        );
        const orgA = orgs.orgA;
        const { banana, coconut } = orgA.teams;

        await enterpriseActivatedPageTest.step(
          "As User1, in Advanced Permissions, Create Teams, click 'Who are' without adding any attribute → 'Who are' is shown empty, the count still reads 'All members.'",
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await createTeams.addPart(RestrictionPart.WhoAre);
            await createTeams.checkPartAttributes(RestrictionPart.WhoAre, {});
            await createTeams.checkMemberCount('All members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "As User5, start creating a team in 'OrgA' from the teams dropdown, and cancel before confirming → the team creation form opens",
          async () => {
            const user5TeamPage = await openTeamDashboard(
              users.User5.page,
              banana.id,
            );
            await user5TeamPage.clickCreateNewTeamMenuItem();
            await user5TeamPage.teamFormModal.checkTitle(
              TeamFormTitle.createTeamInOrg(orgA.name),
            );
            await user5TeamPage.teamFormModal.checkCreateTeamFormIsVisible();
            await user5TeamPage.teamFormModal.close();
          },
        );

        await enterpriseActivatedPageTest.step(
          "As User1, add 'Legal' and 'Compliance' to 'Who are' → the count reads '4 members.'",
          async () => {
            await createTeams.addAttribute(RestrictionPart.WhoAre, 'Legal');
            await createTeams.addAttribute(RestrictionPart.WhoAre, 'Compliance');
            await createTeams.checkPartAttributes(RestrictionPart.WhoAre, {
              Legal: 3,
              Compliance: 1,
            });
            await createTeams.checkMemberCount('4 members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "As User5, try to create a team in 'OrgA' → a modal is displayed preventing team creation",
          async () => {
            const user5TeamPage = await openTeamDashboard(
              users.User5.page,
              banana.id,
            );
            await user5TeamPage.clickCreateNewTeamMenuItem();
            await user5TeamPage.teamFormModal.checkTitle(TeamFormTitle.createTeam);
            await user5TeamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToCreateTeams(orgA.name),
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "As User4, start creating a team in 'OrgA', and cancel before confirming → the team creation form opens",
          async () => {
            const user4TeamPage = await openTeamDashboard(
              users.User4.page,
              banana.id,
            );
            await user4TeamPage.clickCreateNewTeamMenuItem();
            await user4TeamPage.teamFormModal.checkTitle(
              TeamFormTitle.createTeamInOrg(orgA.name),
            );
            await user4TeamPage.teamFormModal.checkCreateTeamFormIsVisible();
            await user4TeamPage.teamFormModal.close();
          },
        );

        await enterpriseActivatedPageTest.step(
          "As User1, remove 'Compliance' with its ✕ → the count reads '3 members.'",
          async () => {
            await createTeams.removeAttribute('Compliance');
            await createTeams.checkMemberCount('3 members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "As User4, try to create a team in 'OrgA' → a modal is displayed preventing team creation",
          async () => {
            const user4TeamPage = await openTeamDashboard(
              users.User4.page,
              banana.id,
            );
            await user4TeamPage.clickCreateNewTeamMenuItem();
            await user4TeamPage.teamFormModal.checkTitle(TeamFormTitle.createTeam);
            await user4TeamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToCreateTeams(orgA.name),
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "As User1, who holds neither 'Legal' nor 'Compliance', create a team in 'OrgA' → the team is created",
          async () => {
            const user1TeamPage = await openTeamDashboard(page, coconut.id);
            await user1TeamPage.createTeam(createTeamName());
            await user1TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user1TeamPage.isTeamPartOfOrganization(orgA.name);
          },
        );
      },
    );
  },
);
