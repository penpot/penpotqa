/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Team Management Options > Delete Team
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeActivatedTest` for cases needing a real second account.
 * Per-case "Accounts:" notes cover invitees needing a real, readable
 * inbox instead (see the enterprise-demo-account-email memory).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Enterprise Dashboard > Teams Dropdown > Team Management Options > Delete Team',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3133],
        'Verify member counter updates in Admin Console after deleting an org team',
      ),
      async ({ page, orgPage, adminConsolePage, teamPage }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();
        let ownerName = '';
        let orgAdminConsoleUrl = '';

        await enterpriseActivatedPageTest.step(
          'Setup: create an Enterprise-activated org, and a team in it',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            ownerName = await adminConsolePage.getUserName();
            orgAdminConsoleUrl = page.url();

            await adminConsolePage.goToFiles(orgName);
            await teamPage.createTeam(teamName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Admin Console > People → owner listed with a Teams count of 1',
          async () => {
            await page.goto(orgAdminConsoleUrl);
            await adminConsolePage.page.reload();
            await adminConsolePage.isMemberListedInPeopleTable(ownerName);
            await adminConsolePage.hasMemberTeamsCountInPeopleTable(ownerName, 1);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Delete the team from the dashboard',
          async () => {
            // deleteTeam() itself opens the team switcher and selects the team
            // by name before deleting it — no need to switch to it first.
            await adminConsolePage.goToFiles();
            await teamPage.deleteTeam(teamName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Admin Console > Teams → deleted team no longer listed',
          async () => {
            await page.goto(orgAdminConsoleUrl);
            await adminConsolePage.page.reload();
            await adminConsolePage.openTeamsTab();
            await adminConsolePage.isTeamListedInTeamsTable(teamName, false);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Former team owner is still an org member, but Teams count is now 0',
          async () => {
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.isMemberListedInPeopleTable(ownerName);
            await adminConsolePage.hasMemberTeamsCountInPeopleTable(ownerName, 0);
          },
        );
      },
    );
  },
);
