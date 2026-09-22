/**
 * Qase suite: Admin Console > Sidebar Menu > Teams
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterprisePageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeTest` for cases needing a real second account.
 * Per-case "Accounts:" notes cover invitees needing a real, readable
 * inbox instead (see the enterprise-demo-account-email memory).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe('Admin Console > Sidebar Menu > Teams', () => {
  enterprisePageTest(
    qase([3630], 'Display team information in the Teams list'),
    async ({ page, orgPage, adminConsolePage, stripePage, teamPage }) => {
      const dashboardPage = new DashboardPage(page);
      const mainPage = new MainPage(page);
      const orgName = createOrgName();
      const teamName = createTeamName();
      let ownerName = '';
      let orgAdminConsoleUrl = '';

      await enterprisePageTest.step(
        'Setup: subscribe to Enterprise, create an org, a team, and a file in it',
        async () => {
          await subscribeAndCreateOrg(
            orgPage,
            adminConsolePage,
            stripePage,
            orgName,
          );
          ownerName = await adminConsolePage.getUserName();
          orgAdminConsoleUrl = page.url();

          await adminConsolePage.goToFiles();
          await teamPage.createTeam(teamName);
          await dashboardPage.createFileViaPlaceholder();
          await mainPage.isMainPageLoaded();
        },
      );

      await enterprisePageTest.step(
        'Open Admin Console > Teams → team shown as a list row, with the expected columns',
        async () => {
          await page.goto(orgAdminConsoleUrl);
          await adminConsolePage.page.reload();
          await adminConsolePage.openTeamsTab();
          await adminConsolePage.hasExpectedTeamsTableColumns();
          await adminConsolePage.isTeamListedInTeamsTable(teamName);
        },
      );

      await enterprisePageTest.step(
        'Team column shows an avatar and the team name; Created column uses the standard date format',
        async () => {
          await adminConsolePage.isTeamAvatarShownInTeamsTable(teamName);
          await adminConsolePage.hasStandardCreatedDateFormat(teamName);
        },
      );

      await enterprisePageTest.step(
        'Owner column shows the owner’s avatar and full name',
        async () => {
          await adminConsolePage.hasTeamOwnerInTeamsTable(teamName, ownerName);
        },
      );

      await enterprisePageTest.step(
        'Projects/Files/Members counts are correct',
        async () => {
          await adminConsolePage.hasTeamCountsInTeamsTable(teamName, {
            projects: 0,
            files: 1,
            members: 1,
          });
        },
      );

      await enterprisePageTest.step(
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
