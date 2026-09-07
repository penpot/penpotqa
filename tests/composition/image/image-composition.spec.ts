import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest.describe('PNG image', () => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.uploadImage('images/images.png');
  });
});

mainAccountFileTest.describe('JPEG image', () => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.uploadImage('images/sample.jpeg');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainAccountFileTest(
    qase([1270], 'Change rotation (Design page in the right)'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Set rotation to 90 degrees and verify',
        async () => {
          await designPanelPage.changeRotationForLayer('90');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Rotation 90 should match snapshot',
          ).toHaveScreenshot('image-rotated-90.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainAccountFileTest.step(
        'Set rotation to 120 degrees and verify',
        async () => {
          await designPanelPage.changeRotationForLayer('120');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Rotation 120 should match snapshot',
          ).toHaveScreenshot('image-rotated-120.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainAccountFileTest.step(
        'Set rotation to 45 degrees and verify',
        async () => {
          await designPanelPage.changeRotationForLayer('45');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Rotation 45 should match snapshot',
          ).toHaveScreenshot('image-rotated-45.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainAccountFileTest.step(
        'Set rotation to 360 degrees and verify',
        async () => {
          await designPanelPage.changeRotationForLayer('360');
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Rotation 360 should match snapshot',
          ).toHaveScreenshot('image-rotated-359.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainAccountFileTest(
    qase(
      [474],
      'Flip Vertical and Flip Horizontal image (From right click and Shortcut Shift +V Shift + H)',
    ),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Flip image vertically via right click and verify',
        async () => {
          await mainPage.flipVerticalViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Flipped vertical should match snapshot',
          ).toHaveScreenshot('image-flipped-vertical.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainAccountFileTest.step(
        'Flip image horizontally via right click and verify',
        async () => {
          await mainPage.flipHorizontalViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Flipped vertical and horizontal should match snapshot',
          ).toHaveScreenshot('image-flipped-vertical-horizontal.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainAccountFileTest.step(
        'Flip image vertically via shortcut and verify',
        async () => {
          await mainPage.flipVerticalViaShortcut();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Flipped horizontal should match snapshot',
          ).toHaveScreenshot('image-flipped-horizontal.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainAccountFileTest.step(
        'Flip image horizontally via shortcut and verify',
        async () => {
          await mainPage.flipHorizontalViaShortcut();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Non-flipped JPEG should match snapshot',
          ).toHaveScreenshot('image-non-flipped-jpeg.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});
