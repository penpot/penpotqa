import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();
});

demoAccountFileTest.describe('PNG image', () => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.uploadImage('images/images.png');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase(
      [466, 481],
      'Copy/Paste and Cut/Paste image (from context menu and shortcut)',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        '466 Copy and Paste image (from context menu and shortcut)',
        async () => {
          await demoAccountFileTest.step(
            'Copy and paste image from context menu',
            async () => {
              await layersPanelPage.clickOnLayerOptionViaRightClickForLayer(
                'images',
                'Copy',
              );
              await layersPanelPage.pasteLayerViaRightClick();
              await mainPage.waitForChangeIsSaved();
              await layersPanelPage.isVisibleLayersCount(2);
            },
          );

          await demoAccountFileTest.step(
            'Copy and paste image from shortcut',
            async () => {
              await layersPanelPage.selectLayerByName('images');
              await layersPanelPage.pressCopyShortcut();
              await mainPage.clickViewportByCoordinates(800, 800);
              await layersPanelPage.pressPasteShortcut();
              await mainPage.waitForChangeIsSaved();
              await layersPanelPage.isVisibleLayersCount(3);
            },
          );
        },
      );
      await demoAccountFileTest.step(
        '481 Cut image (From rightclick and Shortcut Ctrl+X)',
        async () => {
          await demoAccountFileTest.step(
            'Cut and paste image from context menu',
            async () => {
              await layersPanelPage.clickOnLayerOptionViaRightClickForLayer(
                'images',
                'Cut',
                1,
              );
              await layersPanelPage.isVisibleLayersCount(2);
              await mainPage.clickViewportByCoordinates(800, 600);
              await layersPanelPage.pasteLayerViaRightClick();
              await mainPage.waitForChangeIsSaved();
              await layersPanelPage.isVisibleLayersCount(3);
            },
          );
          await demoAccountFileTest.step(
            'Cut & paste image by shortcuts (Ctrl+X / Ctrl+V)',
            async () => {
              await layersPanelPage.pressCutShortcut();
              await layersPanelPage.isVisibleLayersCount(2);
              await mainPage.clickViewportByCoordinates(800, 300);
              await layersPanelPage.pressPasteShortcut();
              await mainPage.waitForChangeIsSaved();
              await layersPanelPage.isVisibleLayersCount(3);
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([468], 'Click "Focus on" image from shortcut (F)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Import a second image', async () => {
        await mainPage.uploadImage('images/sample.jpeg');
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isVisibleLayersCount(2);
      });

      await demoAccountFileTest.step('Focus on the first image with F', async () => {
        await layersPanelPage.selectLayerByName('images');
        await mainPage.focusLayerViaShortcut();
        await layersPanelPage.isFocusModeOn();
        await layersPanelPage.isLayerPresentOnLayersTab('sample', false);
      });

      await demoAccountFileTest.step(
        'Exit focus mode from the Focus mode tag',
        async () => {
          await layersPanelPage.clickOnFocusModeLabel();
          await layersPanelPage.isFocusModeOff();
          await layersPanelPage.isLayerPresentOnLayersTab('sample', true);
        },
      );
    },
  );
});
