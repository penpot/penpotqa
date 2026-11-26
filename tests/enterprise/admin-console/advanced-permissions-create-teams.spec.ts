/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Create Teams (Permission)
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts): the owner
 * is Enterprise-entitled via the activation-code path (PRE/dev only), no
 * Stripe checkout. A second account is a `createDemoMember()` that joins the
 * org via the API (`joinOrganization()`), so no email is involved;
 * `buildOrgMatrix` sets up cases with several demo users, organizations,
 * teams and attributes.
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
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { joinOrganization } from 'helpers/organizations/join-organization';
import type { OrgMatrix } from 'helpers/org-matrix/org-matrix-types';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';

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

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Advanced Permissions > Create Teams (Permission)',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3328, 3329],
        "Org owner changes team creation permission to 'Only me' and back to 'Any member of the organization', each autosaved",
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
          '(3328) Admin Console > Advanced Permissions > Create Teams → both options available',
          async () => {
            await advancedPermissionsPage.isPermissionVisible(
              CreateTeamsPermission.AnyMember,
            );
            await advancedPermissionsPage.isPermissionVisible(
              CreateTeamsPermission.OnlyMe,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
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

        await enterpriseActivatedPageTest.step(
          "(3329) Select 'Any member of the organization' → option becomes selected (autosaved)",
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

    enterpriseActivatedPageTest(
      qase(
        [3332],
        "When permission is 'Only me', org owner can create a team successfully",
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
        teamPage,
      }) => {
        /**
         * "Create Teams" gates Team Settings' "Add to an organization" link,
         * which owners bypass. The team is created before the org, or it
         * would join the org on creation and leave no link to use.
         */
        const orgName = createOrgName();
        const teamName = createTeamName();

        await enterpriseActivatedPageTest.step(
          "Setup: Enterprise already active (activation code), create a team before any organization exists, then create an organization and set Create Teams permission to 'Only me'",
          async () => {
            await teamPage.createTeam(teamName);
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.OnlyMe,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
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

    enterpriseActivatedPageTest(
      qase(
        [3334, 3333],
        "Non-owner member can create a team under 'Any member of the organization', and sees the restriction modal once it is 'Only me'",
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
        createDemoMember,
      }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();
        const member = await createDemoMember('Member');
        const memberOrgPage = new OrganizationPage(member.page);
        const memberTeamPage = new TeamPage(member.page);

        await enterpriseActivatedPageTest.step(
          "Setup: Enterprise already active (activation code), create an organization (Create Teams at its default, 'Any member'), and make a second account a member of it",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.isPermissionSelected(
              CreateTeamsPermission.AnyMember,
            );
            await joinOrganization(
              page.context().request,
              adminConsolePage.getOrganizationId(),
              [member],
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          '(3334) Non-owner member creates a team within the org → succeeds, no restriction modal',
          async () => {
            await member.page.goto('/');
            await memberOrgPage.switchToOrg(orgName);
            await memberTeamPage.createTeam(teamName);
            await memberTeamPage.openTeamSettingsPageViaOptionsMenu();
            await memberTeamPage.isTeamPartOfOrganization(orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Setup: org owner sets Create Teams permission to 'Only me'",
          async () => {
            await advancedPermissionsPage.selectPermission(
              CreateTeamsPermission.OnlyMe,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          // The modal names the org of the member's team from 3334.
          '(3333) Non-owner member attempts to create a team within the org → restriction modal is shown',
          async () => {
            await member.page.reload();
            await memberTeamPage.clickCreateNewTeamMenuItem();
            await memberTeamPage.teamFormModal.checkTitle(TeamFormTitle.createTeam);
            await memberTeamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToCreateTeams(orgName),
            );
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
