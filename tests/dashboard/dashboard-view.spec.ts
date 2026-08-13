import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { demoTest, mainTest, registerTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;

demoTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);

  await teamPage.createTeam(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.hideLibrariesAndTemplatesCarrousel();
});

demoTest.describe('List View', () => {
  demoTest.beforeEach(async () => {
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaProjectPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.checkNumberOfFiles('1 file');
  });

  demoTest(
    qase(
      [3463, 3466, 3468],
      'Toggle from grid view to list view on dashboard, assert last modification time is visible and options menu',
    ),
    async () => {
      await dashboardPage.switchLayoutView('List View');
      await dashboardPage.isFileVisibleByName('New File 1');
      await dashboardPage.hasFileTileListClass();
      await dashboardPage.isFileItemDateVisible();
      await dashboardPage.isFileOptionsMenuVisible();
    },
  );
});
