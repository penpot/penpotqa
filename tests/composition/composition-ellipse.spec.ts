import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
});

mainAccountFileTest(
  qase([328], 'Create Ellipse (Shortcut E)'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Press E shortcut and verify ellipse tool is active',
      async () => {
        await mainPage.pressKeyboardShortcut('E');
      },
    );

    await mainAccountFileTest.step(
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

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    mainAccountFileTest.slow();
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainAccountFileTest(
    qase([327], 'Create Ellipse (Toolbar)'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Verify ellipse layer is created', async () => {
        await mainPage.isCreatedLayerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainAccountFileTest(
    qase([334], 'Add, hide, unhide and delete Blur to ellipse'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Set fill color and add blur', async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex('#304d6a');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickAddBlurButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
      });

      await mainAccountFileTest.step('Verify blur is applied', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'ellipse-blur-default.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainAccountFileTest.step('Hide blur and verify', async () => {
        await designPanelPage.hideBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-hide.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainAccountFileTest.step('Unhide blur and verify', async () => {
        await designPanelPage.unhideBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-unhide.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainAccountFileTest.step('Remove blur and verify', async () => {
        await designPanelPage.removeBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-remove.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainAccountFileTest(
    qase([335], 'Add and edit Blur to ellipse'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Add blur and change value', async () => {
        await designPanelPage.clickAddBlurButton();
        await designPanelPage.changeValueForBlur('55');
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
      });

      await mainAccountFileTest.step('Verify blur appearance', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainAccountFileTest(
    qase([353], 'Change rotation (Design page in the right)'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Rotate to 90 degrees and verify', async () => {
        await designPanelPage.changeRotationForLayer('90');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-90.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainAccountFileTest.step(
        'Rotate to 120 degrees and verify',
        async () => {
          await designPanelPage.changeRotationForLayer('120');
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

      await mainAccountFileTest.step('Rotate to 45 degrees and verify', async () => {
        await designPanelPage.changeRotationForLayer('45');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-45.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainAccountFileTest.step(
        'Rotate to 360 degrees and verify',
        async () => {
          await designPanelPage.changeRotationForLayer('360');
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

  mainAccountFileTest(
    qase([369], 'Transform ellipse to Path'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Transform ellipse to path via right click',
        async () => {
          await mainPage.transformToPathViaRightClick();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        'Verify path component is visible on layers tab',
        async () => {
          await layersPanelPage.isPathComponentOnLayersTabVisible();
        },
      );
    },
  );
});
