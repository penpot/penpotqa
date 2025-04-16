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

mainTest(qase(2167, 'Create theme via "create one" link'), async () => {
  await tokensPage.clickTokensTab();
  await tokensPage.createThemeViaLink('Desktop');
  await tokensPage.checkSelectedTheme('No theme active');
});

mainTest(qase(2206, 'Enable themes in different groups'), async () => {
  await tokensPage.createDefaultRectangleByCoordinates(200, 200);

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

  await tokensPage.createThemeViaLinkWithGroup('App', 'Web');
  await tokensPage.addNewThemeWithGroup('App', 'Mobile');

  await tokensPage.openEditThemeModalByThemeName('Web');
  await tokensPage.activateSetInTheme('Dark');
  await tokensPage.activateSetInTheme('Light');
  await tokensPage.activateSetInTheme('Desktop');
  await tokensPage.saveTheme();
  await tokensPage.checkActiveSetsCountByThemeName('Web', '3');

  await tokensPage.openEditThemeModalByThemeName('Mobile');
  await tokensPage.activateSetInTheme('Light');
  await tokensPage.activateSetInTheme('Mobile');
  await tokensPage.saveTheme();
  await tokensPage.checkActiveSetsCountByThemeName('Mobile', '2');

  await tokensPage.addNewTheme('Brand X');
  await tokensPage.openEditThemeModalByThemeName('Brand X');
  await tokensPage.activateSetInTheme('Light');
  await tokensPage.activateSetInTheme('Dark');
  await tokensPage.activateSetInTheme('Desktop');
  await tokensPage.activateSetInTheme('Mobile');
  await tokensPage.saveTheme();
  await tokensPage.checkActiveSetsCountByThemeName('Brand X', '4');
  await tokensPage.closeModalWindow();
  await tokensPage.checkSelectedTheme('No theme active');

  await tokensPage.selectTheme('Web');
  await tokensPage.checkSelectedTheme('App / Web');
  await tokensPage.isSetCheckedByName('Dark');
  await tokensPage.isSetCheckedByName('Light');
  await tokensPage.isSetCheckedByName('Desktop');

  await tokensPage.selectTheme('Mobile');
  await tokensPage.checkSelectedTheme('App / Mobile');
  await tokensPage.isSetCheckedByName('Light');
  await tokensPage.isSetCheckedByName('Mobile');

  await tokensPage.selectTheme('Brand X');
  await tokensPage.checkSelectedTheme('2 active themes');
  await tokensPage.isSetCheckedByName('Dark');
  await tokensPage.isSetCheckedByName('Light');
  await tokensPage.isSetCheckedByName('Mobile');
  await tokensPage.isSetCheckedByName('Desktop');
});
