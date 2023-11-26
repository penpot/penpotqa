const { mainTest } = require("../../../fixtures");
const { MainPage } = require("../../../pages/workspace/main-page");
const { expect, test } = require("@playwright/test");
const { DashboardPage } = require("../../../pages/dashboard/dashboard-page");
const { TeamPage } = require("../../../pages/dashboard/team-page");
const { random } = require("../../../helpers/string-generator");
const { LayersPanelPage } = require("../../../pages/workspace/layers-panel-page");

const teamName = random().concat('autotest');

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

mainTest("Create component shape", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.expandComponentsBlockOnAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot("rectangle-component-asset.png");
});

mainTest("Drag a component from assets tab and drop into workspace", async ({ page }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultEllipseByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.expandComponentsBlockOnAssetsTab();
  await mainPage.dragComponentOnCanvas(50, 100);
  await layersPanelPage.openLayersTab();
  await expect(mainPage.viewport).toHaveScreenshot("copy-main-components-on-canvas.png");
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot("copy-main-components-layers.png");
});

mainTest("Create component from rectangle by clicking CTRL K", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaShortcut(browserName);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('rectangle-main-component-canvas.png');
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot('rectangle-main-component-layer.png');
  await mainPage.clickAssetsTab();
  await mainPage.expandComponentsBlockOnAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot("rectangle-component-asset.png");
});

mainTest("Create component from ellipse by clicking CTRL K", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultEllipseByCoordinates(200, 300);
  await mainPage.createComponentViaShortcut(browserName);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('ellipse-main-component-canvas.png');
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot('ellipse-main-component-layer.png');
  await mainPage.clickAssetsTab();
  await mainPage.expandComponentsBlockOnAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot("ellipse-component-asset.png");
});

mainTest("Create component from board by clicking CTRL K", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultBoardByCoordinates(200, 300);
  await mainPage.createComponentViaShortcut(browserName);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('board-main-component-canvas.png');
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot('board-main-component-layer.png');
  await mainPage.clickAssetsTab();
  await mainPage.expandComponentsBlockOnAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot("board-component-asset.png");
});

mainTest("Create component from text by right-click", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultTextLayer(browserName);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('text-main-component-canvas.png');
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot('text-main-component-layer.png');
  await mainPage.clickAssetsTab();
  await mainPage.expandComponentsBlockOnAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot("text-component-asset.png");
});
