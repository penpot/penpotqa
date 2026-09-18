import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let assetsPanelPage: AssetsPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(
  qase([1456], 'Delete component Assets tab'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Create rectangle component', async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step('Delete component from assets tab', async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.deleteFileLibraryComponents();
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step(
      'Verify component is deleted from assets tab',
      async () => {
        await assetsPanelPage.isComponentNotVisibleInAssetsTab();
        await assetsPanelPage.selectTypeFromAllAssetsDropdown('Components');
        await expect(
          assetsPanelPage.assetsTitleText,
          'Assets title should match screenshot after component deletion',
        ).toHaveScreenshot('assets-component-delete.png');
      },
    );
  },
);

demoAccountFileTest(
  qase([1345], 'Restore main component from context menu'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Create rectangle component and duplicate it',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Delete main component from assets tab',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.deleteFileLibraryComponents();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Restore main component via right-click on layers panel',
      async () => {
        await layersPanelPage.openLayersTab();
        await layersPanelPage.restoreMainComponentViaRightClick();
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Verify restored component is visible in assets tab',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.isComponentVisibleInAssetsTab('Rectangle');
      },
    );
  },
);
