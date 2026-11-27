/**
 * Qase suite: Admin Console > Sidebar Menu > Attributes > Attribute panel
 *
 * Base: `enterpriseActivatedPageTest`, with the organization, its members and
 * attributes built by `buildOrgMatrix()` (demo accounts, no email).
 */
import { RestrictionPart } from '@pages/admin-console/permission-control-component';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import type { OrgMatrix } from 'helpers/org-matrix/org-matrix-types';
import { qase } from 'playwright-qase-reporter/playwright';

/**
 * The organization of the Attribute panel cases
 * (https://github.com/penpot/penpot-nitrate/issues/511): User1 owns OrgA, whose
 * other members hold its attributes. 4106, 4107 and 4108 run one after the
 * other on it, so 'Marketing' starts with User2 as well as User5: that is
 * 4108's precondition, and 4107 gives User2 the 'Legal' that 4108 expects.
 */
const ATTRIBUTE_PANEL_MATRIX: OrgMatrix = {
  users: ['User1', 'User2', 'User3', 'User4', 'User5', 'User6'],
  loggedInUser: 'User1',
  orgs: {
    orgA: {
      members: ['User2', 'User3', 'User4', 'User5', 'User6'],
      attributes: {
        'Legal': ['User3', 'User6'],
        'Compliance': ['User4'],
        'Beta testers': [],
        'Marketing': ['User2', 'User5'],
      },
      attributeDescriptions: { Legal: 'Legal department' },
    },
  },
};

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Attributes > Attribute panel',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [4106, 4107, 4108],
        "Open an attribute's panel, add people to it and remove them",
      ),
      async ({
        page,
        buildOrgMatrix,
        adminConsolePage,
        advancedPermissionsPage,
        attributesPage,
      }) => {
        enterpriseActivatedPageTest.slow();
        const panel = attributesPage.panel;
        const addPeople = panel.addPeople;

        const { users } = await enterpriseActivatedPageTest.step(
          "Setup: OrgA's members and attributes, with Send invitations 'Who are' 'Legal', Move teams 'Except' 'Compliance' and Create Teams 'Who are' 'Beta testers'",
          async () => {
            const matrix = await buildOrgMatrix(ATTRIBUTE_PANEL_MATRIX);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.sendInvitations.addAttribute(
              RestrictionPart.WhoAre,
              'Legal',
            );
            await advancedPermissionsPage.moveTeams.addExclusion('Compliance');
            await advancedPermissionsPage.createTeams.addAttribute(
              RestrictionPart.WhoAre,
              'Beta testers',
            );
            await adminConsolePage.openAttributesTab();
            return matrix;
          },
        );
        const holder = (name: string) => ({ name, email: users[name].email });
        const member = (name: string, selected: boolean) => ({
          ...holder(name),
          selected,
        });

        // --- PENPOT-4106 ---

        await enterpriseActivatedPageTest.step(
          "(4106) Click 'Legal' → panel with 'Legal' and 'Legal department' as plain text, 'Legal' row highlighted",
          async () => {
            await attributesPage.openAttribute('Legal');
            await panel.checkHeader('Legal', 'Legal department');
            await attributesPage.checkSelectedAttributeRow('Legal');
          },
        );

        await enterpriseActivatedPageTest.step(
          "'Used by' lists 'Send invitations' (Advanced permissions), 'People' shows 2: User3 and User6",
          async () => {
            await panel.checkUsedBy([
              { control: 'Send invitations', area: 'Advanced permissions' },
            ]);
            await panel.checkPeopleCount(2);
            await panel.checkPeople([holder('User3'), holder('User6')]);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Click 'Compliance' → used by 'Move teams across organizations', only User4, 'Compliance' row highlighted",
          async () => {
            await attributesPage.openAttribute('Compliance');
            await panel.checkHeader('Compliance');
            await panel.checkUsedBy([
              {
                control: 'Move teams across organizations',
                area: 'Advanced permissions',
              },
            ]);
            await panel.checkPeople([holder('User4')]);
            await attributesPage.checkSelectedAttributeRow('Compliance');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Click 'Beta testers' → 'Used by' lists 'Create Teams'",
          async () => {
            await attributesPage.openAttribute('Beta testers');
            await panel.checkUsedBy([
              { control: 'Create Teams', area: 'Advanced permissions' },
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Click 'Marketing' → 'No control points at this attribute yet.', User2 and User5 under 'People'",
          async () => {
            await attributesPage.openAttribute('Marketing');
            await panel.checkUsedBy([]);
            await panel.checkPeople([holder('User2'), holder('User5')]);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Close the panel → no row highlighted',
          async () => {
            await panel.close();
            await attributesPage.checkSelectedAttributeRow(null);
          },
        );

        // --- PENPOT-4107 ---

        await enterpriseActivatedPageTest.step(
          "(4107) Click 'Legal', then 'Add people' → every member, User3 and User6 selected",
          async () => {
            await attributesPage.openAttribute('Legal');
            await panel.openAddPeople();
            await addPeople.checkMembers([
              member('User1', false),
              member('User2', false),
              member('User3', true),
              member('User4', false),
              member('User5', false),
              member('User6', true),
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Search User3's email → only User3, selected",
          async () => {
            await addPeople.search(users.User3.email);
            await addPeople.checkMembers([member('User3', true)]);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Search User2's name → only User2, not selected",
          async () => {
            await addPeople.search('User2');
            await addPeople.checkMembers([member('User2', false)]);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Clear the search and select User2 and User5 → each listed straight away, 'People' shows 4",
          async () => {
            await addPeople.clearSearch();
            await addPeople.selectMember('User2');
            await panel.checkPeopleCount(3);
            await addPeople.selectMember('User5');
            await panel.checkPeopleCount(4);
            await panel.checkPeople(
              ['User2', 'User3', 'User5', 'User6'].map(holder),
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "Unselect User5 → leaves the list with 'User5 removed from Legal.', 'People' shows 3",
          async () => {
            await addPeople.selectMember('User5', false);
            await panel.checkRemovedMessageIsVisible('User5', 'Legal');
            await panel.checkPeopleCount(3);
            await panel.checkPeople(['User2', 'User3', 'User6'].map(holder));
          },
        );

        await enterpriseActivatedPageTest.step(
          "Select User5 again → listed again, 'People' shows 4",
          async () => {
            await addPeople.selectMember('User5');
            await panel.checkPeopleCount(4);
            await panel.checkPeople(
              ['User2', 'User3', 'User5', 'User6'].map(holder),
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          "Press Escape and close the panel → 'Legal' shows 4 under 'People'",
          async () => {
            await addPeople.close();
            await panel.close();
            await attributesPage.checkAttributePeopleCount('Legal', 4);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Reload and click 'Legal' → User2, User3, User5 and User6",
          async () => {
            await page.reload();
            await attributesPage.openAttribute('Legal');
            await panel.checkPeople(
              ['User2', 'User3', 'User5', 'User6'].map(holder),
            );
            await panel.close();
          },
        );

        // --- PENPOT-4108 ---

        await enterpriseActivatedPageTest.step(
          "(4108) Click 'Marketing' and hover User2 → 'Remove' appears on the row",
          async () => {
            await attributesPage.openAttribute('Marketing');
            await panel.hoverPerson('User2');
            await panel.checkRemoveButtonIsVisible('User2');
          },
        );

        await enterpriseActivatedPageTest.step(
          "Click 'Remove' → User2 leaves straight away, with no confirmation, 'User2 removed from Marketing.', 'People' shows 1",
          async () => {
            await panel.removePerson('User2');
            await panel.checkRemovedMessageIsVisible('User2', 'Marketing');
            await panel.checkPeopleCount(1);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Remove User5 → 'People' shows 0 with 'Nobody holds this attribute yet.' and 'Add people'",
          async () => {
            await panel.removePerson('User5');
            await panel.checkPeopleCount(0);
            await panel.checkPeopleEmptyStateIsVisible();
          },
        );

        await enterpriseActivatedPageTest.step(
          "Close the panel → 'Marketing' shows 0 under 'People'",
          async () => {
            await panel.close();
            await attributesPage.checkAttributePeopleCount('Marketing', 0);
          },
        );

        await enterpriseActivatedPageTest.step(
          "Open People and User2's profile → 'Legal' in Attributes, not 'Marketing'",
          async () => {
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.openMemberProfile('User2');
            await adminConsolePage.memberProfile.checkAssignedAttributes(['Legal']);
          },
        );
      },
    );
  },
);
