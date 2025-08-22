const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let teamPage, dashboardPage, mainPage, layersPanelPage;

test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest(qase(483, 'CO-268 Create curve line from toolbar'), async () => {
    await mainPage.clickCreateCurveButton();
    await mainPage.drawCurve(900, 300, 600, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('curve.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(
    qase(485, 'CO-270 Rename path, that was created with curve with valid name'),
    async () => {
      await mainPage.clickCreateCurveButton();
      await mainPage.drawCurve(900, 300, 600, 200);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.doubleClickLayerOnLayersTab('Path');
      await layersPanelPage.typeNameCreatedLayerAndEnter('renamed curve');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerNameDisplayed('renamed curve');
    },
  );
});
