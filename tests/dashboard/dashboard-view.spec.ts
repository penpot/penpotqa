import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { demoAccountFixture } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let dashboardPage: DashboardPage;
let mainPage: MainPage;

demoAccountFixture.describe('List View', () => {
  demoAccountFixture.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);

    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaProjectPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.checkNumberOfFiles('1 file');
  });

  demoAccountFixture(
    qase(
      [3463, 3466, 3468],
      'Toggle from grid view to list view on dashboard, assert last modification time is visible and options menu',
    ),
    async () => {
      await dashboardPage.switchLayoutView('List View');
      await dashboardPage.isFileVisibleByName('New File 1');
      await dashboardPage.hasFileTileListClass();
      await dashboardPage.isFileItemDateVisible();
      await dashboardPage.isFileOptionsMenuButtonVisible();
      await dashboardPage.clickOnFileOptions();
      await dashboardPage.isFileOptionsMenuVisible();
    },
  );
});
