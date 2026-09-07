import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest.describe('PNG image', () => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.uploadImage('images/images.png');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainAccountFileTest(
    qase(
      [466, 468],
      'Copy/Paste and Cut/Paste image (from context menu and shortcut)',
    ),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        '466 Copy and Paste image (from context menu and shortcut)',
        async () => {
          await mainAccountFileTest.step(
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

          await mainAccountFileTest.step(
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
      await mainAccountFileTest.step(
        '468 Cut image (From rightclick and Shortcut Ctrl+X)',
        async () => {
          await mainAccountFileTest.step(
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
          await mainAccountFileTest.step(
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
});
