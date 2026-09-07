import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest(
    qase([483], 'Create curve line (Toolbar)'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Draw curve on canvas', async () => {
        await mainPage.clickCreateCurveButton();
        await mainPage.drawCurve(900, 300, 600, 200);
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step('Verify curve layer is created', async () => {
        await mainPage.isCreatedLayerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('curve.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );
});
