/**
 * Qase suite: Admin Console > Sidebar Menu > Attributes > Edit attribute
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts). Attributes
 * have no Penpot API, so the set-up creates them from the Attributes tab; 4116
 * builds its users and team with `buildOrgMatrix`.
 */
import {
  CreateTeamsPermission,
  SendInvitationsPermission,
} from '@pages/admin-console/advanced-permissions-page';
import { AttributeOption } from '@pages/admin-console/attributes-page';
import { RestrictionPart } from '@pages/admin-console/permission-control-component';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { joinOrganization } from 'helpers/organizations/join-organization';
import { openTeamInvitations } from 'helpers/teams/open-team-invitations';
import { qase } from 'playwright-qase-reporter/playwright';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Attributes > Edit attribute',
  () => {
    enterpriseActivatedPageTest(
      qase([4115], 'Rename an attribute and change its description'),
      async ({
        page,
        orgPage,
        adminConsolePage,
        attributesPage,
        createDemoMember,
      }) => {
        const editDialog = attributesPage.editDialog;
        const contractors = {
          name: 'Contractors',
          description: 'People from agencies',
        };
        const renamed = {
          name: 'External contractors',
          description: 'Anyone not on the payroll',
        };
        const newDescription = 'Agencies and freelancers';
        const user2 = await createDemoMember('User2');

        await enterpriseActivatedPageTest.step(
          `Setup: create an org with "${contractors.name}" ("${contractors.description}"), held by "${user2.name}"`,
          async () => {
            await createOrgForLicensedAccount(orgPage, createOrgName());
            await joinOrganization(
              page.context().request,
              adminConsolePage.getOrganizationId(),
              [user2],
            );
            await adminConsolePage.refreshPage();
            await adminConsolePage.openAttributesTab();
            await attributesPage.createAttribute(
              contractors.name,
              contractors.description,
            );
            await attributesPage.addPeopleToAttribute(contractors.name, [
              user2.name,
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open the options of "${contractors.name}" → "Edit" and "Delete"`,
          async () => {
            await attributesPage.openAttributeOptions(contractors.name);
            await attributesPage.checkAttributeOptionsMenuItems(contractors.name, [
              AttributeOption.Edit,
              AttributeOption.Delete,
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Click "Edit" → its name, description and holders, with "Save changes" disabled',
          async () => {
            await attributesPage.openEditAttributeDialog(contractors.name);
            await editDialog.checkFieldsHaveValues(
              contractors.name,
              contractors.description,
            );
            await editDialog.checkHoldersMessageIsVisible(
              '1 member holds this attribute',
            );
            await editDialog.checkSubmitIsEnabled(false);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Change the name to "${renamed.name}" and the description → "Save changes" is enabled`,
          async () => {
            await editDialog.typeName(renamed.name);
            await editDialog.typeDescription(renamed.description);
            await editDialog.checkSubmitIsEnabled();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Click "Save changes" → "${renamed.name}" replaces "${contractors.name}" in the list`,
          async () => {
            await editDialog.clickSubmit();
            await editDialog.checkIsHidden();
            await attributesPage.checkMessageIsVisible(
              `"${contractors.name}" is now "${renamed.name}"`,
            );
            await attributesPage.checkAttributeIsListed(renamed.name, {
              description: renamed.description,
            });
            await attributesPage.checkAttributeIsListed(contractors.name, {
              listed: false,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          `Change only the description to "${newDescription}" → the name is kept`,
          async () => {
            await attributesPage.editAttribute(renamed.name, {
              description: newDescription,
            });
            await attributesPage.checkMessageIsVisible(
              `Description for "${renamed.name}" updated.`,
            );
            await attributesPage.checkAttributeIsListed(renamed.name, {
              description: newDescription,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          `Reload → "${renamed.name}" is kept, with 1 person`,
          async () => {
            await adminConsolePage.refreshPage();
            await attributesPage.checkAttributeIsListed(renamed.name, {
              description: newDescription,
            });
            await attributesPage.checkAttributePeopleCount(renamed.name, 1);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [4116],
        'A renamed attribute keeps its people and restrictions, and shows the new name everywhere',
      ),
      async ({
        buildOrgMatrix,
        adminConsolePage,
        advancedPermissionsPage,
        attributesPage,
      }) => {
        const { createTeams, sendInvitations } = advancedPermissionsPage;
        const profile = adminConsolePage.memberProfile;
        const contractors = 'Contractors';
        const renamed = {
          name: 'External contractors',
          description: 'Agencies and freelancers',
        };

        const { users, orgs } = await enterpriseActivatedPageTest.step(
          "Setup: User2 owns Team Apple in OrgA, and User3 and User4 are OrgA's members",
          () =>
            buildOrgMatrix({
              users: ['User1', 'User2', 'User3', 'User4'],
              loggedInUser: 'User1',
              orgs: {
                orgA: {
                  teams: { apple: { User2: 'owner' } },
                  members: ['User3', 'User4'],
                },
              },
            }),
        );
        const { User2, User3, User4 } = users;
        const { apple } = orgs.orgA.teams;

        await enterpriseActivatedPageTest.step(
          `Setup: User2 and User3 hold "${contractors}", and Send invitations excludes it`,
          async () => {
            await adminConsolePage.openAttributesTab();
            await attributesPage.createAttribute(
              contractors,
              'People from agencies',
            );
            await attributesPage.addPeopleToAttribute(contractors, [
              User2.name,
              User3.name,
            ]);
            await adminConsolePage.openAdvancedPermissionsTab();
            await sendInvitations.addAttribute(RestrictionPart.Except, contractors);
            await adminConsolePage.openAttributesTab();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Rename "${contractors}" to "${renamed.name}" → listed with its new description and 2 people`,
          async () => {
            await attributesPage.editAttribute(contractors, renamed);
            await attributesPage.checkAttributeIsListed(renamed.name, {
              description: renamed.description,
            });
            await attributesPage.checkAttributePeopleCount(renamed.name, 2);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open "${renamed.name}" → used by Send invitations, held by User2 and User3`,
          async () => {
            await attributesPage.openAttribute(renamed.name);
            await attributesPage.panel.checkHeader(
              renamed.name,
              renamed.description,
            );
            await attributesPage.panel.checkUsedBy([
              { control: 'Send invitations', area: 'Advanced permissions' },
            ]);
            await attributesPage.panel.checkPeopleCount(2);
            await attributesPage.panel.checkPeople([
              { name: User2.name, email: User2.email },
              { name: User3.name, email: User3.email },
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open User2's and User3's profiles → both show "${renamed.name}"`,
          async () => {
            await attributesPage.panel.close();
            await adminConsolePage.openPeopleTab();
            for (const user of [User2, User3]) {
              await adminConsolePage.openMemberProfile(user.name);
              await profile.checkAssignedAttributes([renamed.name]);
            }
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open User4's "Assign attribute" → only "${renamed.name}", with its description`,
          async () => {
            await adminConsolePage.openMemberProfile(User4.name);
            await profile.openAssignAttributeDropdown();
            await profile.checkAssignableAttributes([
              { name: renamed.name, people: 2, description: renamed.description },
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Go to Advanced Permissions → Send invitations still excludes "${renamed.name}"`,
          async () => {
            await profile.closeAssignAttributeDropdown();
            await adminConsolePage.openAdvancedPermissionsTab();
            await sendInvitations.checkSelectedOption(
              SendInvitationsPermission.OwnersAndAdmins,
            );
            await sendInvitations.checkPartAttributes(RestrictionPart.Except, {
              [renamed.name]: 2,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          `In Create Teams, open "Who are" > "Add attribute" → lists "${renamed.name}" and not "${contractors}"`,
          async () => {
            await createTeams.addPart(RestrictionPart.WhoAre);
            await createTeams.openAttributePicker(RestrictionPart.WhoAre);
            await createTeams.checkAttributeOption(
              renamed.name,
              2,
              renamed.description,
            );
            await createTeams.checkAttributeOptionIsHidden(contractors);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Close the picker and remove "Who are" → Create Teams has no restriction',
          async () => {
            await createTeams.closeAttributePicker();
            await createTeams.removePart(RestrictionPart.WhoAre);
            await createTeams.checkSelectedOption(CreateTeamsPermission.AnyMember);
            await createTeams.checkPartIsAdded(RestrictionPart.Except, false);
          },
        );

        await enterpriseActivatedPageTest.step(
          "User2 opens Team Apple's Invitations → 'Invite people' is disabled, with the no-permission tooltip",
          async () => {
            const user2TeamPage = await openTeamInvitations(User2.page, apple.id);
            await user2TeamPage.invitations.checkInvitePeopleIsDisabled();
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [4117],
        'Reject a duplicate name when editing, but accept a letter-case change of its own name',
      ),
      async ({ orgPage, adminConsolePage, attributesPage }) => {
        const editDialog = attributesPage.editDialog;
        const legal = { name: 'legal', description: 'Legal department' };
        const legalCapitalized = 'Legal';
        const junior = 'Junior';
        const legalTeam = 'Legal team';

        await enterpriseActivatedPageTest.step(
          `Setup: create an org with "${legal.name}" and "${junior}"`,
          async () => {
            await createOrgForLicensedAccount(orgPage, createOrgName());
            await adminConsolePage.openAttributesTab();
            await attributesPage.createAttribute(legal.name, legal.description);
            await attributesPage.createAttribute(junior);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Rename "${legal.name}" to "${legalCapitalized}" → accepted with no duplicate error`,
          async () => {
            await attributesPage.editAttribute(legal.name, {
              name: legalCapitalized,
            });
            await attributesPage.checkMessageIsVisible(
              `"${legal.name}" is now "${legalCapitalized}"`,
            );
            await attributesPage.checkAttributeIsListed(legalCapitalized, {
              description: legal.description,
            });
          },
        );

        await enterpriseActivatedPageTest.step(
          `Rename "${legalCapitalized}" to "junior" → duplicate name error, the dialog stays open`,
          async () => {
            await attributesPage.openEditAttributeDialog(legalCapitalized);
            await editDialog.typeName('junior');
            await editDialog.clickSubmit();
            await editDialog.checkDuplicateNameErrorIsVisible('junior');
          },
        );

        await enterpriseActivatedPageTest.step(
          'Change the name to "JUNIOR" → the same error, and nothing is saved',
          async () => {
            await editDialog.typeName('JUNIOR');
            await editDialog.clickSubmit();
            await editDialog.checkDuplicateNameErrorIsVisible('JUNIOR');
            await attributesPage.checkAttributeIsListed(legalCapitalized);
            await attributesPage.checkAttributeIsListed(junior);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Change the name to "${legalTeam}" → saved, and "${junior}" kept as typed`,
          async () => {
            await editDialog.typeName(legalTeam);
            await editDialog.clickSubmit();
            await editDialog.checkIsHidden();
            await attributesPage.checkAttributeIsListed(legalTeam);
            await attributesPage.checkAttributeIsListed(junior);
          },
        );
      },
    );
  },
);
