const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { InspectPanelPage } = require('../../../pages/workspace/inspect-panel-page');
const { BasePage } = require('../../../pages/base-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');

const teamName = random().concat('autotest');
const annotation = 'Test annotation for automation';

let mainPage, basePage, dashboardPage, teamPage, layersPanelPage, designPanelPage, colorPalettePage, assetsPanelPage;
test.beforeEach(async ({ page }) => {
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

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 10000);
    const mainPage = new MainPage(page);
    await mainPage.createDefaultRectangleByCoordinates(400, 500);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest('Show in assets panel option from Design tab', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnShowInAssetsPanel();
    await expect(page).toHaveScreenshot('component-show-in-assets-panel.png', {
      mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
    });
  });

  mainTest(
    'Show in assets panel option from component context menu',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.showInAssetsPanelRightClick();
      await expect(page).toHaveScreenshot('component-show-in-assets-panel.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
    },
  );

  mainTest('Create annotation with valid text', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnCreateAnnotationOption();
    await designPanelPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      'component-annotation.png',
    );
  });

  mainTest('Create annotation from context menu', async ({ page }) => {
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      'component-annotation.png',
    );
  });

  mainTest('Cancel annotation creation and accept', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnCreateAnnotationOption();
    await designPanelPage.cancelAddAnnotationForComponent(annotation);
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      'component-annotation-discard.png',
    );
  });

  mainTest('Edit annotation with valid text', async ({ page }) => {
    const newAnnotation = 'Edit annotation';
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await designPanelPage.clickOnEditAnnotation();
    await designPanelPage.editAnnotationForComponent(newAnnotation);
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(newAnnotation);
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      'component-annotation-edit.png',
    );
  });

  mainTest('Delete annotation', async ({ page }) => {
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await designPanelPage.clickOnDeleteAnnotation();
    await designPanelPage.confirmDeleteAnnotation();
    await designPanelPage.waitForChangeIsSaved();
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      'component-annotation-delete.png',
    );
  });

  mainTest('Annotation on Inspect tab', async ({ page }) => {
    const designPanelPage = new DesignPanelPage(page);
    const inspectPanelPage = new InspectPanelPage(page);
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();
    await inspectPanelPage.openInspectTab();
    await inspectPanelPage.isAnnotationExistOnInspectTab();
    await expect(inspectPanelPage.annotationBlockOnInspect).toHaveScreenshot(
      'component-annotation-inspect-tab.png',
    );
  });

  mainTest('Duplicate main component', async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.duplicateFileLibraryComponent();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isSecondComponentAddedToFileLibrary();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'component-rectangle-duplicated-asset.png',
    );
    await layersPanelPage.openLayersTab();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-rectangle-duplicated-canvas.png',
    );
  });

  mainTest('Check Show main component option', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.showFileLibraryMainComponent();
    await expect(mainPage.viewport).toHaveScreenshot('component-show-main.png');
  });

  mainTest(
    'Check annotation applies for copies and inspect tab',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      const inspectPanelPage = new InspectPanelPage(page);
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.clickOnCreateAnnotationOption();
      await designPanelPage.addAnnotationForComponent(annotation);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
        'copy-component-annotation.png',
      );
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.isAnnotationExistOnInspectTab();
      await expect(inspectPanelPage.annotationBlockOnInspect).toHaveScreenshot(
        'component-annotation-inspect-tab.png',
      );
    },
  );

  mainTest('Components - rename group', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.createGroupFileLibraryAssets('Components', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.renameGroupFileLibrary('New Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('New Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'group-components-renamed.png',
    );
  });

  mainTest('Components - ungroup', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.createGroupFileLibraryAssets('Components', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.ungroupFileLibrary();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupRemoved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'component-rectangle.png',
    );
  });

  mainTest('Components - change view list tile', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
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
    );
    await assetsPanelPage.clickFileLibraryListViewButton();
    await mainPage.waitForChangeIsSaved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'component-list-view.png',
    );
    await assetsPanelPage.clickFileLibraryGridViewButton();
    await mainPage.waitForChangeIsSaved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'component-grid-view.png',
    );
  });

  mainTest(
    'PENPOT-1399 Impossible to create annotation for copy component',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeAxisXandYForLayer('200', '0');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isAnnotationOptionNotVisibleRightClick();
      await expect(mainPage.viewport).toHaveScreenshot(
        'copy-component-right-click-annotation-disabled.png',
      );
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.isAnnotationOptionNotVisible();
      await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
        'copy-component-annotation-disabled.png',
      );
    },
  );

});

mainTest(
  'Check created component group of shapes on Assets tab',
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createDefaultEllipseByCoordinates(400, 600);
    await mainPage.clickMainMenuButton();
    await mainPage.clickEditMainMenuItem();
    await mainPage.clickSelectAllMainMenuSubItem();
    await mainPage.createComponentsMultipleShapesRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'ellipse-complex-component-canvas.png',
    );
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      'ellipse-complex-component-layer.png',
    );
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'ellipse-complex-component-asset.png',
    );
  },
);

mainTest('Create a group with component and check its name', async ({ page }) => {
  const groupName = 'Test Group';
  await mainPage.createDefaultBoardByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.createGroupFileLibraryAssets('Components', groupName);
  await assetsPanelPage.isFileLibraryGroupCreated(groupName);
  await layersPanelPage.openLayersTab();
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    'component-group-layer.png',
  );
  await expect(mainPage.viewport).toHaveScreenshot('component-group-canvas.png');
});

mainTest('Rename component with valid name', async ({ page }) => {
  const newName = 'Renamed ellipse name';
  await mainPage.createDefaultEllipseByCoordinates(400, 600);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.renameFileLibraryComponent(newName);
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.openLayersTab();
  await expect(mainPage.viewport).toHaveScreenshot('component-new-name-canvas.png');
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    'component-new-name-layer.png',
  );
});

mainTest('Filter Components from All Assets drop-down', async ({ page }) => {
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.selectTypeFromAllAssetsDropdown('Components');
  await assetsPanelPage.isAssetsSectionNameDisplayed('Components', '0');
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 15000);
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('400', '300');
  });

  mainTest(
    'PENPOT-1411 Click Show main component on copy',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await basePage.showMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-show-main.png',
      );
    },
  );

  mainTest(
    'PENPOT-1412 Change copy and click Reset overrides',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeHeightAndWidthForLayer('100', '150');
      await basePage.resetOverridesViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-reset-overrides.png',
      );
    },
  );

  mainTest(
    'PENPOT-1413 Change copy color, change main color, right-click copy and click Reset overrides',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#460EA2');
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('460EA2');

      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#0EA27A');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('0EA27A');

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.clickOnResetOverridesOption();
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('0EA27A');

      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-color-reset-overrides.png',
      );
    },
  );

  mainTest(
    'PENPOT-1300 Restore main component via context menu',
    async ({ page }) => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.deleteMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await layersPanelPage.restoreMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-component-restore-main.png',
      );
    },
  );

  mainTest(
    'PENPOT-1296 Detach instance from context menu',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await layersPanelPage.detachInstanceCopyComponentViaRightClick();
      await designPanelPage.changeHeightAndWidthForLayer('300', '300');
      await designPanelPage.changeAxisXandYForLayer('400', '300');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-detach-instance-right-click.png',
      );
    },
  );

  mainTest(
    'PENPOT-1297 Detach instance from "Design" tab',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.clickOnDetachInstanceOption();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeHeightAndWidthForLayer('300', '300');
      await designPanelPage.changeAxisXandYForLayer('400', '300');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-detach-instance-right-click.png',
      );
    },
  );

  mainTest(
    'PENPOT-1298 Reset overrides via context menu',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeHeightAndWidthForLayer('100', '150');
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#460EA2');
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('460EA2');

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('2');
      await mainPage.waitForChangeIsSaved();

      await basePage.resetOverridesViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-reset-overrides.png',
      );
    },
  );

});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 15000);
    await mainPage.createDefaultEllipseByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('400', '400');
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXandYForLayer('50', '400');

    await layersPanelPage.clickFirstCopyComponentOnLayersTab();
    await designPanelPage.clickAddFillButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#092062');
    await layersPanelPage.clickFirstCopyComponentOnLayersTab();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('092062');
  });

  mainTest(
    'PENPOT-1416 Create 2 copies of main component. Change color of copy 1, change color of copy 2, right-click copy 2 and click "Update main component"',
    async ({ page }) => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#CD0B4B');
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('CD0B4B');

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await layersPanelPage.updateMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.clickFirstCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('092062');

      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('CD0B4B');

      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-color-update-component.png',
      );
    },
  );

  mainTest(
    'PENPOT-1417 Create a copy from main, change color of copy, create a copy from copy, change color of main',
    async ({ page }) => {
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickNCopyComponentOnLayersTab(-2);
      await designPanelPage.changeAxisXandYForLayer('250', '500');

      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#0B33A9');
      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('0B33A9');

      await layersPanelPage.clickFirstCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('092062');

      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('0B33A9');

      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-color.png',
      );
    },
  );
});
