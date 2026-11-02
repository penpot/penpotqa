import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const annotation = 'Test annotation for automation';

let assetsPanelPage: AssetsPanelPage;
let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let pagesPanelPage: PagesPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  pagesPanelPage = new PagesPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
  });

  demoAccountFileTest(
    qase(
      [1724],
      'Create a component from grid board with some element inside, edit component in grid layout section',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create component from grid board',
        async () => {
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickViewportOnce();
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await mainPage.clickBoardOnCanvas();
          await mainPage.doubleClickBoardOnCanvas();
        },
      );

      await demoAccountFileTest.step(
        'Edit grid row label to "100 PX" and verify grid row label change on canvas',
        async () => {
          await mainPage.changeGridRowLabel('100 PX');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-with-px-row.png',
            {
              mask: mainPage.maskViewport({ gridEditorToolbar: true }),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1730], 'Restore main component'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create component, duplicate and delete main',
        async () => {
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await mainPage.duplicateLayerViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickMainComponentOnLayersTab();
          await layersPanelPage.deleteMainComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Restore main component from copy via right-click and verify restored main component on canvas',
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await layersPanelPage.restoreMainComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.waitForMainComponentIsSelected();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-with-grid-layout-main-restore.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1731], 'Undo component editing and deleting'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create component and change fill color and verify component with blue fill color',
        async () => {
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#0000FF');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await colorPalettePage.closeColorPicker();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-blue-color.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Undo fill color change and verify component after undoing fill color',
        async () => {
          await mainPage.clickViewportOnce();
          await mainPage.clickShortcutCtrlZ();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-undo-color.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Delete component and undo deletion and verify component is restored after undoing deletion',
        async () => {
          await layersPanelPage.deleteMainComponentViaRightClick();
          await mainPage.isCreatedLayerVisible(false);
          await mainPage.clickShortcutCtrlZ();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-restored.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1732, 1733], '[Grid layout] Use shared component in another file'),
    async ({ dashboardPage, mainPage }) => {
      await demoAccountFileTest.step(
        'Create component and add file as shared library',
        async () => {
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickPencilBoxButton();
          await dashboardPage.addFileAsSharedLibraryViaRightclick();
          await dashboardPage.isSharedLibraryIconDisplayed();
        },
      );

      await demoAccountFileTest.step(
        'Create new file and import shared library',
        async () => {
          await dashboardPage.createFileViaTitlePanel();
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.clickLibrariesButton();
          await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
          await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
          await assetsPanelPage.clickCloseModalButton();
          await dashboardPage.reloadPage();
        },
      );

      await demoAccountFileTest.step(
        'Drag component from shared library to canvas and verify component from shared library on canvas',
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await mainPage.clickMoveButton();
          await assetsPanelPage.clickLibraryTitleWithName('New File 1');
          await assetsPanelPage.clickLibraryComponentsTitle();
          await assetsPanelPage.dragAndDropComponentToViewport('Board');
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickEmptyViewportArea();
          await mainPage.moveMouseOutOfViewport();
          // After the drop, the canvas view can settle 1px off (up to ~1700px of diff)
          await mainPage.checkViewportScreenshotWithoutRulers(
            'board-from-library-file.png',
            mainPage.maskViewport(),
            0.002,
          );
        },
      );
    },
  );
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.createDefaultRectangleByCoordinates(180, 200, true);
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaLayersTab('Rectangle');
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase([1718], 'Copy-paste component, that was created from grid board'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Copy and paste component from grid board and verify copy-pasted component on canvas and layers panel',
        async () => {
          await mainPage.clickViewportOnce();
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await expect(async () => {
            await mainPage.copyLayerViaRightClick();
            await Promise.all([
              mainPage.waitForUpdateFileRequest(),
              mainPage.pressPasteShortcut(),
            ]);
          }).toPass({ timeout: 35000 });
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-with-grid-layout-copy-paste.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
            'copy-paste-layer.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1728], 'Duplicate component, that was created from grid board'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Duplicate component via shortcut and verify duplicated component on canvas and layers panel',
        async () => {
          await Promise.all([
            mainPage.waitForUpdateFileRequest(),
            mainPage.clickShortcutCtrlD(),
          ]);
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-with-grid-layout-duplicated.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Board');
          await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Board');
        },
      );
    },
  );
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await mainPage.createDefaultBoardByCoordinates(100, 100);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickShortcutCtrlD();
    await designPanelPage.changeAxisXAndYForLayer('500', '100');
  });

  demoAccountFileTest(
    qase([1720], 'Change the copy component and click "Update main component"'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Resize copy component and update main and verify updated main component on canvas',
        async () => {
          await designPanelPage.changeHeightAndWidthForLayer('25', '25');
          await layersPanelPage.updateMainComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-with-grid-layout-main-updated.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1721], 'Change the copy component and click "Show main component"'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Change copy fill color and show main component and verify main component is shown on canvas',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#000000');
          await mainPage.waitForChangeIsSaved();
          await mainPage.showMainComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-with-grid-layout-main-show.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1722], 'Change the copy component and click "Reset overrides"'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Change copy fill color and reset overrides and verify overrides are reset on canvas',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#000000');
          await mainPage.waitForChangeIsSaved();
          await mainPage.resetOverridesViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-with-grid-layout-reset-overrides.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1723], 'Change the copy component and click "Detach instance"'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Resize copy component and detach instance and verify detached instance on canvas and layers panel',
        async () => {
          await designPanelPage.changeHeightAndWidthForLayer('25', '25');
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.detachInstanceCopyComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.checkCopyComponentLayerCount(0);
          await mainPage.moveMouseOutOfViewport();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-component-with-grid-layout-detach-instance.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
            'detach-instance-layer.png',
          );
        },
      );
    },
  );
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase(
      [1725, 1752],
      'Create annotation for component, that already has annotation',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        `Verify annotation "${annotation}" is added to component`,
        async () => {
          await designPanelPage.isAnnotationAddedToComponent(annotation);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify annotation option is not available in right-click menu or component menu',
        async () => {
          await designPanelPage.isAnnotationOptionNotVisibleRightClick();
          await designPanelPage.clickOnComponentMenuButton();
          await designPanelPage.isAnnotationOptionNotVisible();
        },
      );
    },
  );

  demoAccountFileTest(qase([1726], 'Edit annotation for component'), async () => {
    await demoAccountFileTest.step(
      `Edit annotation from "${annotation}" to "Edit annotation"`,
      async () => {
        await designPanelPage.clickOnEditAnnotation();
        await designPanelPage.editAnnotationForComponent('Edit annotation');
        await designPanelPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Verify edited annotation is displayed',
      async () => {
        await designPanelPage.isAnnotationAddedToComponent('Edit annotation');
      },
    );
  });

  demoAccountFileTest(qase([1727], 'Delete annotation for component'), async () => {
    await demoAccountFileTest.step(
      `Delete annotation "${annotation}" from component`,
      async () => {
        await designPanelPage.clickOnDeleteAnnotation();
        await designPanelPage.confirmDeleteAnnotation();
        await designPanelPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Verify annotation is removed from component',
      async () => {
        await designPanelPage.isAnnotationNotAddedToComponent();
      },
    );
  });
});
