const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
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

mainTest.describe(() => {
  // All tests in this describe group will get 2 retry attempts.
  mainTest.describe.configure({ retries: 2 });

  mainTest(qase(483,'CO-268 Create curve line from toolbar'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateCurveButton();
    await mainPage.drawCurve(900, 300, 600, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('curve.png');
  });

  mainTest(
    qase(485,'CO-270 Rename path, that was created with curve with valid name'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      await mainPage.clickCreateCurveButton();
      await mainPage.drawCurve(900, 300, 600, 200);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.doubleClickLayerOnLayersTab('Path');
      await layersPanelPage.renameCreatedLayer('renamed curve');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerNameDisplayed('renamed curve');
    },
  );
});
