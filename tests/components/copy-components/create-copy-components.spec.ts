import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(qase([1289], 'Duplicate component'), async ({ mainPage }) => {
  await demoAccountFileTest.step(
    'Create a main component from a rectangle via right click',
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
      await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName(
        'Rectangle',
        false,
      );
    },
  );

  await demoAccountFileTest.step(
    'Duplicate the main component via right click and verify a copy is created',
    async () => {
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVisibleLayersCount(2);
      await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
      await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Rectangle');
    },
  );
});
