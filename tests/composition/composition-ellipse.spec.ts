import { ExportFormat } from '@pages/components/export-section-component';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import { BlurSectionComponent } from '@pages/workspace/right-sidebar/design-tab/blur-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let blur: BlurSectionComponent;
let layers: LayersPanelComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  const workspacePage = new WorkspacePage(page);
  blur = workspacePage.rightSidebar.design.blur;
  layers = workspacePage.leftSidebar.layers;
});

demoAccountFileTest(
  qase([328], 'Create Ellipse (Shortcut E)'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Press "E" keyboard button', async () => {
      await mainPage.pressKeyboardShortcut('E');
      await mainPage.isShapeToolActive('circle');
    });

    await demoAccountFileTest.step('Click on the canvas', async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await layersPanelPage.isLayerNameDisplayed('Ellipse');
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
    });
  },
);

demoAccountFileTest(
  qase([327], 'Create Ellipse (Toolbar)'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Click Ellipse icon in the toolbar', async () => {
      await mainPage.clickCreateEllipseButton();
      await mainPage.isShapeToolActive('circle');
    });

    await demoAccountFileTest.step('Click on the canvas', async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await layersPanelPage.isLayerNameDisplayed('Ellipse');
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
      await expect(mainPage.viewport).toHaveScreenshot('ellipse.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    demoAccountFileTest.slow();
    await demoAccountFileTest.step('Create an ellipse', async () => {
      await mainPage.clickCreateEllipseButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible('Ellipse');
    });
  });

  demoAccountFileTest(
    qase([334], 'Add, hide, unhide and delete Blur to ellipse'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Select ellipse', async () => {
        await layers.selectLayer('Ellipse');
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step(
        'Click "+" button next to "Blur effects"',
        async () => {
          await blur.addBlur();
          await mainPage.waitForChangeIsSaved();
          await blur.checkBlurAdded();
          await blur.checkBlurHidden(false);
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'ellipse-blur-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Click "Eye" icon in "Blur effects" section',
        async () => {
          await blur.toggleBlur();
          await mainPage.waitForChangeIsSaved();
          await blur.checkBlurHidden();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-hide.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await demoAccountFileTest.step(
        'Click "Eye" icon in "Blur effects" section',
        async () => {
          await blur.toggleBlur();
          await mainPage.waitForChangeIsSaved();
          await blur.checkBlurHidden(false);
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'ellipse-blur-unhide.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Click "-" icon in "Blur effects" section',
        async () => {
          await blur.removeBlur();
          await mainPage.waitForChangeIsSaved();
          await blur.checkBlurAdded(false);
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'ellipse-blur-remove.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([335], 'Add and edit Blur to ellipse'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Select ellipse', async () => {
        await layers.selectLayer('Ellipse');
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step(
        'Click "+" button next to "Blur effects"',
        async () => {
          await blur.addBlur();
          await mainPage.waitForChangeIsSaved();
          await blur.checkBlurAdded();
        },
      );

      await demoAccountFileTest.step(
        'Change value (px) in "Blur effects" section',
        async () => {
          await blur.changeBlurValue('55');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await blur.checkBlurValue('55');
          await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([353], 'Change rotation (Design page in the right)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Select ellipse', async () => {
        await layers.selectLayer('Ellipse');
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step(
        'Enter 90 to "Rotation dg" in the Design tab',
        async () => {
          await designPanelPage.changeRotationForLayer('90');
          await designPanelPage.checkRotationForLayer('90');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'ellipse-rotated-90.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Enter 120 to "Rotation dg" in the Design tab',
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

      await demoAccountFileTest.step(
        'Enter 45 to "Rotation dg" in the Design tab',
        async () => {
          await designPanelPage.changeRotationForLayer('45');
          await designPanelPage.checkRotationForLayer('45');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'ellipse-rotated-45.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Enter 360 to "Rotation dg" in the Design tab',
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
        'Click RMB on ellipse - click "Flatten" menu item',
        async () => {
          await mainPage.transformToPathViaRightClick();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isPathComponentOnLayersTabVisible();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([342], 'Export ellipse with different sizes (PNG), Suffix is provided'),
    async ({ page, mainPage }) => {
      const { export: exportSection } = new WorkspacePage(page).rightSidebar.design;

      await demoAccountFileTest.step('Select ellipse', async () => {
        await layers.selectLayer('Ellipse');
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step(
        'Click "+" button in "Export" section on "Design" panel (on the right)',
        async () => {
          await exportSection.clickAddExportButton();
          await exportSection.checkExportRowCount(1);
        },
      );

      await demoAccountFileTest.step(
        'From custom size drop down: Select size: "0.5x", Enter Suffix: "test5"',
        async () => {
          await exportSection.setExportRow(0, { scale: '0.5x', suffix: 'test5' });
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Click "+" button in "Export" section on "Design" panel (on the right)',
        async () => {
          await exportSection.clickAddExportButton();
          await exportSection.checkExportRowCount(2);
        },
      );

      await demoAccountFileTest.step(
        'In the new export row, which is added at the top of the list, from custom size drop down: Select size: "1x", Enter Suffix: "test1"',
        async () => {
          await exportSection.setExportRow(0, { scale: '1x', suffix: 'test1' });
          await mainPage.waitForChangeIsSaved();
          await exportSection.checkExportRowSettings(1, {
            scale: '0.5x',
            suffix: 'test5',
          });
        },
      );

      await demoAccountFileTest.step(
        'From Design > Export section, click on "Export 1 element" button',
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

    for (const [index, { x, y }] of [ellipse1, ellipse2].entries()) {
      await demoAccountFileTest.step('Create an ellipse', async () => {
        // Wait for each ellipse, or on a slow run the next tool click cancels it
        await mainPage.createDefaultEllipseByCoordinates(x, y);
        await layersPanelPage.isNumLayerNameVisible('Ellipse', 1);
        // Name it, to tell them apart: ellipse 1 is renamed before ellipse 2 exists
        await layers.renameLayer('Ellipse', `Ellipse ${index + 1}`);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerRowIsVisible(`Ellipse ${index + 1}`);
      });
    }

    await demoAccountFileTest.step(
      'From Layers panel (on the left): 1. Select Ellipse 1 from the list 2. At the Ellipse 1 level, click on Lock icon on the right 3. Try to move the Ellipse 1',
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
      'From the Ellipse 2 ellipse in the canvas: 1. Click with the RMB on the ellipse 2. Select "Lock" menu item 3. Try to move the ellipse',
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
      'From Layers panel (on the left), select Ellipse 1 (a locked shape can\'t be selected on the canvas). Then, in the canvas: 1. Click with the RMB on the ellipse 2. Select "Unlock" menu item 3. Try to move the ellipse',
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
      'From Layers panel (on the left): 1. Select Ellipse 2 from the list 2. At the Ellipse 2 level, click on Unlock icon on the right 3. Try to move the Ellipse 2',
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
  qase([350], 'Export multiple ellipses'),
  async ({ page, mainPage }) => {
    const { export: exportSection } = new WorkspacePage(page).rightSidebar.design;
    const { layers } = new WorkspacePage(page).leftSidebar;

    for (const [index, x] of [200, 400, 600, 800].entries()) {
      await demoAccountFileTest.step('Create an ellipse', async () => {
        // Wait for each ellipse, or on a slow run the next tool click cancels it
        await mainPage.createDefaultEllipseByCoordinates(x, 300);
        await layersPanelPage.isNumLayerNameVisible('Ellipse', index + 1);
      });
    }

    await demoAccountFileTest.step(
      'Select 4 Ellipses (by holding SHIFT keyboard button)',
      async () => {
        await mainPage.waitForChangeIsSaved();
        await layers.shiftSelectLayersNamed('Ellipse');
        await layers.checkSelectedLayersCount(4);
      },
    );

    await demoAccountFileTest.step(
      'Click "+" button in "Export" section on "Design" panel (on the right)',
      async () => {
        await exportSection.clickAddExportButton();
        await exportSection.checkExportRowCount(1);
      },
    );

    await demoAccountFileTest.step(
      'From custom size drop down: Select size: "2x", Leave Suffix empty',
      async () => {
        await exportSection.setExportRow(0, { scale: '2x' });
        await mainPage.waitForChangeIsSaved();
        await exportSection.checkExportRowSettings(0, { scale: '2x', suffix: '' });
      },
    );

    await demoAccountFileTest.step(
      'From Design > Export Selection section, click on "Export 4 elements" button',
      async () => {
        await exportSection.openExportSelectionDialog(4);
        await exportSection.exportModal.checkExportSelectionContent(4);
      },
    );

    await demoAccountFileTest.step(
      'From Export Selection modal, click on "Export" button',
      async () => {
        const { download } = await exportSection.exportFromOpenDialog();
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
