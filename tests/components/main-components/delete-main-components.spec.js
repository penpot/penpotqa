const { mainTest } = require("../../../fixtures");
const { MainPage } = require("../../../pages/workspace/main-page");
const { expect, test } = require("@playwright/test");
const { random } = require("../../../helpers/string-generator");
const { DashboardPage } = require("../../../pages/dashboard/dashboard-page");
const { TeamPage } = require("../../../pages/dashboard/team-page");
const { LayersPanelPage } = require("../../../pages/workspace/layers-panel-page");
const { AssetsPanelPage } = require("../../../pages/workspace/assets-panel-page");

const teamName = random().concat("autotest");

test.beforeEach(async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest("Undo deleted component", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteLayerViaRightClick();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-component-delete.png",
  );
  await mainPage.clickShortcutCtrlZ(browserName);
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-component-delete-undo.png",
  );
});

mainTest("Delete component Assets tab", async ({ page }) => {
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
  await assetsPanelPage.selectTypeFromAllAssetsDropdown("Components");
  await expect(assetsPanelPage.assetsTitleText).toHaveScreenshot(
    "assets-component-delete.png",
  );
});

mainTest("Restore main component from context menu", async ({ page }) => {
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
  await mainPage.restoreMainComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "rectangle-component-asset.png",
  );
});
