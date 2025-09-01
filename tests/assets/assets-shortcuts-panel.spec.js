const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let teamPage, dashboardPage, mainPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([1020], 'Open panel main menu - help&info'), async () => {
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

mainTest(qase([1025], 'Show/hide panel'), async () => {
  const mainPage = new MainPage(page);
  await mainPage.pressShortcutsPanelShortcut();
  await mainPage.isShortcutsPanelDisplayed();
  await mainPage.clickViewportTwice();
  await mainPage.closeShortcutsPanel();
  await mainPage.isShortcutsPanelNotDisplayed();
});
