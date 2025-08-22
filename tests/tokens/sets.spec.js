const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { TokensPanelPage } = require('../../pages/workspace/tokens-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');

let mainPage, teamPage, dashboardPage, tokensPage, designPanelPage;

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
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
  await tokensPage.createSetViaLink(name);
  await tokensPage.checkFirstSetName(name);
});

mainTest(qase(2127, 'Rename a set'), async () => {
  const name = 'Mobile';
  const newName1 = 'Mobile-Updated-Double-Click';
  const newName2 = 'Mobile-Updated-Context-Menu';

  await mainTest.step('Create a set', async () => {
    await tokensPage.clickTokensTab();
    await tokensPage.createSetViaButton(name);
    await tokensPage.checkFirstSetName(name);
  });

  await mainTest.step('Create a color token', async () => {
    await tokensPage.createColorToken('red', '#ef0c0c');
  });

  await mainTest.step('Rename set double click and assert name', async () => {
    await tokensPage.renameSetByDoubleClick(newName1);
    await tokensPage.checkFirstSetName(newName1);
  });

  await mainTest.step('Rename set via context menu and assert name', async () => {
    await tokensPage.renameSetViaContextMenu(newName1, newName2);
    await tokensPage.checkFirstSetName(newName2);
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
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
  });

  mainTest(qase(2139, 'Enable and Disable sets'), async () => {
    await tokensPage.clickOnSetCheckboxByName('Light');
    await designPanelPage.isFillHexCodeSetComponent('ef0c0c');
    await tokensPage.clickOnSetCheckboxByName('Mobile');
    await designPanelPage.checkGeneralCornerRadius('50');
    await tokensPage.clickOnSetCheckboxByName('Light');
    await designPanelPage.isFillHexCodeSetComponent('ec9090');
    await tokensPage.clickOnSetCheckboxByName('Mobile');
    await designPanelPage.checkGeneralCornerRadius('30');
  });

  mainTest(qase(2141, 'Add set to this group'), async () => {
    await tokensPage.addSetToGroupByName('Device', 'Tablet');
    await tokensPage.isSetNameVisible('Tablet', true);
  });

  mainTest(qase(2146, 'Delete a set group'), async () => {
    await tokensPage.deleteSetsGroupByName('Device');
    await tokensPage.isGroupSetNameVisible('Device', false);
    await tokensPage.isSetNameVisible('Desktop', false);
    await tokensPage.isSetNameVisible('Mobile', false);
  });
});

mainTest(qase(2231, 'Duplicate set'), async () => {
  const name = 'Mobile';
  await tokensPage.clickTokensTab();
  await tokensPage.createSetViaButton(name);
  await tokensPage.checkFirstSetName(name);
  await tokensPage.duplicateSetByName(name);
  const firstSetName = name + '-copy';
  await tokensPage.isSetNameVisible(firstSetName);
  await tokensPage.duplicateSetByName(firstSetName);
  const secondSetName = firstSetName + '-copy';
  await tokensPage.isSetNameVisible(secondSetName);
  await tokensPage.duplicateSetByName(secondSetName);
  const thirdSetName = secondSetName + '-copy';
  await tokensPage.isSetNameVisible(thirdSetName);
  await tokensPage.duplicateSetByName(thirdSetName);
});
