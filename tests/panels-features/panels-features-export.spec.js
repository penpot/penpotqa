const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let mainPage, teamPage, dashboardPage, designPanelPage;

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

mainTest(qase(897, 'PF-179 Add export setting via design panel'), async () => {
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickAddExportButton();
  await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
});

mainTest(qase(899, 'PF-181 Remove export setting via design panel'), async () => {
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickAddExportButton();
  await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
  await designPanelPage.clickRemoveExportButton();
  await designPanelPage.isExportElementButtonNotDisplayed();
});
