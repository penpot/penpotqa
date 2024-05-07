const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { test } = require('@playwright/test');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

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

mainTest(qase(897,'PF-179 Add export setting via design panel'), async ({ page }) => {
  const mainPage = new MainPage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickAddExportButton();
  await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
});

mainTest(qase(899,'PF-181 Remove export setting via design panel'), async ({ page }) => {
  const mainPage = new MainPage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickAddExportButton();
  await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
  await designPanelPage.clickRemoveExportButton();
  await designPanelPage.isExportElementButtonNotDisplayed();
});
