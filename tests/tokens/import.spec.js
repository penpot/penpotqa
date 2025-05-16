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

test.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
});

test.afterEach(async ({ page }, testInfo) => {
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
  const errorCount = 18;
  const formatRegex = /^\{.+\} tries to reference \{.+\}, which is not defined\.$/;
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.clickOnTokenToolsButton();
  await tokensPage.importTokens('documents/stitches-tokens.json');
  await tokensPage.checkImportErrorMessage(
    `Import Error: Some token references (${errorCount}) could not be found.`,
  );
  await tokensPage.expandDetailMessage();
  await tokensPage.checkImportTokenDetailErrorCount(errorCount);
  await tokensPage.checkImportTokenDetailErrorFormat(formatRegex);
  await tokensPage.closeModalWindow();
  await tokensPage.isImportErrorMessageVisible(false);
});
