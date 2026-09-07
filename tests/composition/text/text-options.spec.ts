import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultTextLayer();
  });

  mainAccountFileTest(
    qase([394], 'Click "Focus on" text from right click'),
    async ({ mainPage }) => {
      const firstText = 'Hello world!';
      const secondText = 'Second text';

      await mainPage.createTextLayerByCoordinates(100, 200, secondText);
      await mainPage.focusLayerViaRightClickOnLayersTab(firstText);
      await expect(mainPage.viewport).toHaveScreenshot('first-text-focused.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.clickFocusModeTag();
      await mainPage.focusLayerViaRightClickOnLayersTab(secondText);
      await expect(mainPage.viewport).toHaveScreenshot('second-text-focused.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.clickFocusModeTag();
      await expect(mainPage.viewport).toHaveScreenshot(
        'first-and-second-text-not-focused.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );
});
