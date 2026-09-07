import { mainAccountFileTest } from 'fixtures';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { expect } from 'playwright/test';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

mainAccountFileTest(
  qase([2971], 'Live preview updates when adjusting both Dash and Gap sequentially'),
  async ({ mainPage }) => {
    const dashValue = '5';
    const gapValue = '2';

    await mainAccountFileTest.step(
      'Create a Rectangle and add stroke and verify default state',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await designPanelPage.clickAddStrokeButton();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step('Apply outside dashed stroke', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings(
        '#F5358F',
        '80',
        '5',
        'Outside',
        'Dashed',
      );
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step(
      `Set dash value ${dashValue} and assert changes`,
      async () => {
        await designPanelPage.setStrokeDashValue(dashValue);
        await designPanelPage.hasStrokeDashInputValue(dashValue);
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.selectLayerByName('Rectangle');
        await mainPage.focusLayerViaShortcut();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          `rectangle-stroke-outside-dashed-${dashValue}.png`,
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );

    await mainAccountFileTest.step(
      `Set gap value ${gapValue} and assert changes`,
      async () => {
        await designPanelPage.setStrokeGapValue(gapValue);
        await designPanelPage.hasStrokeGapInputValue(gapValue);
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.selectLayerByName('Rectangle');
        await mainPage.focusLayerViaShortcut();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          `rectangle-stroke-outside-dashed-${dashValue}-gap-${gapValue}.png`,
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );
  },
);
