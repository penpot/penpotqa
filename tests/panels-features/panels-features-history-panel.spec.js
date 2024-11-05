const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { test } = require('@playwright/test');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
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
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest(
  qase(874, 'PF-156 Perform a change and check the status'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.isUnSavedChangesDisplayed();
    await mainPage.waitForChangeIsSaved();
  },
);

mainTest(
  qase(890, 'PF-172 Open history panel with recent changes'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickHistoryPanelButton();
    await mainPage.isActionDisplayedOnHistoryPanel('New board');
  },
);
