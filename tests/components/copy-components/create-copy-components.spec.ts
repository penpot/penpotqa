import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let layersPanelPage: LayersPanelPage;
let pagesPanelPage: PagesPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  pagesPanelPage = new PagesPanelPage(page);
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

demoAccountFileTest(
  qase([1537], 'Duplicate a page containing a main component'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Create a main component with Ctrl+K',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createComponentViaShortcut();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
      },
    );

    await demoAccountFileTest.step(
      'Duplicate the page via right click',
      async () => {
        await pagesPanelPage.duplicatePageViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await pagesPanelPage.isSecondPageNameDisplayed('Page 1 (copy)');
      },
    );

    await demoAccountFileTest.step(
      'Verify the duplicated page contains a copy of the component',
      async () => {
        await pagesPanelPage.clickPageByName('Page 1 (copy)');
        await layersPanelPage.isVisibleLayersCount(1);
        await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Rectangle');
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName(
          'Rectangle',
          false,
        );
      },
    );
  },
);
