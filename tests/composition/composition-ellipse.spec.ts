import { ExportFormat } from '@pages/components/export-section-component';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { BlurSectionComponent } from '@pages/workspace/right-sidebar/design-tab/blur-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let blur: BlurSectionComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  blur = new WorkspacePage(page).rightSidebar.design.blur;
});

demoAccountFileTest(
  qase([328], 'Create Ellipse (Shortcut E)'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Press E shortcut and verify ellipse tool is active',
      async () => {
        await mainPage.pressKeyboardShortcut('E');
        await mainPage.isShapeToolActive('circle');
      },
    );

    await demoAccountFileTest.step(
      'Click on canvas and verify ellipse with default size is created',
      async () => {
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await layersPanelPage.isLayerNameDisplayed('Ellipse');
        await designPanelPage.checkSizeWidth('100');
        await designPanelPage.checkSizeHeight('100');
      },
    );
  },
);

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    demoAccountFileTest.slow();
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase([327], 'Create Ellipse (Toolbar)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Verify ellipse with default size is created',
        async () => {
          await mainPage.isCreatedLayerVisible();
          await layersPanelPage.isLayerNameDisplayed('Ellipse');
          await designPanelPage.checkSizeWidth('100');
          await designPanelPage.checkSizeHeight('100');
          await expect(mainPage.viewport).toHaveScreenshot('ellipse.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([334], 'Add, hide, unhide and delete Blur to ellipse'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Set fill color and add blur', async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex('#304d6a');
        await mainPage.waitForChangeIsSaved();
        await blur.addBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step('Verify blur is applied', async () => {
        await blur.checkBlurAdded();
        await blur.checkBlurHidden(false);
        await expect(mainPage.viewport).toHaveScreenshot(
          'ellipse-blur-default.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await demoAccountFileTest.step('Hide blur and verify', async () => {
        await blur.toggleBlur();
        await mainPage.waitForChangeIsSaved();
        await blur.checkBlurHidden();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-hide.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await demoAccountFileTest.step('Unhide blur and verify', async () => {
        await blur.toggleBlur();
        await mainPage.waitForChangeIsSaved();
        await blur.checkBlurHidden(false);
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-unhide.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await demoAccountFileTest.step('Remove blur and verify', async () => {
        await blur.removeBlur();
        await mainPage.waitForChangeIsSaved();
        await blur.checkBlurAdded(false);
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-remove.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  demoAccountFileTest(
    qase([335], 'Add and edit Blur to ellipse'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Add blur and change value', async () => {
        await blur.addBlur();
        await blur.changeBlurValue('55');
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step('Verify blur appearance', async () => {
        await blur.checkBlurValue('55');
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  demoAccountFileTest(
    qase([353], 'Change rotation (Design page in the right)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Rotate to 90 degrees and verify', async () => {
        await designPanelPage.changeRotationForLayer('90');
        await designPanelPage.checkRotationForLayer('90');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-90.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await demoAccountFileTest.step(
        'Rotate to 120 degrees and verify',
        async () => {
          await designPanelPage.changeRotationForLayer('120');
          await designPanelPage.checkRotationForLayer('120');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'ellipse-rotated-120.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step('Rotate to 45 degrees and verify', async () => {
        await designPanelPage.changeRotationForLayer('45');
        await designPanelPage.checkRotationForLayer('45');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-45.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await demoAccountFileTest.step(
        'Rotate to 360 degrees and verify',
        async () => {
          await designPanelPage.changeRotationForLayer('360');
          await designPanelPage.checkRotationForLayer('359');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'ellipse-rotated-359.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([369], 'Transform ellipse to Path'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Transform ellipse to path via right click',
        async () => {
          await mainPage.transformToPathViaRightClick();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify path component is visible on layers tab',
        async () => {
          await layersPanelPage.isPathComponentOnLayersTabVisible();
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([358], 'Lock and unlock ellipse (From rightclick and icons)'),
  async ({ page, mainPage }) => {
    const workspacePage = new WorkspacePage(page);
    const { layers } = workspacePage.leftSidebar;
    const { canvas, contextMenu } = workspacePage;
    // Default 100x100 ellipses are centered on the click, so they start at (x - 50, y - 50)
    const ellipse1 = { x: 200, y: 300 };
    const ellipse2 = { x: 500, y: 300 };
    // Where each one is dragged to: 100px right and down
    const ellipse1Target = { x: 300, y: 400 };
    const ellipse2Target = { x: 600, y: 400 };

    await demoAccountFileTest.step('Create two ellipses', async () => {
      // Wait for each ellipse, or on a slow run the next tool click cancels it
      for (const [index, { x, y }] of [ellipse1, ellipse2].entries()) {
        await mainPage.createDefaultEllipseByCoordinates(x, y);
        await layersPanelPage.isNumLayerNameVisible('Ellipse', index + 1);
      }
      // The newest layer is on top
      await layers.renameLayer('Ellipse', 'Ellipse 2');
      await layers.renameLayer('Ellipse', 'Ellipse 1');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step(
      'Lock Ellipse 1 from its Lock icon in the Layers panel: it cannot be moved',
      async () => {
        await layersPanelPage.selectLayerByExactName('Ellipse 1');
        await layers.toggleLayerLock('Ellipse 1');
        await layers.checkLayerLocked('Ellipse 1');
        await mainPage.clickViewportTwice();
        await canvas.dragShape(ellipse1, ellipse1Target);
        await mainPage.waitForChangeIsSaved();
        await workspacePage.checkLayerPositions({ 'Ellipse 1': { x: 150, y: 250 } });
        await mainPage.clickViewportTwice();
      },
    );

    await demoAccountFileTest.step(
      'Lock Ellipse 2 with a right-click on the canvas: it cannot be moved',
      async () => {
        await canvas.openContextMenuAt(ellipse2.x, ellipse2.y);
        await contextMenu.clickItem('Lock');
        await layers.checkLayerLocked('Ellipse 2');
        await canvas.dragShape(ellipse2, ellipse2Target);
        await mainPage.waitForChangeIsSaved();
        await workspacePage.checkLayerPositions({ 'Ellipse 2': { x: 450, y: 250 } });
        await mainPage.clickViewportTwice();
      },
    );

    await demoAccountFileTest.step(
      'Unlock Ellipse 1 with a right-click on the canvas: it can be moved',
      async () => {
        // A locked shape can't be picked on the canvas: select it from the layers first
        await layersPanelPage.selectLayerByExactName('Ellipse 1');
        await canvas.openContextMenuAt(ellipse1.x, ellipse1.y);
        await contextMenu.clickItem('Unlock');
        await layers.checkLayerLocked('Ellipse 1', false);
        await canvas.dragShape(ellipse1, ellipse1Target);
        await mainPage.waitForChangeIsSaved();
        await workspacePage.checkLayerPositions({ 'Ellipse 1': { x: 250, y: 350 } });
        await mainPage.clickViewportTwice();
      },
    );

    await demoAccountFileTest.step(
      'Unlock Ellipse 2 from its Unlock icon in the Layers panel: it can be moved',
      async () => {
        await layersPanelPage.selectLayerByExactName('Ellipse 2');
        await layers.toggleLayerLock('Ellipse 2', true);
        await layers.checkLayerLocked('Ellipse 2', false);
        await mainPage.clickViewportTwice();
        await canvas.dragShape(ellipse2, ellipse2Target);
        await mainPage.waitForChangeIsSaved();
        await workspacePage.checkLayerPositions({ 'Ellipse 2': { x: 550, y: 350 } });
      },
    );
  },
);

demoAccountFileTest(
  qase([342], 'Export ellipse with different sizes (PNG), Suffix is provided'),
  async ({ page, mainPage }) => {
    const { export: exportSection } = new WorkspacePage(page).rightSidebar.design;

    await demoAccountFileTest.step('Create an ellipse and select it', async () => {
      await mainPage.createDefaultEllipseByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerNameDisplayed('Ellipse');
    });

    await demoAccountFileTest.step(
      'Add two PNG exports: 0.5x with suffix "test5" and 1x with suffix "test1"',
      async () => {
        await exportSection.clickAddExportButton();
        await exportSection.setExportRow(0, { scale: '0.5x', suffix: 'test5' });
        await exportSection.clickAddExportButton();
        // A new export row is added at the top
        await exportSection.setExportRow(0, { scale: '1x', suffix: 'test1' });
        await mainPage.waitForChangeIsSaved();
        await exportSection.checkExportRowSettings(1, {
          scale: '0.5x',
          suffix: 'test5',
        });
      },
    );

    await demoAccountFileTest.step(
      'Export the element: a zip with both PNGs at their sizes is downloaded',
      async () => {
        const { download } = await exportSection.exportElement();
        await exportSection.checkExportedZip(download, [
          { name: 'Ellipsetest5.png', width: 50, height: 50 },
          { name: 'Ellipsetest1.png', width: 100, height: 100 },
        ]);
      },
    );
  },
);

demoAccountFileTest(
  qase([350], 'Export multiple ellipses'),
  async ({ page, mainPage }) => {
    const { export: exportSection } = new WorkspacePage(page).rightSidebar.design;

    await demoAccountFileTest.step('Create 4 ellipses and select them', async () => {
      for (const [index, x] of [200, 400, 600, 800].entries()) {
        await mainPage.createDefaultEllipseByCoordinates(x, 300);
        await layersPanelPage.isNumLayerNameVisible('Ellipse', index + 1);
      }
      await mainPage.waitForChangeIsSaved();
      await mainPage.pressSelectAllShortcut();
    });

    await demoAccountFileTest.step(
      'Add a 2x PNG export without suffix to the 4 ellipses',
      async () => {
        await exportSection.addExportWithFormat(ExportFormat.PNG);
        await exportSection.setExportRow(0, { scale: '2x' });
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Export the 4 elements from the "Export selection" dialog: a zip with 4 PNGs at 2x',
      async () => {
        const { download } = await exportSection.exportElementsFromDialog(4);
        await exportSection.checkExportedZip(download, [
          { name: 'Ellipse.png', width: 200, height: 200 },
          { name: 'Ellipse-2.png', width: 200, height: 200 },
          { name: 'Ellipse-3.png', width: 200, height: 200 },
          { name: 'Ellipse-4.png', width: 200, height: 200 },
        ]);
      },
    );
  },
);
