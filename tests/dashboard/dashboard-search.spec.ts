import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { random } from 'helpers/string-generator';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.hideLibrariesAndTemplatesCarrousel();
});

mainTest.afterEach(async () => {
  await teamPage.deleteTeam(teamName);
});

mainTest(qase(1148, 'Search file from Drafts'), async () => {
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFile('qwe');
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.search('qwe');
  await dashboardPage.isHeaderDisplayed('Search results');
  await dashboardPage.isFilePresent('qwe');
});
