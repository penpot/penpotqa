/**
 * Qase suite: Admin Console > Sidebar Menu > Attributes > Delete attribute
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts), with the
 * users, organizations, teams and attributes built by `buildOrgMatrix`, so no
 * email is involved.
 */
import {
  CreateTeamsPermission,
  MoveTeamsPermission,
  SendInvitationsPermission,
} from '@pages/admin-console/advanced-permissions-page';
import { AttributeOption } from '@pages/admin-console/attributes-page';
import { ViewTeamsRole } from '@pages/admin-console/delete-attribute-dialog-component';
import { RestrictionPart } from '@pages/admin-console/permission-control-component';
import {
  TeamFormMessage,
  TeamFormTitle,
} from '@pages/dashboard/modals/team-form-modal-component';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { openTeamDashboard } from 'helpers/teams/open-team-dashboard';
import { qase } from 'playwright-qase-reporter/playwright';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Attributes > Delete attribute',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [4122],
        'Delete an attribute nobody holds and no control uses, without confirmation',
      ),
      async ({ buildOrgMatrix, adminConsolePage, attributesPage }) => {
        const oldPilot = 'Old pilot';
        const marketing = 'Marketing';

        await enterpriseActivatedPageTest.step(
          `Setup: OrgA has "${oldPilot}", held by nobody, and "${marketing}", held by User1`,
          async () => {
            await buildOrgMatrix({
              users: ['User1'],
              loggedInUser: 'User1',
              orgs: {
                orgA: { attributes: { [oldPilot]: [], [marketing]: ['User1'] } },
              },
            });
            await adminConsolePage.openAttributesTab();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open the options of "${oldPilot}" → "Edit" and "Delete"`,
          async () => {
            await attributesPage.openAttributeOptions(oldPilot);
            await attributesPage.checkAttributeOptionsMenuItems(oldPilot, [
              AttributeOption.Edit,
              AttributeOption.Delete,
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Click "Delete" → deleted with no dialog`,
          async () => {
            await attributesPage.clickDeleteAttribute(oldPilot);
            await attributesPage.checkMessageIsVisible(`"${oldPilot}" deleted`);
            await attributesPage.deleteDialog.checkIsHidden();
            await attributesPage.checkAttributeIsListed(oldPilot, { listed: false });
          },
        );

        await enterpriseActivatedPageTest.step(
          `Reload → "${oldPilot}" is still gone and "${marketing}" is listed`,
          async () => {
            await adminConsolePage.refreshPage();
            await attributesPage.checkAttributeIsListed(oldPilot, { listed: false });
            await attributesPage.checkAttributeIsListed(marketing);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [4124],
        'Delete an attribute controls point at, leaving a control with nobody able to act',
      ),
      async ({
        buildOrgMatrix,
        adminConsolePage,
        advancedPermissionsPage,
        attributesPage,
      }) => {
        const { createTeams, moveTeams } = advancedPermissionsPage;
        const profile = adminConsolePage.memberProfile;
        const compliance = 'Compliance';
        const juniorStaff = 'Junior staff';
        const betaTesters = 'Beta testers';

        const { users, orgs } = await enterpriseActivatedPageTest.step(
          `Setup: User4 owns Team Banana in OrgA, belongs to OrgB, and holds "${compliance}" and "${juniorStaff}"`,
          () =>
            buildOrgMatrix({
              users: ['User1', 'User4'],
              loggedInUser: 'User1',
              orgs: {
                orgA: {
                  teams: { banana: { User4: 'owner' } },
                  attributes: {
                    [compliance]: ['User4'],
                    [juniorStaff]: ['User4'],
                    [betaTesters]: [],
                  },
                },
                orgB: { members: ['User4'] },
              },
            }),
        );
        const { User4 } = users;
        const { orgA, orgB } = orgs;
        const { banana } = orgA.teams;

        await enterpriseActivatedPageTest.step(
          `Setup: Create Teams "Who are" "${betaTesters}" and "${compliance}", and Move teams "Except" "${compliance}"`,
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await createTeams.addAttribute(RestrictionPart.WhoAre, betaTesters);
            await createTeams.addAttribute(RestrictionPart.WhoAre, compliance);
            await moveTeams.addExclusion(compliance);
            await adminConsolePage.openAttributesTab();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Delete "${compliance}" → the dialog lists both controls and warns only about Create Teams`,
          async () => {
            await attributesPage.clickDeleteAttribute(compliance);
            await attributesPage.deleteDialog.checkSummary(
              '1 member holds this attribute, and these controls point at it:',
              ['Create Teams', 'Move teams across organizations'],
            );
            await attributesPage.deleteDialog.checkWarningIsVisible(
              'Create Teams would be left with nobody able to create teams.',
            );
            await attributesPage.deleteDialog.checkWarningIsHidden(
              'Move teams across organizations',
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          `Click "Delete attribute" → "${compliance}" leaves the list`,
          async () => {
            await attributesPage.deleteDialog.confirm();
            await attributesPage.checkMessageIsVisible(`"${compliance}" deleted`);
            await attributesPage.checkAttributeIsListed(compliance, {
              listed: false,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open User4's profile → only "${juniorStaff}"`,
          async () => {
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.openMemberProfile(User4.name);
            await profile.checkAssignedAttributes([juniorStaff]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Go to Advanced Permissions → Create Teams keeps only "${betaTesters}" with no members, Move teams has no restriction`,
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await createTeams.checkSelectedOption(CreateTeamsPermission.AnyMember);
            await createTeams.checkPartAttributes(RestrictionPart.WhoAre, {
              [betaTesters]: 0,
            });
            await createTeams.checkMemberCount('No members.');
            await advancedPermissionsPage.isPermissionSelected(
              MoveTeamsPermission.TeamOwners,
            );
            await moveTeams.checkNoExclusion();
          },
        );

        const user4TeamPage = await enterpriseActivatedPageTest.step(
          'User4 tries to create a team in OrgA → a dialog says they are not allowed',
          async () => {
            const teamPage = await openTeamDashboard(User4.page, banana.id);
            await teamPage.clickCreateNewTeamMenuItem();
            await teamPage.teamFormModal.checkTitle(TeamFormTitle.createTeam);
            await teamPage.teamFormModal.checkMessageIsVisible(
              TeamFormMessage.noPermissionToCreateTeams(orgA.name),
            );
            return teamPage;
          },
        );

        await enterpriseActivatedPageTest.step(
          'User4 starts moving Team Banana to OrgB → the move is offered, then cancels',
          async () => {
            await user4TeamPage.goToTeamDashboard(banana.id);
            await user4TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user4TeamPage.openChangeTeamOrgModal();
            await user4TeamPage.teamOrgModal.openOrgPicker();
            await user4TeamPage.isOrgPickerOptionDisabled(orgB.name, false);
            await user4TeamPage.selectOrgInPicker(orgB.name);
            await user4TeamPage.teamOrgModal.close();
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase([4125], 'Delete an attribute nobody holds that a control points at'),
      async ({
        buildOrgMatrix,
        adminConsolePage,
        advancedPermissionsPage,
        attributesPage,
      }) => {
        const { createTeams } = advancedPermissionsPage;
        const betaTesters = 'Beta testers';

        await enterpriseActivatedPageTest.step(
          `Setup: OrgA has "${betaTesters}", held by nobody, in Create Teams' "Who are"`,
          async () => {
            await buildOrgMatrix({
              users: ['User1'],
              loggedInUser: 'User1',
              orgs: { orgA: { attributes: { [betaTesters]: [] } } },
            });
            await adminConsolePage.openAdvancedPermissionsTab();
            await createTeams.addAttribute(RestrictionPart.WhoAre, betaTesters);
            await adminConsolePage.openAttributesTab();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Delete "${betaTesters}" → the dialog lists Create Teams, with no warning`,
          async () => {
            await attributesPage.clickDeleteAttribute(betaTesters);
            await attributesPage.deleteDialog.checkSummary(
              'Nobody holds this attribute, and these controls point at it:',
              ['Create Teams'],
            );
            await attributesPage.deleteDialog.checkWarningIsHidden();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Click "Delete attribute" → "${betaTesters}" leaves the list`,
          async () => {
            await attributesPage.deleteDialog.confirm();
            await attributesPage.checkMessageIsVisible(`"${betaTesters}" deleted`);
            await attributesPage.checkAttributeIsListed(betaTesters, {
              listed: false,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          'Go to Advanced Permissions → Create Teams has no restriction and reads "All members."',
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await createTeams.checkSelectedOption(CreateTeamsPermission.AnyMember);
            await createTeams.checkPartIsAdded(RestrictionPart.WhoAre, false);
            await createTeams.checkMemberCount('All members.');
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [4126],
        'Warn which teams would be left with nobody able to send invitations',
      ),
      async ({
        buildOrgMatrix,
        adminConsolePage,
        advancedPermissionsPage,
        attributesPage,
      }) => {
        const { sendInvitations } = advancedPermissionsPage;
        const legal = 'Legal';
        const compliance = 'Compliance';

        const { orgs } = await enterpriseActivatedPageTest.step(
          "Setup: User1 to User5 with their roles in OrgA's teams, and OrgA's attributes",
          () =>
            buildOrgMatrix({
              users: ['User1', 'User2', 'User3', 'User4', 'User5'],
              loggedInUser: 'User1',
              orgs: {
                orgA: {
                  teams: {
                    apple: { User2: 'owner', User3: 'admin' },
                    banana: { User4: 'owner', User5: 'admin' },
                    coconut: { User1: 'owner' },
                  },
                  attributes: {
                    [legal]: ['User2', 'User3'],
                    [compliance]: ['User4'],
                  },
                },
              },
            }),
        );
        const { banana, coconut } = orgs.orgA.teams;

        await enterpriseActivatedPageTest.step(
          `Setup: Send invitations "Who are" "${legal}" and "${compliance}"`,
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await sendInvitations.addAttribute(RestrictionPart.WhoAre, legal);
            await sendInvitations.addAttribute(RestrictionPart.WhoAre, compliance);
            await adminConsolePage.openAttributesTab();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Delete "${compliance}" → the dialog warns 2 teams would be left with nobody able to send invitations`,
          async () => {
            await attributesPage.clickDeleteAttribute(compliance);
            await attributesPage.deleteDialog.checkSummary(
              '1 member holds this attribute, and these controls point at it:',
              ['Send invitations'],
            );
            await attributesPage.deleteDialog.checkWarningIsVisible(
              'Send invitations: 2 teams would be left with nobody able to send invitations.',
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'Click "View teams" → Team Banana and Team Coconut, with User1\'s role in each',
          async () => {
            await attributesPage.deleteDialog.openTeams();
            await attributesPage.deleteDialog.checkTeams([
              { name: banana.name, role: ViewTeamsRole.NotAMember },
              { name: coconut.name, role: ViewTeamsRole.Owner },
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Click "Hide teams" → the list closes',
          async () => {
            await attributesPage.deleteDialog.closeTeams();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Click "Delete attribute" → "${compliance}" leaves the list`,
          async () => {
            await attributesPage.deleteDialog.confirm();
            await attributesPage.checkMessageIsVisible(`"${compliance}" deleted`);
            await attributesPage.checkAttributeIsListed(compliance, {
              listed: false,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          `Go to Advanced Permissions → Send invitations keeps only "${legal}", with 2 teams nobody can invite to`,
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await sendInvitations.checkSelectedOption(
              SendInvitationsPermission.OwnersAndAdmins,
            );
            await sendInvitations.checkPartAttributes(RestrictionPart.WhoAre, {
              [legal]: 2,
            });
            await sendInvitations.checkVacancyMessage(
              '2 teams have no one who can invite.',
            );
          },
        );
      },
    );
  },
);
