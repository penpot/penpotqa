const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let mainPage,
  dashboardPage,
  teamPage,
  layersPanelPage,
  assetsPanelPage,
  designPanelPage,
  colorPalettePage;

mainTest.beforeEach(async ({ page, browserName }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([1273], 'Create component shape'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isComponentAddedToFileLibraryComponents();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'rectangle-component-asset.png',
    {
      mask: [assetsPanelPage.librariesOpenModalButton],
    },
  );
});

mainTest(
  qase([1312], 'Drag a component from assets tab and drop into workspace'),
  async ({ browserName }) => {
    if (browserName !== 'webkit') {
      await mainPage.createDefaultEllipseByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.dragComponentOnCanvas(50, 100);
      await layersPanelPage.openLayersTab();
      await expect(mainPage.viewport).toHaveScreenshot(
        'copy-main-components-on-canvas.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Ellipse');
      await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Ellipse');
    }
  },
);

mainTest(
  qase([1431], 'Create component from rectangle by clicking CTRL K'),
  async ({ browserName }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'rectangle-main-component-canvas.png',
    );
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
  },
);

mainTest(
  qase([1432], 'Create component from ellipse by clicking CTRL K'),
  async ({ browserName }) => {
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'ellipse-main-component-canvas.png',
    );
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Ellipse');
  },
);

mainTest(
  qase([1433], 'Create component from board by clicking CTRL K'),
  async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'board-main-component-canvas.png',
    );
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Board');
  },
);

mainTest(
  qase([1434], 'Create component from text by right-click'),
  async ({ browserName }) => {
    await mainPage.createDefaultTextLayer(browserName);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'text-main-component-canvas.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Hello World!');
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'text-component-asset.png',
      {
        mask: [assetsPanelPage.librariesOpenModalButton],
        maxDiffPixelRatio: 0.002,
      },
    );
  },
);

mainTest(qase([1435], 'Create component from image by right-click'), async () => {
  await mainPage.uploadImage('images/sample.jpeg');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    'image-main-component-canvas.png',
  );
  await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('sample');
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isComponentAddedToFileLibraryComponents();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'image-component-asset.png',
    {
      mask: [assetsPanelPage.librariesOpenModalButton],
      maxDiffPixelRatio: 0.002,
    },
  );
});

mainTest(qase([1436], 'Create component from path by right-click'), async () => {
  await mainPage.createDefaultClosedPath();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    'path-main-component-canvas.png',
  );
  await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Path');
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isComponentAddedToFileLibraryComponents();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'path-component-asset.png',
    {
      mask: [assetsPanelPage.librariesOpenModalButton],
    },
  );
});

mainTest(
  qase([1437], 'Create component from curve by right-click'),
  async ({ browserName }) => {
    await mainPage.createDefaultCurveLayer();
    await layersPanelPage.createComponentViaRightClickLayers(browserName);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'curve-main-component-canvas.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Path');
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'curve-component-asset.png',
      {
        mask: [assetsPanelPage.librariesOpenModalButton],
      },
    );
  },
);

mainTest(qase([1291], 'Undo component'), async ({ browserName }) => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickOnLayerOnCanvas();
  await designPanelPage.changeRotationForLayer('200');
  await expect(mainPage.createdLayer).toHaveScreenshot(
    'component-change_rotation.png',
  );
  await mainPage.clickShortcutCtrlZ(browserName);
  await expect(mainPage.createdLayer).toHaveScreenshot(
    'component-change_rotation_undo.png',
  );
});

mainTest(
  qase([1530], 'Create multiple components from rectangle and ellipse'),
  async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createDefaultEllipseByCoordinates(400, 600, true);
    await mainPage.clickMainMenuButton();
    await mainPage.clickEditMainMenuItem();
    await mainPage.clickSelectAllMainMenuSubItem();
    await mainPage.createComponentsMultipleShapesRightClick(false);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'multiple-components-canvas.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Ellipse');
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentWithNameAddedToFileLibrary('Ellipse');
    await assetsPanelPage.isSecondComponentWithNameAddedToFileLibrary('Rectangle');
  },
);

mainTest(
  qase([1531], 'Create multiple components from text, board and image'),
  async ({ browserName }) => {
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
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Board');
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('sample');
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Hello World!');
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'multiple-components-asset-3-layers.png',
      {
        mask: [assetsPanelPage.librariesOpenModalButton],
        maxDiffPixelRatio: 0.002,
      },
    );
  },
);

mainTest(qase([1751], 'Grouping component copies'), async () => {
  await mainTest.slow();
  await mainPage.createDefaultEllipseByCoordinates(200, 200);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultRectangleByCoordinates(500, 200, true);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMainMenuButton();
  await mainPage.clickEditMainMenuItem();
  await mainPage.clickSelectAllMainMenuSubItem();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.groupLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.expandGroupOnLayersTab();
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    'copy-components-group-layers.png',
  );
});

mainTest(qase([1749], 'Change group shadow color'), async () => {
  await mainTest.slow();
  await mainPage.createDefaultRectangleByCoordinates(200, 200);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.groupLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickAddGroupShadowButton();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFirstColorIcon();
  await colorPalettePage.setHex('#ff0000');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();

  await expect(mainPage.viewport).toHaveScreenshot(
    'components-change-group-shadow-color.png',
    {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    },
  );
});
