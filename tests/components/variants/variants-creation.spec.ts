import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(
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

demoAccountFileTest(
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

demoAccountFileTest(
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

demoAccountFileTest(
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

demoAccountFileTest(
  qase(
    [2395, 2400],
    'Create variants from two components on canvas and remove one by dragging it out',
  ),
  async ({ page, mainPage }) => {
    const workspacePage = new WorkspacePage(page);
    const first = { x: 200, y: 300 };
    const second = { x: 400, y: 300 };

    await demoAccountFileTest.step(
      'Create two rectangles and make each a main component',
      async () => {
        for (const [index, { x, y }] of [first, second].entries()) {
          await mainPage.createDefaultRectangleByCoordinates(x, y);
          // Ctrl+K right after drawing is sometimes lost (covered by PENPOT-1400)
          await workspacePage.canvas.openContextMenuAt(x, y);
          await workspacePage.contextMenu.clickItem('Create component');
          await mainPage.waitForChangeIsSaved();
          await workspacePage.leftSidebar.layers.checkMainComponentCount(index + 1);
        }
        await layersPanelPage.isNumLayerNameVisible('Rectangle', 2);
        await layersPanelPage.checkVariantLayerCount(0);
      },
    );

    await demoAccountFileTest.step(
      'The components have the default fill #B1B2B5',
      async () => {
        await layersPanelPage.selectLayerByExactName('Rectangle');
        await designPanelPage.isFillHexCodeSetComponent('#B1B2B5');
      },
    );

    await demoAccountFileTest.step(
      'Open the Assets tab, select both components and combine them as variants from the right-click menu',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await mainPage.pressSelectAllShortcut();
        await workspacePage.canvas.openContextMenuAt(second.x, second.y);
        await workspacePage.contextMenu.clickItem('Combine as variants');
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
        await layersPanelPage.openLayersTab();
        await layersPanelPage.checkVariantLayerCount(2);
      },
    );

    await demoAccountFileTest.step(
      'Drag the first variant out of the variants frame: it becomes a separate main component',
      async () => {
        await mainPage.dragAndDropComponentOutOfVariantContainerViaCanvas(
          'Value 1',
          'Rectangle',
        );
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.checkVariantLayerCount(1);
        await layersPanelPage.isLayerWithNameSelected('Rectangle / Value 1');
        await layersPanelPage.isMainComponentOnLayersTabVisibleWithName(
          'Rectangle / Value 1',
        );
      },
    );
  },
);
