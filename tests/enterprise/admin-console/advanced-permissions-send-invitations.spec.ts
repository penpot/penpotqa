/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > Send invitations (Permission)
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts): the owner
 * is Enterprise-entitled via the activation-code path (PRE/dev only), no
 * Stripe checkout. Team admins are `createDemoMember()` accounts added to
 * the team via the API (`addTeamMember()`), so no email is involved.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { addTeamMember } from 'helpers/teams/add-team-member';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { SendInvitationsPermission } from '@pages/admin-console/advanced-permissions-page';
import { RestrictionPart } from '@pages/admin-console/permission-control-component';
import { TeamPage } from '@pages/dashboard/team-page';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { createInviteEmail } from 'helpers/teams/invite-email';
import { openTeamDashboard } from 'helpers/teams/open-team-dashboard';
import { openTeamInvitations } from 'helpers/teams/open-team-invitations';
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
 * Used by Qase 4096, 4098 and 4099: update it when their preconditions change.
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
  'Admin Console > Sidebar Menu > Advanced Permissions > Send invitations (Permission)',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3359, 3360],
        'Team owner and team admin can invite members under default configuration',
      ),
      async ({ page, orgPage, adminConsolePage, teamPage, createDemoMember }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();
        const admin = await createDemoMember('Admin');
        const adminTeamPage = new TeamPage(admin.page);

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an org with a team, and add a second account as a team admin',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.goToFiles(orgName);
            await teamPage.createTeam(teamName);
            const teamId = teamPage.getTeamIdFromUrl();
            await addTeamMember(
              page.context().request,
              admin,
              teamId,
              InvitationRole.Admin,
            );
            await adminTeamPage.goToTeamDashboard(teamId);
          },
        );

        await enterpriseActivatedPageTest.step(
          '3359: Team owner can invite members under default configuration',
          async () => {
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.isInviteMembersPopUpHeaderVisible();
          },
        );

        await enterpriseActivatedPageTest.step(
          '3360: Team admin can invite members under default configuration',
          async () => {
            await adminTeamPage.openInvitationsPageViaOptionsMenu();
            await adminTeamPage.clickInviteMembersToTeamButton();
            await adminTeamPage.isInviteMembersPopUpHeaderVisible();
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase([3361], 'Switch invitation permission setting to Team owners only'),
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

        await enterpriseActivatedPageTest.step(
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

    enterpriseActivatedPageTest(
      qase(
        [3362, 3364],
        'Team owners only setting restricts team admins from inviting and managing invitations',
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        teamPage,
        advancedPermissionsPage,
        createDemoMember,
      }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();
        const pendingEmail = `pending-${Date.now()}@demo.example.com`;
        const admin = await createDemoMember('Admin');
        const adminTeamPage = new TeamPage(admin.page);

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an org with a team, add a second account as a team admin, and leave one invitation pending',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.goToFiles(orgName);
            await teamPage.createTeam(teamName);
            const teamId = teamPage.getTeamIdFromUrl();
            await addTeamMember(
              page.context().request,
              admin,
              teamId,
              InvitationRole.Admin,
            );
            await adminTeamPage.goToTeamDashboard(teamId);
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(pendingEmail);
            await teamPage.clickSendInvitationButton();
            await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
          },
        );

        await enterpriseActivatedPageTest.step(
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

        await enterpriseActivatedPageTest.step(
          '3362: Team owners only setting restricts team admins from inviting',
          async () => {
            // The admin's session predates the permission switch above —
            // reload to pick up the now-restrictive permission.
            await admin.page.reload();
            await adminTeamPage.openInvitationsPageViaOptionsMenu();
            // The invitations list briefly renders its empty state while
            // loading, whose "Invite people" button duplicates the header one
            // and makes the disabled check ambiguous. Waiting for the pending
            // record gates on the list being rendered (and asserts it, as
            // Qase 3364 requires).
            await adminTeamPage.isInvitationRecordDisplayed([
              { email: pendingEmail, role: 'Editor', status: 'Pending' },
            ]);
            await adminTeamPage.isInviteMembersToTeamButtonDisabled();
          },
        );

        await enterpriseActivatedPageTest.step(
          '3364: Restricted team admin can only view invitations under Team owners only',
          async () => {
            await adminTeamPage.isInvitationSelectable(pendingEmail, false);
            await adminTeamPage.isInvitationRoleEditable(pendingEmail, false);
            await adminTeamPage.isCopyInvitationLinkButtonVisible(
              pendingEmail,
              false,
            );
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [4096],
        'Build a restriction with "Who are" and "Except", and remove each part',
      ),
      async ({
        page,
        buildOrgMatrix,
        adminConsolePage,
        advancedPermissionsPage,
      }) => {
        enterpriseActivatedPageTest.slow();
        const sendInvitations = advancedPermissionsPage.sendInvitations;

        await enterpriseActivatedPageTest.step(
          "Setup: User1 to User6 with their roles in OrgA's teams, and OrgA's attributes",
          () => buildOrgMatrix(ATTRIBUTE_RESTRICTIONS_MATRIX),
        );

        await enterpriseActivatedPageTest.step(
          "Open Advanced Permissions → Send invitations is 'Team owners and admins' with 'Who are' and 'Except', '5 members.'",
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await sendInvitations.checkSelectedOption(
              SendInvitationsPermission.OwnersAndAdmins,
            );
            await sendInvitations.checkPartIsAdded(RestrictionPart.WhoAre, false);
            await sendInvitations.checkPartIsAdded(RestrictionPart.Except, false);
            await sendInvitations.checkMemberCount('5 members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Click 'Except' → it's added with '+ Add attribute', the picker stays closed, 'Who are' is still available",
          async () => {
            await sendInvitations.addPart(RestrictionPart.Except);
            await sendInvitations.checkAttributePickerIsOpen(false);
            await sendInvitations.checkPartIsAdded(RestrictionPart.WhoAre, false);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Search 'Jun' and select 'Junior' → listed as 'Junior 1', 'Except' shows 'Junior 1', '4 members.'",
          async () => {
            await sendInvitations.openAttributePicker(RestrictionPart.Except);
            await sendInvitations.searchAttribute('Jun');
            await sendInvitations.checkAttributeOption('Junior', 1);
            await sendInvitations.selectAttribute('Junior');
            await sendInvitations.checkPartAttributes(RestrictionPart.Except, {
              Junior: 1,
            });
            await sendInvitations.checkMemberCount('4 members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Click 'Who are' → it's added above 'Except', still '4 members.'",
          async () => {
            await sendInvitations.addPart(RestrictionPart.WhoAre);
            await sendInvitations.checkWhoAreIsAboveExcept();
            await sendInvitations.checkMemberCount('4 members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Search 'Leg' and select 'Legal' in 'Who are' → listed as 'Legal 3', 'Who are' 'Legal 3' above 'Except' 'Junior 1', '1 member.'",
          async () => {
            await sendInvitations.openAttributePicker(RestrictionPart.WhoAre);
            await sendInvitations.searchAttribute('Leg');
            await sendInvitations.checkAttributeOption('Legal', 3);
            await sendInvitations.selectAttribute('Legal');
            await sendInvitations.checkPartAttributes(RestrictionPart.WhoAre, {
              Legal: 3,
            });
            await sendInvitations.checkWhoAreIsAboveExcept();
            await sendInvitations.checkMemberCount('1 member.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Add 'Compliance' to 'Who are' → 'Legal 3' and 'Compliance 1', '2 members.'",
          async () => {
            await sendInvitations.addAttribute(RestrictionPart.WhoAre, 'Compliance');
            await sendInvitations.checkPartAttributes(RestrictionPart.WhoAre, {
              Legal: 3,
              Compliance: 1,
            });
            await sendInvitations.checkMemberCount('2 members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Remove 'Compliance' and reload → 'Who are' 'Legal 3' above 'Except' 'Junior 1', '1 member.'",
          async () => {
            await sendInvitations.removeAttribute('Compliance');
            await page.reload();
            await sendInvitations.checkPartAttributes(RestrictionPart.WhoAre, {
              Legal: 3,
            });
            await sendInvitations.checkPartAttributes(RestrictionPart.Except, {
              Junior: 1,
            });
            await sendInvitations.checkWhoAreIsAboveExcept();
            await sendInvitations.checkMemberCount('1 member.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Remove 'Legal' → 'Who are' is available again, only 'Except' 'Junior 1' remains, '4 members.'",
          async () => {
            await sendInvitations.removeAttribute('Legal');
            await sendInvitations.checkPartIsAdded(RestrictionPart.WhoAre, false);
            await sendInvitations.checkPartAttributes(RestrictionPart.Except, {
              Junior: 1,
            });
            await sendInvitations.checkMemberCount('4 members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Remove 'Junior' → 'Who are' and 'Except' are empty as at the start, '5 members.'",
          async () => {
            await sendInvitations.removeAttribute('Junior');
            await sendInvitations.checkPartIsAdded(RestrictionPart.WhoAre, false);
            await sendInvitations.checkPartIsAdded(RestrictionPart.Except, false);
            await sendInvitations.checkMemberCount('5 members.');
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [4098],
        'Send invitations follows the restriction and never widens beyond the role option',
      ),
      async ({ buildOrgMatrix, adminConsolePage, advancedPermissionsPage }) => {
        enterpriseActivatedPageTest.slow();
        const sendInvitations = advancedPermissionsPage.sendInvitations;
        const { users, orgs } = await enterpriseActivatedPageTest.step(
          "Setup: User1 to User6 with their roles in OrgA's teams, and OrgA's attributes",
          () => buildOrgMatrix(ATTRIBUTE_RESTRICTIONS_MATRIX),
        );
        const { apple, banana } = orgs.orgA.teams;

        await enterpriseActivatedPageTest.step(
          "User1 adds 'Junior' to 'Except' → 'Except' shows 'Junior 1'",
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await sendInvitations.addAttribute(RestrictionPart.Except, 'Junior');
            await sendInvitations.checkPartAttributes(RestrictionPart.Except, {
              Junior: 1,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          "User3 opens Team Apple's Invitations → 'Invite people' is disabled, with the no-permission tooltip",
          async () => {
            const user3TeamPage = await openTeamInvitations(
              users.User3.page,
              apple.id,
            );
            await user3TeamPage.invitations.checkInvitePeopleIsDisabled();
          },
        );

        await enterpriseActivatedPageTest.step(
          "User1 adds 'Legal' to 'Who are' → 'Who are' shows 'Legal 3'",
          async () => {
            await sendInvitations.addAttribute(RestrictionPart.WhoAre, 'Legal');
            await sendInvitations.checkPartAttributes(RestrictionPart.WhoAre, {
              Legal: 3,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          'User2 invites a person to Team Apple → the invitation is sent',
          async () => {
            const user2TeamPage = await openTeamInvitations(
              users.User2.page,
              apple.id,
            );
            await user2TeamPage.invitations.invitePerson(
              createInviteEmail('editor'),
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "User6, an Editor holding 'Legal', opens Team Apple → can't invite, a restriction never widens beyond the role",
          async () => {
            const user6TeamPage = await openTeamDashboard(
              users.User6.page,
              apple.id,
            );
            await user6TeamPage.isInvitationsMenuItemHidden();
          },
        );

        await enterpriseActivatedPageTest.step(
          "User4 and then User5 open Team Banana's Invitations → 'Invite people' is disabled for both",
          async () => {
            for (const user of [users.User4, users.User5]) {
              const teamPage = await openTeamInvitations(user.page, banana.id);
              await teamPage.invitations.checkInvitePeopleIsDisabled();
            }
          },
        );

        await enterpriseActivatedPageTest.step(
          "User1 removes 'Legal' from 'Who are' → only 'Except' 'Junior' remains",
          async () => {
            await sendInvitations.removeAttribute('Legal');
            await sendInvitations.checkPartIsAdded(RestrictionPart.WhoAre, false);
            await sendInvitations.checkPartAttributes(RestrictionPart.Except, {
              Junior: 1,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          'User5 invites a person to Team Banana → the invitation is sent',
          async () => {
            const user5TeamPage = await openTeamInvitations(
              users.User5.page,
              banana.id,
            );
            await user5TeamPage.invitations.invitePerson(
              createInviteEmail('editor'),
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "User1 removes 'Junior' from 'Except' → Send invitations has no restriction",
          async () => {
            await sendInvitations.removeAttribute('Junior');
            await sendInvitations.checkPartIsAdded(RestrictionPart.WhoAre, false);
            await sendInvitations.checkPartIsAdded(RestrictionPart.Except, false);
          },
        );

        await enterpriseActivatedPageTest.step(
          'User3 invites a person to Team Apple → the invitation is sent',
          async () => {
            const user3TeamPage = await openTeamInvitations(
              users.User3.page,
              apple.id,
            );
            await user3TeamPage.invitations.invitePerson(
              createInviteEmail('editor'),
            );
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase([4099], 'Send invitations lists the teams with no one who can invite'),
      async ({
        page,
        buildOrgMatrix,
        adminConsolePage,
        advancedPermissionsPage,
      }) => {
        enterpriseActivatedPageTest.slow();
        const sendInvitations = advancedPermissionsPage.sendInvitations;
        const { orgs } = await enterpriseActivatedPageTest.step(
          "Setup: User1 to User6 with their roles in OrgA's teams, OrgA's attributes, and 'Junior' in Send invitations' 'Except'",
          async () => {
            const matrix = await buildOrgMatrix(ATTRIBUTE_RESTRICTIONS_MATRIX);
            await adminConsolePage.openAdvancedPermissionsTab();
            await sendInvitations.addAttribute(RestrictionPart.Except, 'Junior');
            return matrix;
          },
        );
        const { banana, coconut } = orgs.orgA.teams;
        const vacancy = '2 teams have no one who can invite.';

        await enterpriseActivatedPageTest.step(
          "Look at Send invitations → no vacancy message, '4 members.'",
          async () => {
            await sendInvitations.checkVacancyMessage(null);
            await sendInvitations.checkMemberCount('4 members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          `Add 'Legal' to 'Who are' → '${vacancy}' as information, '1 member.'`,
          async () => {
            await sendInvitations.addAttribute(RestrictionPart.WhoAre, 'Legal');
            await sendInvitations.checkVacancyMessage(vacancy);
            await sendInvitations.checkMemberCount('1 member.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Click the vacancy message → 'View teams' lists Team Banana and Team Coconut; 'Accept' closes it",
          async () => {
            const viewTeams = await sendInvitations.openVacantTeams();
            await viewTeams.checkTeams(
              'These are the 2 teams with no one who can invite:',
              [banana.name, coconut.name],
            );
            await viewTeams.accept();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Reload the page → the vacancy message is still shown',
          async () => {
            await page.reload();
            await sendInvitations.checkVacancyMessage(vacancy);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Select 'Team owners only' → no vacancy message, '3 members.'",
          async () => {
            await sendInvitations.selectOption(SendInvitationsPermission.OwnersOnly);
            await sendInvitations.checkVacancyMessage(null);
            await sendInvitations.checkMemberCount('3 members.');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Select 'Team owners and admins' → its restriction is still there, and so is the vacancy message",
          async () => {
            await sendInvitations.selectOption(
              SendInvitationsPermission.OwnersAndAdmins,
            );
            await sendInvitations.checkPartAttributes(RestrictionPart.WhoAre, {
              Legal: 3,
            });
            await sendInvitations.checkPartAttributes(RestrictionPart.Except, {
              Junior: 1,
            });
            await sendInvitations.checkVacancyMessage(vacancy);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Remove 'Legal' from 'Who are' → the vacancy message disappears, '4 members.'",
          async () => {
            await sendInvitations.removeAttribute('Legal');
            await sendInvitations.checkVacancyMessage(null);
            await sendInvitations.checkMemberCount('4 members.');
          },
        );
      },
    );
  },
);
