import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { expect, Page } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { random } from 'helpers/string-generator';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { BasePage } from '@pages/base-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName: string = random().concat('autotest');

let mainPage: MainPage;
let basePage: BasePage;
let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;
let assetsPanelPage: AssetsPanelPage;

mainTest.beforeEach(async ({ page }: { page: Page }) => {
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
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.isComponentHighlightedInAssetsTab();
    },
  );

  mainTest(qase([1454], 'Duplicate main component'), async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.duplicateFileLibraryComponent();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isSecondComponentVisibleInAssetsTab('Rectangle');
    await layersPanelPage.openLayersTab();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-rectangle-duplicated-canvas.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });

  mainTest(qase([1455], 'Check Show main component option'), async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.showFileLibraryMainComponent();
    await expect(mainPage.viewport).toHaveScreenshot('component-show-main.png', {
      mask: mainPage.maskViewport(),
    });
  });

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
    await assetsPanelPage.isComponentVisibleInAssetsTab('Rectangle');
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
      await designPanelPage.isComponentTypeCopy();
      await designPanelPage.isAnnotationNotAddedToComponent();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.isAnnotationOptionNotVisible();
      await designPanelPage.isComponentTypeCopy();
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
        mask: mainPage.maskViewport(),
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
      mask: mainPage.maskViewport(),
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
    mask: mainPage.maskViewport(),
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
        mask: mainPage.maskViewport(),
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
        mask: mainPage.maskViewport(),
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
          mask: mainPage.maskViewport(),
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
        mask: mainPage.maskViewport(),
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
        mask: mainPage.maskViewport(),
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
        mask: mainPage.maskViewport(),
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
        mask: mainPage.maskViewport(),
      },
    );
  });
});

mainTest.describe(() => {
  const hexColor1 = '#092062';
  const hexColor2 = '#CD0B4B';
  const hexColor3 = '#0B33A9';

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
    await designPanelPage.changeSelectedColorHexCode(hexColor1);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickFirstCopyComponentOnLayersTab();
    await designPanelPage.isSelectedColorHexCode(hexColor1);
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
      await designPanelPage.changeSelectedColorHexCode(hexColor2);
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isSelectedColorHexCode(hexColor2);

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await layersPanelPage.updateMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.clickFirstCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isSelectedColorHexCode(hexColor1);

      await layersPanelPage.clickMainComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isSelectedColorHexCode(hexColor2);

      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-color-update-component.png',
        {
          mask: mainPage.maskViewport(),
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
      await designPanelPage.changeSelectedColorHexCode(hexColor3);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.isSelectedColorHexCode(hexColor3);

      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickFirstCopyComponentOnLayersTab();
      await designPanelPage.isSelectedColorHexCode(hexColor1);

      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.isSelectedColorHexCode(hexColor3);

      await expect(mainPage.viewport).toHaveScreenshot(
        'main-copies-component-change-color.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );
});
