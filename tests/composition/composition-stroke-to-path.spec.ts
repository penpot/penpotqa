import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { expect } from 'playwright/test';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

mainAccountFileTest(
  qase([3742], 'Stroke to path on a basic rectangle with a single solid stroke'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step('Create a rectangle', async () => {
      await mainPage.pressKeyboardShortcut('R');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
    });

    await mainAccountFileTest.step('Add a stroke', async () => {
      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.setStrokeWidth('4');
    });

    await mainAccountFileTest.step(
      'Right-click the shape to open the contextual menu and click Stroke to path',
      async () => {
        await layersPanelPage.clickOnLayerOptionViaRightClickForLayer(
          'Rectangle',
          'Stroke to path',
        );
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'stroke-to-path-rectangle-added.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);
