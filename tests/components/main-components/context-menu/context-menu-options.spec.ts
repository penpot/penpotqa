import { BasePage } from '@pages/base-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { BlurSectionComponent } from '@pages/workspace/right-sidebar/design-tab/blur-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let assetsPanelPage: AssetsPanelPage;
let basePage: BasePage;
let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let blur: BlurSectionComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  basePage = new BasePage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  blur = new WorkspacePage(page).rightSidebar.design.blur;
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await mainPage.createDefaultRectangleByCoordinates(400, 500);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase([1454], 'Duplicate main component'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Duplicate component from assets tab and verify duplicated component in assets tab and canvas',
        async () => {
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
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1455], 'Check Show main component option'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Show main component from assets tab and verify main component is shown on canvas',
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.expandComponentsBlockOnAssetsTab();
          await assetsPanelPage.showFileLibraryMainComponent();
          await expect(mainPage.viewport).toHaveScreenshot(
            'component-show-main.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1285], 'Components - rename group'),
    async ({ mainPage }) => {
      const initialGroupName = 'Test Group';
      const renamedGroupName = 'New Group';

      await demoAccountFileTest.step(
        `Create group "${initialGroupName}" in assets tab`,
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.expandComponentsBlockOnAssetsTab();
          await assetsPanelPage.createGroupFileLibraryAssets(
            'Components',
            initialGroupName,
          );
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        `Rename group to "${renamedGroupName}"`,
        async () => {
          await assetsPanelPage.renameGroupFileLibrary(renamedGroupName);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        `Verify group is renamed to "${renamedGroupName}"`,
        async () => {
          await assetsPanelPage.isFileLibraryGroupCreated(renamedGroupName);
        },
      );
    },
  );

  demoAccountFileTest(qase([1286], 'Components - ungroup'), async ({ mainPage }) => {
    const groupName = 'Test Group';

    await demoAccountFileTest.step(
      `Create group "${groupName}" and ungroup it`,
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.createGroupFileLibraryAssets('Components', groupName);
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.ungroupFileLibrary();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Verify group is removed and component is visible',
      async () => {
        await assetsPanelPage.isFileLibraryGroupRemoved();
        await assetsPanelPage.isComponentVisibleInAssetsTab('Rectangle');
      },
    );
  });

  demoAccountFileTest(
    qase([1676], 'Components - change view (list/tile)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create 3 components on canvas and verify default grid view',
        async () => {
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
        },
      );

      await demoAccountFileTest.step('Switch to list view and verify', async () => {
        await assetsPanelPage.clickFileLibraryListViewButton();
        await mainPage.waitForChangeIsSaved();
        await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
          'component-list-view.png',
          {
            mask: [assetsPanelPage.librariesOpenModalButton],
            maxDiffPixelRatio: 0.01,
          },
        );
      });

      await demoAccountFileTest.step(
        'Switch back to grid view and verify',
        async () => {
          await assetsPanelPage.clickFileLibraryGridViewButton();
          await mainPage.waitForChangeIsSaved();
          await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
            'component-grid-view.png',
            {
              mask: [assetsPanelPage.librariesOpenModalButton],
              maxDiffPixelRatio: 0.01,
            },
          );
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([1621], 'Create a group with component and check its name'),
  async ({ mainPage }) => {
    const groupName = 'Test Group';

    await demoAccountFileTest.step(
      `Create board component and create group in assets tab and verify group "${groupName}" is displayed in layers panel and canvas`,
      async () => {
        await mainPage.createDefaultBoardByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.createGroupFileLibraryAssets('Components', groupName);
        await assetsPanelPage.isFileLibraryGroupCreated(groupName);
        await layersPanelPage.openLayersTab();
        await layersPanelPage.isLayerNameDisplayed(groupName + ' / Board');
        await expect(mainPage.viewport).toHaveScreenshot(
          'component-group-canvas.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);

demoAccountFileTest(
  qase([1453], 'Rename component with valid name'),
  async ({ mainPage }) => {
    const newName = 'Renamed ellipse name';

    await demoAccountFileTest.step(
      `Create ellipse component and rename to "${newName}" and verify component is renamed to "${newName}"`,
      async () => {
        await mainPage.createDefaultEllipseByCoordinates(400, 600);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.renameFileLibraryComponent(newName);
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.openLayersTab();
        await expect(mainPage.viewport).toHaveScreenshot(
          'component-new-name-canvas.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await layersPanelPage.isLayerNameDisplayed(newName);
        await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
          'component-new-name-layer.png',
        );
      },
    );
  },
);

demoAccountFileTest(
  qase([966], 'Filter Components from All Assets drop-down'),
  async () => {
    await demoAccountFileTest.step('Filter assets by Components type', async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.selectTypeFromAllAssetsDropdown('Components');
    });

    await demoAccountFileTest.step(
      'Verify Components section is displayed with 0 items',
      async () => {
        await assetsPanelPage.isAssetsSectionNameDisplayed('Components', '0');
      },
    );
  },
);

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '300');
  });

  demoAccountFileTest(
    qase([1412], 'Change copy and click Reset overrides'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Resize copy component and reset overrides and verify overrides are reset on canvas',
        async () => {
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
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1300], 'Restore main component via context menu'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Delete main component and restore from copy and verify restored main component on canvas',
        async () => {
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
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1296], 'Detach instance from context menu'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Detach copy instance via right-click and resize and verify detached instance on canvas',
        async () => {
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
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1298], 'Reset overrides via context menu'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Resize, add fill and blur to copy component',
        async () => {
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
          await blur.addBlur();
          await blur.changeBlurValue('2');
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Reset overrides on copy component via right-click and verify overrides are reset on canvas',
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await basePage.resetOverridesViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-copies-component-reset-overrides.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );
});
