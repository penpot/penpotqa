import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from 'playwright/test';

let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultRectangleByCoordinates(100, 100);
  await layersPanelPage.isLayerNameDisplayed('Rectangle');
  await mainPage.createDefaultEllipseByCoordinates(300, 100);
  await layersPanelPage.isLayerNameDisplayed('Ellipse');
});

mainAccountFileTest(
  qase([2940], 'Paste to Replace on single selected shape'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step('Select Rectangle and copy', async () => {
      await layersPanelPage.selectLayerByName('Rectangle');
      await mainPage.copyLayerViaRightClick();
    });

    await mainAccountFileTest.step(
      'Select Ellipse and paste to replace',
      async () => {
        await layersPanelPage.selectLayerByName('Ellipse');
        await mainPage.pasteAndReplaceViaShortcut();
        await expect(
          mainPage.viewport,
          'Ellipse should be replaced by Rectangle after Paste to Replace action',
        ).toHaveScreenshot('paste-to-replace-rectangle.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);
