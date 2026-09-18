import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(qase([3403], 'Create Arrow (Toolbar)'), async ({ mainPage }) => {
  await demoAccountFileTest.step(
    'Draw an arrow line via toolbar and verify layer created',
    async () => {
      await mainPage.createArrowByCoordinates(400, 400, 400, 600);
      await mainPage.isCreatedLayerVisible();
      await layersPanelPage.isLayerNameDisplayed('Path');
    },
  );

  await demoAccountFileTest.step(
    'Verify arrow size and default triangle end cap',
    async () => {
      await mainPage.clickOnDesignTab();
      await designPanelPage.checkSizeWidth('0.01');
      await designPanelPage.checkSizeHeight('200');
      await expect(designPanelPage.strokeCapStartDropdown).toHaveText('None');
      await expect(designPanelPage.strokeCapEndDropdown).toHaveText('Triangle');
      await expect(mainPage.viewport).toHaveScreenshot('arrow-line.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );
});
