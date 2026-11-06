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
