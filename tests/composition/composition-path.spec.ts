import { mainAccountFileTest } from 'fixtures';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { expect } from '@playwright/test';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let colorPalettePage: ColorPalettePage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

mainAccountFileTest(
  qase([487], 'Create Path (Toolbar) - closed'),
  async ({ mainPage }) => {
    await mainPage.createDefaultClosedPath();
    await mainPage.isCreatedLayerVisible();
    await layersPanelPage.selectLayerByName('Path');
    await expect(mainPage.viewport).toHaveScreenshot('path-closed.png', {
      mask: mainPage.maskViewport(),
    });
  },
);

mainAccountFileTest(
  qase([489], 'Create Path (Toolbar) - opened'),
  async ({ mainPage }) => {
    await mainPage.createDefaultOpenPath();
    await mainPage.isCreatedLayerVisible();
    await layersPanelPage.selectLayerByName('Path');
    await expect(mainPage.viewport).toHaveScreenshot('path-opened.png', {
      mask: mainPage.maskViewport(),
    });
  },
);

mainAccountFileTest(
  qase([501], 'Add edit and remove Stroke Caps to Path (arrow, marker)'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step('Create and select Path layer', async () => {
      await mainPage.createDefaultOpenPath();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.selectLayerByName('Path');
    });

    await mainAccountFileTest.step(
      'Add Arrow (first) and Diamond (second) caps',
      async () => {
        await designPanelPage.changeCap('Arrow', 'first');
        await designPanelPage.changeCap('Diamond', 'second');
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.selectLayerByName('Path');
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-opened-with-arrow-and-diamond.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );

    await mainAccountFileTest.step(
      'Switch caps and verify Diamond (first) and Arrow (second)',
      async () => {
        await designPanelPage.clickSwitchCapButton();
        await mainPage.clickViewportOnce();
        await layersPanelPage.selectLayerByName('Path');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-opened-with-diamond-and-arrow.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );

    await mainAccountFileTest.step(
      'Remove caps and verify None on both',
      async () => {
        await designPanelPage.changeCap('None', 'first');
        await designPanelPage.changeCap('None', 'second');
        await mainPage.clickViewportOnce();
        await layersPanelPage.selectLayerByName('Path');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-opened-with-none.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );
  },
);

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultClosedPath();
  });

  mainAccountFileTest(
    qase([512], 'Change rotation (Design page in the right)'),
    async ({ mainPage }) => {
      await designPanelPage.changeRotationForLayer('90');
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCornerHandleVisible();
      await expect(mainPage.viewport).toHaveScreenshot('path-rotated-90.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.changeRotationForLayer('120');
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCornerHandleVisible();
      await expect(mainPage.viewport).toHaveScreenshot('path-rotated-120.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.changeRotationForLayer('45');
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCornerHandleVisible();
      await expect(mainPage.viewport).toHaveScreenshot('path-rotated-45.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.changeRotationForLayer('360');
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCornerHandleVisible();
      await expect(mainPage.viewport).toHaveScreenshot('path-rotated-359.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );

  mainAccountFileTest(
    qase([513], 'Delete Path (From right click)'),
    async ({ mainPage }) => {
      await mainPage.isCreatedLayerVisible();
      await mainPage.deleteLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible(false);
    },
  );

  mainAccountFileTest(
    qase([2543], 'Delete Path (From Keyboard)'),
    async ({ mainPage }) => {
      await mainPage.isCreatedLayerVisible();
      await mainPage.deleteLayerViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible(false);
    },
  );

  mainAccountFileTest(
    qase(
      [525],
      'Flip Vertical and Flip Horizontal path (From right click and Shortcut Shift +V Shift + H)',
    ),
    async ({ mainPage }) => {
      await mainPage.flipVerticalViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-flipped-vertical.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.flipHorizontalViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-flipped-vertical-horizontal.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.flipVerticalViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-flipped-horizontal.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.flipHorizontalViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-non-flipped-jpeg.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );

  mainAccountFileTest(qase([537], 'Selection to board'), async ({ mainPage }) => {
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-to-board.png', {
      mask: mainPage.maskViewport(),
    });
  });
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultOpenPath();
  });
});
