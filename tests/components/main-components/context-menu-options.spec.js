const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { InspectPanelPage } = require('../../../pages/workspace/inspect-panel-page');
const { BasePage } = require('../../../pages/base-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');
const annotation = 'Test annotation for automation';

let mainPage,
  basePage,
  dashboardPage,
  teamPage,
  layersPanelPage,
  designPanelPage,
  colorPalettePage,
  assetsPanelPage;
mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  basePage = new BasePage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultRectangleByCoordinates(400, 500);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([1452], 'Show in assets panel option from Design tab'), async () => {
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnShowInAssetsPanel();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isComponentHighlightedInAssetsTab();
  });

  mainTest(
    qase([1536], 'Show in assets panel option from component context menu (RMB)'),
    async () => {
      await mainPage.showInAssetsPanelRightClick();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.isComponentHighlightedInAssetsTab();
    },
  );

  mainTest(qase([1419], 'Create annotation with valid text'), async () => {
    await layersPanelPage.clickMainComponentOnLayersTab();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnCreateAnnotationOption();
    await designPanelPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      'component-annotation.png',
    );
  });

  mainTest(qase([1423], 'Create annotation from context menu'), async () => {
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
  });

  mainTest(qase([1424], 'Cancel annotation creation and accept'), async () => {
    await layersPanelPage.clickMainComponentOnLayersTab();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnCreateAnnotationOption();
    await designPanelPage.cancelAddAnnotationForComponent(annotation);
    await designPanelPage.isAnnotationNotAddedToComponent();
  });

  mainTest(qase([1425], 'Edit annotation with valid text'), async () => {
    const newAnnotation = 'Edit annotation';
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await designPanelPage.clickOnEditAnnotation();
    await designPanelPage.editAnnotationForComponent(newAnnotation);
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(newAnnotation);
  });

  mainTest(qase([1427], 'Delete annotation'), async () => {
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await designPanelPage.clickOnDeleteAnnotation();
    await designPanelPage.confirmDeleteAnnotation();
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationNotAddedToComponent();
  });

  mainTest(qase([1618], 'Annotation on Inspect tab'), async ({ page }) => {
    const inspectPanelPage = new InspectPanelPage(page);
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();
    await inspectPanelPage.openInspectTab();
    await inspectPanelPage.openComputedTab();
    await inspectPanelPage.isAnnotationExistOnInspectTab();
    await inspectPanelPage.isAnnotationTextExistOnInspectTab(annotation);
  });

  mainTest(qase([1454], 'Duplicate main component'), async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.duplicateFileLibraryComponent();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isSecondComponentWithNameAddedToFileLibrary('Rectangle');
    await layersPanelPage.openLayersTab();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-rectangle-duplicated-canvas.png',
      {
        mask: await mainPage.maskViewport(true),
      },
    );
  });

  mainTest(qase([1455], 'Check Show main component option'), async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.showFileLibraryMainComponent();
    await expect(mainPage.viewport).toHaveScreenshot('component-show-main.png', {
      mask: await mainPage.maskViewport(true),
    });
  });

  mainTest(
    qase([1428], 'Check annotation applies for copies and inspect tab'),
    async ({ page }) => {
      const inspectPanelPage = new InspectPanelPage(page);
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.clickOnCreateAnnotationOption();
      await designPanelPage.addAnnotationForComponent(annotation);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.isComponentTypeCopy(true);
      await designPanelPage.isAnnotationAddedToComponent(annotation);
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openComputedTab();
      await inspectPanelPage.isAnnotationExistOnInspectTab();
      await inspectPanelPage.isAnnotationTextExistOnInspectTab(annotation);
    },
  );

  mainTest(qase([1285], 'Components - rename group'), async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.createGroupFileLibraryAssets('Components', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.renameGroupFileLibrary('New Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('New Group');
  });

  mainTest(qase([1286], 'Components - ungroup'), async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.createGroupFileLibraryAssets('Components', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.ungroupFileLibrary();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupRemoved();
    await assetsPanelPage.isComponentWithNameAddedToFileLibrary('Rectangle');
  });

  mainTest(qase([1676], 'Components - change view (list/tile)'), async () => {
    await mainPage.createDefaultEllipseByCoordinates(100, 200, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.uploadImage('images/sample.jpeg');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'component-grid-view.png',
      {
        mask: [assetsPanelPage.librariesOpenModalButton],
        maxDiffPixelRatio: 0.01,
      },
    );
    await assetsPanelPage.clickFileLibraryListViewButton();
    await mainPage.waitForChangeIsSaved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'component-list-view.png',
      {
        mask: [assetsPanelPage.librariesOpenModalButton],
        maxDiffPixelRatio: 0.01,
      },
    );
    await assetsPanelPage.clickFileLibraryGridViewButton();
    await mainPage.waitForChangeIsSaved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'component-grid-view.png',
      {
        mask: [assetsPanelPage.librariesOpenModalButton],
        maxDiffPixelRatio: 0.01,
      },
    );
  });

  mainTest(
    qase([1399], 'Impossible to create annotation for copy component'),
    async () => {
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeAxisXAndYForLayer('200', '0');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isAnnotationOptionNotVisibleRightClick();
      await designPanelPage.isComponentTypeCopy(true);
      await designPanelPage.isAnnotationNotAddedToComponent();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.isAnnotationOptionNotVisible();
      await designPanelPage.isComponentTypeCopy(true);
      await designPanelPage.isAnnotationNotAddedToComponent();
    },
  );
});

mainTest(
  qase([1274], 'Check created component (group of shapes) on Assets tab'),
  async () => {
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createDefaultEllipseByCoordinates(400, 600);
    await mainPage.clickMainMenuButton();
    await mainPage.clickEditMainMenuItem();
    await mainPage.clickSelectAllMainMenuSubItem();
    await mainPage.createComponentsMultipleShapesRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'ellipse-complex-component-canvas.png',
      {
        mask: await mainPage.maskViewport(true),
      },
    );
    await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Component 1');
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'ellipse-complex-component-asset.png',
      {
        mask: [assetsPanelPage.librariesOpenModalButton],
      },
    );
  },
);

mainTest(
  qase([1621], 'Create a group with component and check its name'),
  async () => {
    const groupName = 'Test Group';
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.createGroupFileLibraryAssets('Components', groupName);
    await assetsPanelPage.isFileLibraryGroupCreated(groupName);
    await layersPanelPage.openLayersTab();
    await layersPanelPage.isLayerNameDisplayed(groupName + ' / Board');
    await expect(mainPage.viewport).toHaveScreenshot('component-group-canvas.png', {
      mask: await mainPage.maskViewport(true),
    });
  },
);

mainTest(qase([1453], 'Rename component with valid name'), async () => {
  const newName = 'Renamed ellipse name';
  await mainPage.createDefaultEllipseByCoordinates(400, 600);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.renameFileLibraryComponent(newName);
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.openLayersTab();
  await expect(mainPage.viewport).toHaveScreenshot('component-new-name-canvas.png', {
    mask: await mainPage.maskViewport(true),
  });
  await layersPanelPage.isLayerNameDisplayed(newName);
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    'component-new-name-layer.png',
  );
});

mainTest(qase([966], 'Filter Components from All Assets drop-down'), async () => {
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.selectTypeFromAllAssetsDropdown('Components');
  await assetsPanelPage.isAssetsSectionNameDisplayed('Components', '0');
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '300');
  });

  mainTest(qase([1411], 'Click Show main component on copy'), async () => {
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await basePage.showMainComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'main-copies-component-show-main.png',
      {
        mask: await mainPage.maskViewport(true),
      },
    );
  });

  mainTest(qase([1412], 'Change copy and click Reset overrides'), async () => {
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeHeightAndWidthForLayer('100', '150');
    await basePage.resetOverridesViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'main-copies-component-reset-overrides.png',
      {
        mask: await mainPage.maskViewport(true),
      },
    );
  });

  mainTest(
    qase(
      [1413],
      'Change copy color, change main color, right-click copy and click Reset overrides',
    ),
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#460EA2');
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#460EA2');

      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#0EA27A');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#0EA27A');

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.clickOnResetOverridesOption();
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#0EA27A');

      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-color-reset-overrides.png',
        {
          mask: await mainPage.maskViewport(true),
        },
      );
    },
  );

  mainTest(qase([1300], 'Restore main component via context menu'), async () => {
    await layersPanelPage.clickMainComponentOnLayersTab();
    await layersPanelPage.deleteMainComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await layersPanelPage.restoreMainComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.waitForMainComponentIsSelected();
    await expect(mainPage.viewport).toHaveScreenshot(
      'main-component-restore-main.png',
      {
        mask: await mainPage.maskViewport(true),
      },
    );
  });

  mainTest(qase([1296], 'Detach instance from context menu'), async () => {
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await layersPanelPage.detachInstanceCopyComponentViaRightClick();
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await designPanelPage.changeAxisXAndYForLayer('400', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot(
      'main-copies-component-detach-instance-right-click.png',
      {
        mask: await mainPage.maskViewport(true),
      },
    );
  });

  mainTest(qase([1297], 'Detach instance from "Design" tab'), async () => {
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnDetachInstanceOption();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await designPanelPage.changeAxisXAndYForLayer('400', '300');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'main-copies-component-detach-instance-right-click.png',
      {
        mask: await mainPage.maskViewport(true),
      },
    );
  });

  mainTest(qase([1298], 'Reset overrides via context menu'), async () => {
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeHeightAndWidthForLayer('100', '150');
    await designPanelPage.clickAddFillButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#460EA2');
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('#460EA2');

    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.clickAddBlurButton();
    await designPanelPage.changeValueForBlur('2');
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.clickCopyComponentOnLayersTab();
    await basePage.resetOverridesViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'main-copies-component-reset-overrides.png',
      {
        mask: await mainPage.maskViewport(true),
      },
    );
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultEllipseByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '400');
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('50', '400');

    await layersPanelPage.clickFirstCopyComponentOnLayersTab();
    await designPanelPage.clickAddFillButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#092062');
    await layersPanelPage.clickFirstCopyComponentOnLayersTab();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('#092062');
  });

  mainTest(
    qase(
      [1416],
      'Create 2 copies of main component. Change color of copy 1, change color of copy 2, right-click copy 2 and click "Update main component"',
    ),
    async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#CD0B4B');
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#CD0B4B');

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await layersPanelPage.updateMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.clickFirstCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#092062');

      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#CD0B4B');

      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-color-update-component.png',
        {
          mask: await mainPage.maskViewport(true),
        },
      );
    },
  );

  mainTest(
    qase(
      [1417],
      'Create a copy from main, change color of copy, create a copy from copy, change color of main',
    ),
    async () => {
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickNCopyComponentOnLayersTab(-2);
      await designPanelPage.changeAxisXAndYForLayer('250', '500');

      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#0B33A9');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#0B33A9');

      await layersPanelPage.clickFirstCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#092062');

      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#0B33A9');

      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-color.png',
        {
          mask: await mainPage.maskViewport(true),
        },
      );
    },
  );
});
