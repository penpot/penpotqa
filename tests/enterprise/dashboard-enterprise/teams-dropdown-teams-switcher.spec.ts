/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Teams Switcher
 * 3825 and 3842 share one setup (org owner with a team), so they're merged.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import {
  enterpriseActivatedPageTest,
  ownerAndInviteeActivatedTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Enterprise Dashboard > Teams Dropdown > Teams Switcher',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3825, 3842],
        'Closed switcher shows team and organization, and the open switcher shows its actions',
      ),
      async ({ orgPage, adminConsolePage, teamPage }) => {
        const orgAName = createOrgName();
        const teamName = createTeamName();

        await enterpriseActivatedPageTest.step(
          'Setup: create OrgA and "Team-Apple" in it (owned by the user)',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgAName);
            await adminConsolePage.goToFiles(orgAName);
            await teamPage.createTeam(teamName);
          },
        );

        await enterpriseActivatedPageTest.step(
          '3825: on the Team-Apple dashboard, the closed switcher shows Team-Apple on line 1 and OrgA on line 2',
          async () => {
            await orgPage.hasCurrentTeamAndOrganization(teamName, orgAName);
          },
        );

        await enterpriseActivatedPageTest.step(
          '3842: open the switcher → Create new team, Create new organization and Go to Admin Console (with an outbound arrow)',
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.isCreateTeamDropdownItemVisible();
            await orgPage.isCreateOrgDropdownItemVisible();
            await orgPage.isGoToAdminConsoleDropdownItemVisible();
            await orgPage.isGoToAdminConsoleOutboundArrowVisible();
          },
        );
      },
    );

    ownerAndInviteeActivatedTest(
      qase([3839], 'Right-click on an organization shows the Leave org option'),
      async ({ invitee, orgPage, adminConsolePage }) => {
        const orgBName = createOrgName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);

        await ownerAndInviteeActivatedTest.step(
          'Setup: another user creates OrgB and the user joins it as a member (not owner)',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgBName);
            await adminConsolePage.invitePersonToOrganization(invitee.email);
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgBName);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Open the switcher → OrgB is listed at the first level',
          async () => {
            await inviteeOrgPage.openOrgSwitcher();
            await inviteeOrgPage.isOrgListedInDropdown(orgBName);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Right-click OrgB → a context menu with "Leave org" appears',
          async () => {
            await inviteeOrgPage.openOrgContextMenu(orgBName);
            await inviteeOrgPage.isLeaveOrgMenuItemVisible();
          },
        );
      },
    );
  },
);
