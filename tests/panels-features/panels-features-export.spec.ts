import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { random } from 'helpers/string-generator';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName: string = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let mainPage: MainPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase(897, 'Add export setting via design panel'), async () => {
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickAddExportButton();
  await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
});

mainTest(qase(899, 'Remove export setting via design panel'), async () => {
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickAddExportButton();
  await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
  await designPanelPage.clickRemoveExportButton();
  await designPanelPage.isExportElementButtonNotDisplayed();
});

mainTest(qase(905, 'Export boards to PDF (via main menu)'), async () => {
  const numBoards: number = 2;

  await mainTest.step('Create two boards', async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportByCoordinates(100, 150);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportByCoordinates(250, 300);
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Select created boards', async () => {
    await mainPage.clickMainMenuButton();
    await mainPage.clickEditMainMenuItem();
    await mainPage.clickSelectAllMainMenuSubItem();
  });

  await mainTest.step('Export boards as PDF', async () => {
    await mainPage.clickMainMenuButton();
    await mainPage.clickFileMainMenuItem();
    await mainPage.exportBoardsAsPDFViaMenu(numBoards);
  });
});
