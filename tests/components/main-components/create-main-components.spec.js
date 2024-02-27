const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');

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

mainTest('Create component shape', async ({ page }) => {
  const mainPage = new MainPage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isComponentAddedToFileLibraryComponents();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'rectangle-component-asset.png',
    {
      mask: [mainPage.guides],
    },
  );
});

mainTest(
  'Drag a component from assets tab and drop into workspace',
  async ({ page, browserName }) => {
    if (browserName !== 'webkit') {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const assetsPanelPage = new AssetsPanelPage(page);
      await mainPage.createDefaultEllipseByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.dragComponentOnCanvas(50, 100);
      await layersPanelPage.openLayersTab();
      await expect(mainPage.viewport).toHaveScreenshot(
        'copy-main-components-on-canvas.png',
      );
      await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
        'copy-main-components-layers.png',
      );
    }
  },
);

mainTest(
  'Create component from rectangle by clicking CTRL K',
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'rectangle-main-component-canvas.png',
    );
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'rectangle-main-component-layer.png',
    );
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'rectangle-component-asset.png',
    );
  },
);

mainTest(
  'Create component from ellipse by clicking CTRL K',
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'ellipse-main-component-canvas.png',
    );
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'ellipse-main-component-layer.png',
    );
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'ellipse-component-asset.png',
    );
  },
);

mainTest(
  'Create component from board by clicking CTRL K',
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-main-component-canvas.png',
    );
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'board-main-component-layer.png',
    );
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'board-component-asset.png',
    );
  },
);

mainTest(
  'Create component from text by right-click',
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.createDefaultTextLayer(browserName);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'text-main-component-canvas.png',
    );
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'text-main-component-layer.png',
    );
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'text-component-asset.png',
    );
  },
);

mainTest('Create component from image by right-click', async ({ page }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.uploadImage('images/sample.jpeg');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    'image-main-component-canvas.png',
  );
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    'image-main-component-layer.png',
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isComponentAddedToFileLibraryComponents();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'image-component-asset.png',
  );
});

mainTest('Create component from path by right-click BUG', async ({ page }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.createDefaultClosedPath();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('path-main-component-canvas.png');
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    'path-main-component-layer.png',
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isComponentAddedToFileLibraryComponents();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'path-component-asset.png',
  );
});

mainTest('Create component from curve by right-click', async ({ page }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.createDefaultCurveLayer();
  await layersPanelPage.createComponentViaRightClickLayers();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    'curve-main-component-canvas.png',
  );
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    'curve-main-component-layer.png',
  );
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isComponentAddedToFileLibraryComponents();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'curve-component-asset.png',
  );
});

mainTest('Undo component', async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickOnLayerOnCanvas();
  await designPanelPage.changeRotationForLayer('200');
  await expect(mainPage.viewport).toHaveScreenshot('component-change_rotation.png');
  await mainPage.clickShortcutCtrlZ(browserName);
  await expect(mainPage.viewport).toHaveScreenshot(
    'component-change_rotation_undo.png',
  );
});

mainTest(
  'Create multiple components from rectangle and ellipse',
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createDefaultEllipseByCoordinates(400, 600, true);
    await mainPage.clickMainMenuButton();
    await mainPage.clickEditMainMenuItem();
    await mainPage.clickSelectAllMainMenuSubItem();
    await mainPage.createComponentsMultipleShapesRightClick(false);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'multiple-components-canvas.png',
    );
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'multiple-components-layer.png',
    );
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'multiple-components-asset.png',
    );
  },
);

mainTest(
  'Create multiple components from text, board and image',
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.createDefaultTextLayer(browserName);
    await mainPage.createDefaultBoardByCoordinates(200, 400);
    await mainPage.uploadImage('images/sample.jpeg');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickMainMenuButton();
    await mainPage.clickEditMainMenuItem();
    await mainPage.clickSelectAllMainMenuSubItem();
    await mainPage.createComponentsMultipleShapesRightClick(false);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'multiple-components-canvas-3-layers.png',
    );
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'multiple-components-layer-3-layers.png',
    );
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'multiple-components-asset-3-layers.png',
    );
  },
);
