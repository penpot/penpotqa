import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let assetsPanelPage: AssetsPanelPage;
let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest(qase([1273], 'Create component shape'), async ({ mainPage }) => {
  await mainAccountFileTest.step('Create rectangle and component', async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  await mainAccountFileTest.step('Verify component in assets tab', async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(
      assetsPanelPage.assetsPanel,
      'Assets panel should match screenshot with rectangle component',
    ).toHaveScreenshot('rectangle-component-asset.png', {
      mask: [assetsPanelPage.librariesOpenModalButton],
    });
  });
});

mainAccountFileTest(
  qase([1312], 'Drag a component from assets tab and drop into workspace'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step('Create ellipse and component', async () => {
      await mainPage.createDefaultEllipseByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step('Drag component to canvas', async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.dragComponentOnCanvas(50, 100);
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step(
      'Verify component on canvas and layers panel',
      async () => {
        await layersPanelPage.openLayersTab();
        await mainPage.hideRulersViaMainMenu();
        await mainPage.waitForChangeIsSaved();
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with copy of main component on canvas',
        ).toHaveScreenshot('copy-main-components-on-canvas.png', {
          mask: mainPage.maskViewport({ useRulers: true }),
        });
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Ellipse');
        await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Ellipse');
      },
    );
  },
);

mainAccountFileTest(
  qase([1431], 'Create component from rectangle by clicking CTRL K'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create rectangle component via shortcut',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createComponentViaShortcut();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Verify rectangle component on canvas and layers panel',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with rectangle main component',
        ).toHaveScreenshot('rectangle-main-component-canvas.png', {
          mask: mainPage.maskViewport(),
        });
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
      },
    );
  },
);

mainAccountFileTest(
  qase([1432], 'Create component from ellipse by clicking CTRL K'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create ellipse component via shortcut',
      async () => {
        await mainPage.createDefaultEllipseByCoordinates(200, 300);
        await mainPage.createComponentViaShortcut();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Verify ellipse component on canvas and layers panel',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with ellipse main component',
        ).toHaveScreenshot('ellipse-main-component-canvas.png', {
          mask: mainPage.maskViewport(),
        });
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Ellipse');
      },
    );
  },
);

mainAccountFileTest(
  qase([1433], 'Create component from board by clicking CTRL K'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create board component via shortcut',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(200, 300);
        await mainPage.createComponentViaShortcut(true);
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Verify board component on canvas and layers panel',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with board main component',
        ).toHaveScreenshot('board-main-component-canvas.png', {
          mask: mainPage.maskViewport(),
        });
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Board');
      },
    );
  },
);

mainAccountFileTest(
  qase([1434], 'Create component from text by right-click'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create text component via right-click',
      async () => {
        await mainPage.createDefaultTextLayer();
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Verify text component on canvas, layers panel and assets tab',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with text main component',
        ).toHaveScreenshot('text-main-component-canvas.png', {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        });
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName(
          'Hello World!',
        );
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.isComponentAddedToFileLibraryComponents();
        await expect(
          assetsPanelPage.assetsPanel,
          'Assets panel should match screenshot with text component',
        ).toHaveScreenshot('text-component-asset.png', {
          mask: [assetsPanelPage.librariesOpenModalButton],
          maxDiffPixelRatio: 0.002,
        });
      },
    );
  },
);

mainAccountFileTest(
  qase([1435], 'Create component from image by right-click'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create image component via right-click',
      async () => {
        await mainPage.uploadImage('images/sample.jpeg');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Verify image component on canvas, layers panel and assets tab',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with image main component',
        ).toHaveScreenshot('image-main-component-canvas.png', {
          mask: mainPage.maskViewport(),
        });
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('sample');
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.isComponentAddedToFileLibraryComponents();
        await expect(
          assetsPanelPage.assetsPanel,
          'Assets panel should match screenshot with image component',
        ).toHaveScreenshot('image-component-asset.png', {
          mask: [assetsPanelPage.librariesOpenModalButton],
          maxDiffPixelRatio: 0.002,
        });
      },
    );
  },
);

mainAccountFileTest(
  qase([1436], 'Create component from path by right-click'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create path component via right-click',
      async () => {
        await mainPage.createDefaultClosedPath();
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Verify path component on canvas, layers panel and assets tab',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with path main component',
        ).toHaveScreenshot('path-main-component-canvas.png', {
          mask: mainPage.maskViewport(),
        });
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Path');
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.isComponentAddedToFileLibraryComponents();
        await expect(
          assetsPanelPage.assetsPanel,
          'Assets panel should match screenshot with path component',
        ).toHaveScreenshot('path-component-asset.png', {
          mask: [assetsPanelPage.librariesOpenModalButton],
        });
      },
    );
  },
);

mainAccountFileTest(
  qase([3255], 'Create component from curve by right-click'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create curve component via right-click on layers tab',
      async () => {
        await mainPage.createDefaultCurveLayer();
        await layersPanelPage.createComponentViaRightClickLayers();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Verify curve component on canvas, layers panel and assets tab',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with curve main component',
        ).toHaveScreenshot('curve-main-component-canvas.png', {
          mask: mainPage.maskViewport(),
        });
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Path');
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.isComponentAddedToFileLibraryComponents();
        await expect(
          assetsPanelPage.assetsPanel,
          'Assets panel should match screenshot with curve component',
        ).toHaveScreenshot('curve-component-asset.png', {
          mask: [assetsPanelPage.librariesOpenModalButton],
        });
      },
    );
  },
);

mainAccountFileTest(qase([1291], 'Undo component'), async ({ mainPage }) => {
  await mainAccountFileTest.step(
    'Create rectangle component and change rotation',
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeRotationForLayer('200');
      await mainPage.isCornerHandleVisible();
    },
  );

  await mainAccountFileTest.step(
    'Verify component after rotation change',
    async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot with rotated component',
      ).toHaveScreenshot('component-change_rotation.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );

  await mainAccountFileTest.step('Undo rotation change', async () => {
    await mainPage.clickShortcutCtrlZ();
    await mainPage.isCornerHandleVisible();
  });

  await mainAccountFileTest.step('Verify component after undo', async () => {
    await expect(
      mainPage.viewport,
      'Viewport should match screenshot after undoing rotation change',
    ).toHaveScreenshot('component-change_rotation-undo.png', {
      mask: mainPage.maskViewport(),
    });
  });
});

mainAccountFileTest(
  qase([1530], 'Create multiple components from rectangle and ellipse'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Create multiple components from rectangle and ellipse',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createDefaultEllipseByCoordinates(400, 600, true);
        await mainPage.clickMainMenuButton();
        await mainPage.clickEditMainMenuItem();
        await mainPage.clickSelectAllMainMenuSubItem();
        await mainPage.createComponentsMultipleShapesRightClick(false);
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Verify multiple components on canvas, layers panel and assets tab',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with multiple components',
        ).toHaveScreenshot('multiple-components-canvas.png', {
          mask: mainPage.maskViewport(),
        });
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Ellipse');
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.isComponentVisibleInAssetsTab('Ellipse');
        await assetsPanelPage.isSecondComponentVisibleInAssetsTab('Rectangle');
      },
    );
  },
);

mainAccountFileTest(
  qase([1751], 'Grouping component copies'),
  async ({ mainPage }) => {
    await mainAccountFileTest.slow();
    const groupName = 'Group';

    await mainAccountFileTest.step(
      'Create two components and duplicate layers for grouping',
      async () => {
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
        await mainPage.waitForChangeIsSaved();
        await mainPage.groupLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      `Verify "${groupName}" group is visible in layers panel with copy components`,
      async () => {
        await layersPanelPage.expandGroupOnLayersTab(groupName);
        await expect(
          layersPanelPage.layersSidebar,
          'Layers sidebar should match screenshot with grouped copy components',
        ).toHaveScreenshot('copy-components-group-layers.png');
      },
    );
  },
);

mainAccountFileTest(
  qase([1749], 'Change group shadow color'),
  async ({ mainPage }) => {
    await mainAccountFileTest.slow();

    await mainAccountFileTest.step(
      'Create rectangle component and group with shadow',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 200);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.groupLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickAddGroupShadowButton();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step('Change shadow color to red', async () => {
      await designPanelPage.clickFirstColorIcon();
      await colorPalettePage.setHex('#ff0000');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step(
      'Verify shadow color change on canvas',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with red group shadow',
        ).toHaveScreenshot('components-change-group-shadow-color.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);

mainAccountFileTest(
  qase([1287], 'Search items in Components'),
  async ({ mainPage }) => {
    const component1Name = 'new test component';
    const component2Name = 'test component';
    const component3Name = 'abcd';

    await mainAccountFileTest.step(
      'Create 4 components with specific names',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(100, 200);
        await layersPanelPage.doubleClickLayerOnLayersTab('Board');
        await layersPanelPage.typeNameCreatedLayerAndEnter(component1Name);
        await mainPage.waitForChangeIsSaved();
        await mainPage.createComponentViaRightClickFromLayerByName(component1Name);

        await mainPage.createDefaultBoardByCoordinates(300, 200);
        await layersPanelPage.doubleClickLayerOnLayersTab('Board');
        await layersPanelPage.typeNameCreatedLayerAndEnter(component2Name);
        await mainPage.waitForChangeIsSaved();
        await mainPage.createComponentViaRightClickFromLayerByName(component2Name);

        await mainPage.createDefaultBoardByCoordinates(500, 200);
        await layersPanelPage.doubleClickLayerOnLayersTab('Board');
        await layersPanelPage.typeNameCreatedLayerAndEnter(component3Name);
        await mainPage.waitForChangeIsSaved();
        await mainPage.createComponentViaRightClickFromLayerByName(component3Name);

        const component4Name = '1234';
        await mainPage.createDefaultBoardByCoordinates(700, 200);
        await layersPanelPage.doubleClickLayerOnLayersTab('Board');
        await layersPanelPage.typeNameCreatedLayerAndEnter(component4Name);
        await mainPage.waitForChangeIsSaved();
        await mainPage.createComponentViaRightClickFromLayerByName(component4Name);
      },
    );

    await mainAccountFileTest.step(
      'Search components by name in assets tab',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.searchInAssetsTab(component1Name);
        await assetsPanelPage.isComponentVisibleInAssetsTab(component1Name);
        await assetsPanelPage.clearSearchInputInAssetsTab();

        await assetsPanelPage.searchInAssetsTab(component2Name);
        await assetsPanelPage.isComponentVisibleInAssetsTab(component1Name);
        await assetsPanelPage.isSecondComponentVisibleInAssetsTab(component2Name);
        await assetsPanelPage.clearSearchInputInAssetsTab();

        await assetsPanelPage.searchInAssetsTab(component3Name);
        await assetsPanelPage.isComponentVisibleInAssetsTab(
          component3Name.toUpperCase(),
        );
        await assetsPanelPage.clearSearchInputInAssetsTab();

        const invalidComponentName = 'qwe';
        await assetsPanelPage.searchInAssetsTab(invalidComponentName);
        await assetsPanelPage.isComponentNotVisibleInAssetsTab();
      },
    );
  },
);
