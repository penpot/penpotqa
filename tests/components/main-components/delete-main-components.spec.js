const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { random } = require('../../../helpers/string-generator');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let dashboardPage, mainPage, teamPage, assetsPanelPage, layersPanelPage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([1295], 'Undo deleted component'), async ({ browserName }) => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteLayerViaRightClick();
  await mainPage.isCreatedLayerVisible(false);
  await mainPage.clickShortcutCtrlZ(browserName);
  await mainPage.isCreatedLayerVisible(true);
});

mainTest(qase([1456], 'Delete component Assets tab'), async () => {
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
    {
      mask: await mainPage.maskViewport(),
    },
  );
});

mainTest(qase([1345], 'Restore main component from context menu'), async () => {
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
});
