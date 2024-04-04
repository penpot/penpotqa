const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest('AS-110 Open panel main menu - help&info', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickMainMenuButton();
  await mainPage.clickHelpInfoMainMenuItem();
  await mainPage.clickShortcutsMainMenuSubItem();
  await mainPage.isShortcutsPanelDisplayed();
  await mainPage.clickViewportTwice();
  await expect(mainPage.shortcutsPanel).toHaveScreenshot('shortcuts-panel.png');
  await mainPage.clickMainMenuButton();
  await mainPage.clickHelpInfoMainMenuItem();
  await mainPage.clickShortcutsMainMenuSubItem();
  await mainPage.isShortcutsPanelNotDisplayed();
});

mainTest('AS-115 Show/hide panel', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.pressShortcutsPanelShortcut();
  await mainPage.isShortcutsPanelDisplayed();
  await mainPage.clickViewportTwice();
  await expect(mainPage.shortcutsPanel).toHaveScreenshot('shortcuts-panel.png');
  await mainPage.closeShortcutsPanel();
  await mainPage.isShortcutsPanelNotDisplayed();
});
