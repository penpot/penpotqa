import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest(
  qase([2440], 'Create variants by design panel'),
  async ({ mainPage }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnCreateVariantOption();
    await mainPage.waitForChangeIsSaved();

    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
  },
);

mainAccountFileTest(
  qase([2396], 'Creating variants from a component group'),
  async ({ mainPage }) => {
    await mainPage.createDefaultRectangleByCoordinates(100, 300);
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#0ea27a');
    await mainPage.clickViewportOnce();
    await mainPage.clickOnLayerOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet('#0ea27a');
    await mainPage.createComponentViaRightClick();
    await mainPage.createDefaultRectangleByCoordinates(300, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.createGroupViaSelectAssets('Components', 'Test Group');
    await assetsPanelPage.combineAsVariantsGroup();
    await assetsPanelPage.expandComponentsGroupOnAssetsTab();
    await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
  },
);

mainAccountFileTest(
  qase([2425], 'Create variants by copying an existing component'),
  async ({ mainPage }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createVariantViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnVariantsTitle('Rectangle');
    await mainPage.copyLayerViaRightClick();
    await mainPage.pressPasteShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await expect(mainPage.viewport).toHaveScreenshot('copy-paste-variants.png', {
      mask: mainPage.maskViewport(),
    });
  },
);

mainAccountFileTest(
  qase([2570], 'Create a variant by "+" button on Viewport (Component selected)'),
  async ({ mainPage }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createVariantViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnVariantsTitle('Rectangle');
    await mainPage.clickOnAddVariantViewportButton();
    await layersPanelPage.checkVariantLayerCount(3);
  },
);
