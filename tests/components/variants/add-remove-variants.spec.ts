import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';

let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();

  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await layersPanelPage.renameLayerViaRightClick('Rectangle', 'Rectangle1');

  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createVariantViaRightClick();
  await mainPage.waitForChangeIsSaved();
});

mainAccountFileTest(
  qase([2398], 'Add Variant to a component on the canvas'),
  async ({ mainPage }) => {
    await mainPage.clickViewportTwice();
    await mainPage.createDefaultRectangleByCoordinates(600, 300);
    await layersPanelPage.renameLayerViaRightClick('Rectangle', 'Rectangle2');

    await mainPage.createComponentViaRightClickFromLayerByName('Rectangle2');
    await mainPage.waitForChangeIsSaved();

    await mainPage.dragAndDropComponentToVariantContainerViaCanvas(
      'Rectangle2',
      'Rectangle1',
    );

    await layersPanelPage.checkVariantLayerCount(3);
  },
);

mainAccountFileTest(
  qase([2399], 'Add Variant to a component from the Layers tab'),
  async ({ mainPage }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 500);
    await layersPanelPage.renameLayerViaRightClick('Rectangle', 'Rectangle2');
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.dragAndDropComponentToVariants('Rectangle2');
    await layersPanelPage.checkVariantLayerCount(3);
  },
);

mainAccountFileTest(
  qase([2404], 'Delete variant from the component using the context menu'),
  async ({ mainPage }) => {
    await mainPage.deleteLayerViaRightClickByName('Value 2');
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.checkVariantLayerCount(1);
  },
);

mainAccountFileTest(
  qase([2407], 'Restoring a deleted variant from the child component'),
  async ({ mainPage }) => {
    await layersPanelPage.selectLayerByName('Value 1');
    await mainPage.copyElementViaAltDragAndDrop(200, 500);

    await layersPanelPage.selectLayerByName('Value 1');
    await mainPage.deleteLayerViaRightClickByName('Value 1');
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.clickCopyComponentOnLayersTab();
    await layersPanelPage.restoreVariantViaRightClick();

    await layersPanelPage.checkVariantLayerCount(2);
    await layersPanelPage.isLayerWithNameSelected('Value 1');
  },
);

mainAccountFileTest(
  qase(
    [2409],
    'Add Variants to a component by cutting and pasting the main component',
  ),
  async ({ mainPage }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 500);
    await mainPage.createComponentViaRightClick();
    await mainPage.cutLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickOnVariantsTitle('Rectangle');
    await mainPage.pressPasteShortcut();
    await layersPanelPage.checkVariantLayerCount(3);
  },
);

mainAccountFileTest(
  qase(
    [2410],
    'Remove variant from a group cutting and pasting it outside variant component',
  ),
  async ({ mainPage }) => {
    await layersPanelPage.selectLayerByName('Value 2');
    await mainPage.pressCutShortcut();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.pressPasteShortcut();
    await layersPanelPage.checkVariantLayerCount(1);
    await layersPanelPage.isLayerWithNameSelected('Rectangle1 / Value 2');
  },
);

mainAccountFileTest(
  qase([2413], 'Remove the last component from the variants component'),
  async ({ mainPage }) => {
    await layersPanelPage.selectLayerByName('Value 1');
    await mainPage.deleteLayerViaRightClickByName('Value 1');
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.selectLayerByName('Value 2');
    await mainPage.dragAndDropComponentOutOfVariantContainerViaCanvas(
      'Value 2',
      'Rectangle1',
    );

    await layersPanelPage.isVariantLayerVisible(false);
    await layersPanelPage.isLayerWithNameSelected('Rectangle1 / Value 2');
  },
);

mainAccountFileTest(
  qase([2419], 'Changing the component frame in the design panel'),
  async ({ mainPage }) => {
    await mainPage.pressHideShowRulersShortcut();
    await mainPage.clickOnVariantsTitle('Rectangle1');
    await layersPanelPage.isLayerWithNameSelected('Rectangle1');
    await designPanelPage.isFlexElementWidth100BtnVisible(false);
    await designPanelPage.clickOnFlexElementFixWidthBtn();
    await designPanelPage.clickOnFlexElementFixHeightBtn();
    await designPanelPage.changeHeightAndWidthForLayer('500', '500');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkSizeWidth('500');
    await designPanelPage.checkSizeHeight('500');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('variants-500x500.png', {
      mask: mainPage.maskViewport(),
    });
  },
);
