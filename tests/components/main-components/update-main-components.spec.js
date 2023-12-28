const { mainTest } = require('../../../fixtures');
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { MainPage } = require('../../../pages/workspace/main-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');

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

mainTest('Update main component', async ({ page }) => {
  test.setTimeout(60000);
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  const designPanelPage = new DesignPanelPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '500');
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickComponentFillColorIcon();
  await colorPalettePage.setHex('#304d6a');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.updateMainComponentViaRightClick();
  await expect(mainPage.viewport).toHaveScreenshot('component-update-canvas.png');
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'component-update-asset.png',
  );
});

mainTest('Check copy and main component icons', async ({ page }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    'copy-main-components-layers.png',
  );
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 15000);
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('400', '500');
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('50', '400');
  });

  mainTest(
    'Create a component and 2 copies of it, change rotation of main',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeRotationForLayer('20');
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-rotation.png',
      );
    },
  );

  mainTest(
    'Create a component and 2 copies of it, change all corners of main',
    async ({ page }) => {
      const cornerValue = '45';
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickIndividualCornersRadiusButton();
      await designPanelPage.changeTopLeftCornerRadiusForLayer(cornerValue);
      await designPanelPage.changeTopRightCornerRadiusForLayer(cornerValue);
      await designPanelPage.changeBottomLeftCornerRadiusForLayer(cornerValue);
      await designPanelPage.changeBottomRightCornerRadiusForLayer(cornerValue);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-add-corners.png',
      );
    },
  );

  mainTest(
    "Create a component and 2 copies of it, change corners of main separate by using 'All corners'",
    async ({ page }) => {
      const cornerValue = '45';
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.changeGeneralCornerRadiusForLayer(cornerValue);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-add-corners.png',
      );
    },
  );

  mainTest(
    'Create a component and 2 copies of it, change stroke color of main',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddStrokeButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setStrokeColor('#d80909');
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportByCoordinates(400, 400);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-add-stroke.png',
      );
    },
  );
});
