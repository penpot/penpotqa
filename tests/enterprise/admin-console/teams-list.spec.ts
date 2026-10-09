/**
 * Qase suite: Admin Console > Sidebar Menu > Teams
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
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe('Admin Console > Sidebar Menu > Teams', () => {
  enterpriseActivatedPageTest(
    qase([3630], 'Display team information in the Teams list'),
    async ({ page, orgPage, adminConsolePage, teamPage }) => {
      const dashboardPage = new DashboardPage(page);
      const mainPage = new MainPage(page);
      const orgName = createOrgName();
      const teamName = createTeamName();
      let ownerName = '';
      let orgAdminConsoleUrl = '';

      await enterpriseActivatedPageTest.step(
        'Setup: create an Enterprise-activated org, a team, and a file in it',
        async () => {
          await createOrgForLicensedAccount(orgPage, orgName);
          ownerName = await adminConsolePage.getUserName();
          orgAdminConsoleUrl = page.url();

          await adminConsolePage.goToFiles(orgName);
          await teamPage.createTeam(teamName);
          await dashboardPage.createFileViaPlaceholder();
          await mainPage.isMainPageLoaded();
        },
      );

      await enterpriseActivatedPageTest.step(
        'Open Admin Console > Teams → team shown as a list row, with the expected columns',
        async () => {
          await page.goto(orgAdminConsoleUrl);
          await adminConsolePage.page.reload();
          await adminConsolePage.openTeamsTab();
          await adminConsolePage.hasExpectedTeamsTableColumns();
          await adminConsolePage.isTeamListedInTeamsTable(teamName);
        },
      );

      await enterpriseActivatedPageTest.step(
        'Team column shows an avatar and the team name; Created column uses the standard date format',
        async () => {
          await adminConsolePage.isTeamAvatarShownInTeamsTable(teamName);
          await adminConsolePage.hasStandardCreatedDateFormat(teamName);
        },
      );

      await enterpriseActivatedPageTest.step(
        'Owner column shows the owner’s avatar and full name',
        async () => {
          await adminConsolePage.hasTeamOwnerInTeamsTable(teamName, ownerName);
        },
      );

      await enterpriseActivatedPageTest.step(
        'Projects/Files/Members counts are correct',
        async () => {
          await adminConsolePage.hasTeamCountsInTeamsTable(teamName, {
            projects: 0,
            files: 1,
            members: 1,
          });
        },
      );

      await enterpriseActivatedPageTest.step(
        'A pending invitation does NOT count towards Members',
        async () => {
          await adminConsolePage.invitePersonToOrganization(
            'pending-invitee-3630@demo.example.com',
          );
          await adminConsolePage.openTeamsTab();
          await adminConsolePage.hasTeamCountsInTeamsTable(teamName, {
            projects: 0,
            files: 1,
            members: 1,
          });
        },
      );
    },
  );
});
