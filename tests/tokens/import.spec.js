const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
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
});

mainTest.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest(qase(2213, 'Import tokens'), async () => {
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.clickOnTokenToolsButton();
  await tokensPage.importTokens('documents/tokens-example.json');
  await tokensPage.checkSelectedTheme('2 active themes');
  await tokensPage.isSetNameVisible('client_theme_template');
});

mainTest(qase(2221, 'Import .penpot file with tokens'), async () => {
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.importFileFromProjectPage(
    'documents/penpot-file-with-tokens.penpot',
  );
  await dashboardPage.isFilePresent('⚙️ Design Tokens Starter Set | Edited');
  await dashboardPage.openFileWithName('⚙️ Design Tokens Starter Set | Edited');
  await tokensPage.clickTokensTab();
  await tokensPage.checkSelectedTheme('2 active themes');
  await tokensPage.isSetNameVisible('client_theme_template');
});

mainTest(qase(2240, 'Error while importing a tokens file'), async () => {
  const errorCount = 1;
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.clickOnTokenToolsButton();
  await tokensPage.importTokens('documents/import-tokens-error-format.json');
  await tokensPage.checkImportErrorMessage(`Import Error: Could not parse JSON.`);
  await tokensPage.closeModalWindow();
  await tokensPage.closeModalWindow();
  await tokensPage.isImportErrorMessageVisible(false);

  await tokensPage.clickOnTokenToolsButton();
  await tokensPage.importTokens('documents/import-tokens-error-naming.json');
  await tokensPage.checkImportErrorMessage(
    `Import Error: Invalid token name in JSON.`,
  );
  await tokensPage.expandDetailMessage();
  await tokensPage.checkImportTokenDetailErrorCount(errorCount);
  await tokensPage.closeModalWindow();
  await tokensPage.isImportErrorMessageVisible(false);
});

mainTest(
  qase(2293, 'Successful import of tokens file with validation errors'),
  async () => {
    const firstBadTokenName = 'dark.theme.accent.default';
    const errorCount = 18;
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.clickOnTokenToolsButton();
    await tokensPage.importTokens('documents/stitches-tokens.json');
    await tokensPage.expandSectionByName('Color');
    await tokensPage.isTokenVisibleWithName(firstBadTokenName);
    await tokensPage.checkInvalidTokenCount(errorCount);
  },
);

mainTest(qase(2252, 'Import tokens multifile folder'), async () => {
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.clickOnTokenToolsButton();
  await tokensPage.importTokensFolder('documents/tokens-folder-example');
  await tokensPage.checkSelectedTheme('Mode / Light');
  await tokensPage.isSetNameVisible('light');
  await tokensPage.isSetNameVisible('dark');
});
