import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

mainAccountFileTest(qase([3400], 'Create Line (Toolbar)'), async ({ mainPage }) => {
  await mainAccountFileTest.step(
    'Draw a line via toolbar and verify layer created',
    async () => {
      await mainPage.createLineByCoordinates(400, 400, 600, 600);
      await mainPage.isCreatedLayerVisible();
      await layersPanelPage.isLayerNameDisplayed('Path');
    },
  );

  await mainAccountFileTest.step(
    'Verify line size and default (no) stroke caps',
    async () => {
      await mainPage.clickOnDesignTab();
      await designPanelPage.checkSizeWidth('200');
      await designPanelPage.checkSizeHeight('200');
      await expect(designPanelPage.strokeCapStartDropdown).toHaveText('None');
      await expect(designPanelPage.strokeCapEndDropdown).toHaveText('None');
      await expect(mainPage.viewport).toHaveScreenshot('line.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );
});
