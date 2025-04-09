const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { TokensPanelPage } = require('../../pages/workspace/tokens-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');

let mainPage, teamPage, dashboardPage, tokensPage, designPanelPage;

const teamName = random().concat('autotest');

test.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest(qase(2102, 'Create a set via "create one" link'), async () => {
  const name = 'Mobile';
  await tokensPage.clickTokensTab();
  await tokensPage.createSetViaLinc(name);
  await tokensPage.checkFirstSetName(name);
});

mainTest(qase(2139, 'Enable and Disable sets'), async () => {
  await tokensPage.createDefaultRectangleByCoordinates(100, 200);

  await tokensPage.clickTokensTab();
  await tokensPage.createSetViaButton('Mode/Dark');
  await tokensPage.isSetNameVisible('Dark');
  await tokensPage.isGroupSetNameVisible('Mode');
  await tokensPage.clickOnSetCheckboxByName('Dark');
  await tokensPage.isSetCheckedByName('Dark');
  await tokensPage.createColorToken('red', '#ef0c0c');
  await tokensPage.clickOnTokenWithName('red');
  await tokensPage.waitForChangeIsSaved();
  await designPanelPage.isFillHexCodeSetComponent('ef0c0c');

  await tokensPage.createSetViaButton('Mode/Light');
  await tokensPage.isSetNameVisible('Light');
  await tokensPage.clickOnSetCheckboxByName('Light');
  await tokensPage.isSetCheckedByName('Light');
  await tokensPage.createColorToken('red', '#ec9090');
  await tokensPage.waitForChangeIsSaved();
  await designPanelPage.isFillHexCodeSetComponent('ec9090');

  await tokensPage.createSetViaButton('Device/Desktop');
  await tokensPage.isSetNameVisible('Desktop');
  await tokensPage.isGroupSetNameVisible('Device');
  await tokensPage.clickOnSetCheckboxByName('Desktop');
  await tokensPage.isSetCheckedByName('Desktop');
  await tokensPage.createRadiusToken('border-radius', '50');
  await tokensPage.clickOnTokenWithName('border-radius');
  await tokensPage.waitForChangeIsSaved();
  await designPanelPage.checkGeneralCornerRadius('50');

  await tokensPage.createSetViaButton('Device/Mobile');
  await tokensPage.isSetNameVisible('Mobile');
  await tokensPage.clickOnSetCheckboxByName('Mobile');
  await tokensPage.isSetCheckedByName('Mobile');
  await tokensPage.createRadiusToken('border-radius', '30');
  await tokensPage.waitForChangeIsSaved();
  await designPanelPage.checkGeneralCornerRadius('30');

  await expect(tokensPage.setsList).toHaveScreenshot('sets-sidebar.png');

  await tokensPage.clickOnSetCheckboxByName('Light');
  await designPanelPage.isFillHexCodeSetComponent('ef0c0c');
  await tokensPage.clickOnSetCheckboxByName('Mobile');
  await designPanelPage.checkGeneralCornerRadius('50');
  await tokensPage.clickOnSetCheckboxByName('Light');
  await designPanelPage.isFillHexCodeSetComponent('ec9090');
  await tokensPage.clickOnSetCheckboxByName('Mobile');
  await designPanelPage.checkGeneralCornerRadius('30');
});
