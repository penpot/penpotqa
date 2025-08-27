const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../../helpers/string-generator');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { updateTestResults } = require('./../../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
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

mainTest(qase([1295], 'Undo deleted component'), async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteLayerViaRightClick();
  await mainPage.isCreatedLayerVisible(false);
  await mainPage.clickShortcutCtrlZ(browserName);
  await mainPage.isCreatedLayerVisible(true);
});

mainTest(qase([1456], 'Delete component Assets tab'), async ({ page }) => {
  const mainPage = new MainPage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.deleteFileLibraryComponents();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.isComponentNotAddedToFileLibraryComponents();
  await assetsPanelPage.selectTypeFromAllAssetsDropdown('Components');
  await expect(assetsPanelPage.assetsTitleText).toHaveScreenshot(
    'assets-component-delete.png',
  );
});

mainTest(
  qase([1345], 'Restore main component from context menu'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.deleteFileLibraryComponents();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.openLayersTab();
    await layersPanelPage.restoreMainComponentViaRightClick();
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentWithNameAddedToFileLibrary('Rectangle');
  },
);
