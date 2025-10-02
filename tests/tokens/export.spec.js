const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { TokensPanelPage } = require('../../pages/workspace/tokens-panel-page');

let mainPage, teamPage, dashboardPage, tokensPage;

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.clickOnTokenToolsButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(2266, 'Export tokens multifile folder (no token, set or theme)'),
  async () => {
    await tokensPage.clickOnExportButton();
    await tokensPage.clickOnMultipleFilesButton();
    await tokensPage.checkEmptyExportTabMessage();
    await tokensPage.closeModalWindow();
    await tokensPage.isExportWindowClosed();
  },
);

mainTest(qase(2265, 'Export tokens multifile folder'), async () => {
  await tokensPage.importTokensFolder('documents/tokens-folder-example');
  await tokensPage.checkSelectedTheme('Mode / Light');
  await tokensPage.clickOnTokenToolsButton();
  await tokensPage.clickOnExportButton();
  await tokensPage.clickOnMultipleFilesButton();
  await tokensPage.checkExportFileItemCount(4);
  await tokensPage.ifExportFileExists('mode/light.json');
  await tokensPage.ifExportFileExists('mode/dark.json');
  await tokensPage.exportToken();
  await tokensPage.isExportWindowClosed(false);
  await tokensPage.clickOnCancelButton();
  await tokensPage.isExportWindowClosed(true);
});
