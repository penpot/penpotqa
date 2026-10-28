import { BasePage } from '@pages/base-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let assetsPanelPage: AssetsPanelPage;
let basePage: BasePage;
let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  basePage = new BasePage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainAccountFileTest.slow();
    await mainPage.createDefaultRectangleByCoordinates(400, 500);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainAccountFileTest(
    qase([1454], 'Duplicate main component'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Duplicate component from assets tab',
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.expandComponentsBlockOnAssetsTab();
          await assetsPanelPage.duplicateFileLibraryComponent();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        'Verify duplicated component in assets tab and canvas',
        async () => {
          await assetsPanelPage.isSecondComponentVisibleInAssetsTab('Rectangle');
          await layersPanelPage.openLayersTab();
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with duplicated rectangle component',
          ).toHaveScreenshot('component-rectangle-duplicated-canvas.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1455], 'Check Show main component option'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Show main component from assets tab',
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.expandComponentsBlockOnAssetsTab();
          await assetsPanelPage.showFileLibraryMainComponent();
        },
      );

      await mainAccountFileTest.step(
        'Verify main component is shown on canvas',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after showing main component from assets panel',
          ).toHaveScreenshot('component-show-main.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1285], 'Components - rename group'),
    async ({ mainPage }) => {
      const initialGroupName = 'Test Group';
      const renamedGroupName = 'New Group';

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
        `Rename group to "${renamedGroupName}"`,
        async () => {
          await assetsPanelPage.renameGroupFileLibrary(renamedGroupName);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        `Verify group is renamed to "${renamedGroupName}"`,
        async () => {
          await assetsPanelPage.isFileLibraryGroupCreated(renamedGroupName);
        },
      );
    },
  );

  mainAccountFileTest(qase([1286], 'Components - ungroup'), async ({ mainPage }) => {
    const groupName = 'Test Group';

    await mainAccountFileTest.step(
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

    await mainAccountFileTest.step(
      'Verify group is removed and component is visible',
      async () => {
        await assetsPanelPage.isFileLibraryGroupRemoved();
        await assetsPanelPage.isComponentVisibleInAssetsTab('Rectangle');
      },
    );
  });

  mainAccountFileTest(
    qase([1676], 'Components - change view (list/tile)'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Create 3 components on canvas', async () => {
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
      });

      await mainAccountFileTest.step('Verify default grid view', async () => {
        await expect(
          assetsPanelPage.assetsPanel,
          'Assets panel should match screenshot in grid view',
        ).toHaveScreenshot('component-grid-view.png', {
          mask: [assetsPanelPage.librariesOpenModalButton],
          maxDiffPixelRatio: 0.01,
        });
      });

      await mainAccountFileTest.step('Switch to list view and verify', async () => {
        await assetsPanelPage.clickFileLibraryListViewButton();
        await mainPage.waitForChangeIsSaved();
        await expect(
          assetsPanelPage.assetsPanel,
          'Assets panel should match screenshot in list view',
        ).toHaveScreenshot('component-list-view.png', {
          mask: [assetsPanelPage.librariesOpenModalButton],
          maxDiffPixelRatio: 0.01,
        });
      });

      await mainAccountFileTest.step(
        'Switch back to grid view and verify',
        async () => {
          await assetsPanelPage.clickFileLibraryGridViewButton();
          await mainPage.waitForChangeIsSaved();
          await expect(
            assetsPanelPage.assetsPanel,
            'Assets panel should match screenshot in grid view after switching back',
          ).toHaveScreenshot('component-grid-view.png', {
            mask: [assetsPanelPage.librariesOpenModalButton],
            maxDiffPixelRatio: 0.01,
          });
        },
      );
    },
  );
});

mainAccountFileTest(
  qase([1621], 'Create a group with component and check its name'),
  async ({ mainPage }) => {
    const groupName = 'Test Group';

    await mainAccountFileTest.step(
      'Create board component and create group in assets tab',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.createGroupFileLibraryAssets('Components', groupName);
      },
    );

    await mainAccountFileTest.step(
      `Verify group "${groupName}" is displayed in layers panel and canvas`,
      async () => {
        await assetsPanelPage.isFileLibraryGroupCreated(groupName);
        await layersPanelPage.openLayersTab();
        await layersPanelPage.isLayerNameDisplayed(groupName + ' / Board');
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with component group on canvas',
        ).toHaveScreenshot('component-group-canvas.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);

mainAccountFileTest(
  qase([1453], 'Rename component with valid name'),
  async ({ mainPage }) => {
    const newName = 'Renamed ellipse name';

    await mainAccountFileTest.step(
      `Create ellipse component and rename to "${newName}"`,
      async () => {
        await mainPage.createDefaultEllipseByCoordinates(400, 600);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.renameFileLibraryComponent(newName);
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      `Verify component is renamed to "${newName}"`,
      async () => {
        await layersPanelPage.openLayersTab();
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with renamed component on canvas',
        ).toHaveScreenshot('component-new-name-canvas.png', {
          mask: mainPage.maskViewport(),
        });
        await layersPanelPage.isLayerNameDisplayed(newName);
        await expect(
          layersPanelPage.layersSidebar,
          'Layers sidebar should match screenshot with renamed component',
        ).toHaveScreenshot('component-new-name-layer.png');
      },
    );
  },
);

mainAccountFileTest(
  qase([966], 'Filter Components from All Assets drop-down'),
  async () => {
    await mainAccountFileTest.step('Filter assets by Components type', async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.selectTypeFromAllAssetsDropdown('Components');
    });

    await mainAccountFileTest.step(
      'Verify Components section is displayed with 0 items',
      async () => {
        await assetsPanelPage.isAssetsSectionNameDisplayed('Components', '0');
      },
    );
  },
);

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainAccountFileTest.slow();
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '300');
  });

  mainAccountFileTest(
    qase([1412], 'Change copy and click Reset overrides'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Resize copy component and reset overrides',
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await designPanelPage.changeHeightAndWidthForLayer('100', '150');
          await basePage.resetOverridesViaRightClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        'Verify overrides are reset on canvas',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after resetting copy component overrides',
          ).toHaveScreenshot('main-copies-component-reset-overrides.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1300], 'Restore main component via context menu'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Delete main component and restore from copy',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await layersPanelPage.deleteMainComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await layersPanelPage.restoreMainComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.waitForMainComponentIsSelected();
        },
      );

      await mainAccountFileTest.step(
        'Verify restored main component on canvas',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with restored main component',
          ).toHaveScreenshot('main-component-restore-main.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1296], 'Detach instance from context menu'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Detach copy instance via right-click and resize',
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await layersPanelPage.detachInstanceCopyComponentViaRightClick();
          await designPanelPage.changeHeightAndWidthForLayer('300', '300');
          await designPanelPage.changeAxisXAndYForLayer('400', '300');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
        },
      );

      await mainAccountFileTest.step(
        'Verify detached instance on canvas',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after detaching copy instance via right-click',
          ).toHaveScreenshot(
            'main-copies-component-detach-instance-right-click.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1298], 'Reset overrides via context menu'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
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
          await designPanelPage.clickAddBlurButton();
          await designPanelPage.changeValueForBlur('2');
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        'Reset overrides on copy component via right-click',
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await basePage.resetOverridesViaRightClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        'Verify overrides are reset on canvas',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after resetting all overrides on copy component',
          ).toHaveScreenshot('main-copies-component-reset-overrides.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});
