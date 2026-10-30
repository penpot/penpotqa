import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { qase } from 'playwright-qase-reporter/playwright';

const FIGURE_FILE = 'documents/figure.penpot';
const SWAP_FILE = 'documents/swap.penpot';
const BULK_LESS_HAPPY_FILE = 'documents/bulk-less-happy.penpot';

const sampleData = new SampleData();

let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.use({ penpotFile: FIGURE_FILE });

  demoAccountFileTest(
    qase(
      [2441],
      'Component groups are passed to Property when creating a component with variants (several groups)',
    ),
    async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.combineAsVariantsGroup();
      await assetsPanelPage.isVariantsAddedToFileLibraryComponents();

      await layersPanelPage.openLayersTab();
      await layersPanelPage.doubleClickLayerOnLayersTab('Rectangle, Blue');
      await layersPanelPage.checkLayerNameInputValue(
        'Property 1=Rectangle, Property 2=Blue',
      );
      await designPanelPage.checkVariantPropertyValue('Property 1', 'Rectangle');
      await designPanelPage.checkVariantPropertyValue('Property 2', 'Blue');
    },
  );

  demoAccountFileTest(
    qase([2444], 'Changing Property for Child Components'),
    async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.combineAsVariantsGroup();
      await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
      await layersPanelPage.openLayersTab();

      await layersPanelPage.selectLayerByName('Ellipse, Green');
      await layersPanelPage.copyElementViaAltDragAndDrop(100, 100);
      await designPanelPage.changeVariantPropertyValue('Property 1', 'Arrow');
      await designPanelPage.changeVariantPropertyValue('Property 2', 'Blue');
      await layersPanelPage.copyElementViaAltDragAndDrop(100, 300);
      await designPanelPage.waitForChangeIsSaved();

      await layersPanelPage.clickFirstCopyComponentOnLayersTab();
      await designPanelPage.changeVariantPropertyValue('Property 1', 'Ellipse');
      await designPanelPage.changeVariantPropertyValue('Property 2', 'Green');
      await designPanelPage.checkCopyVariantPropertyValue('Property 1', 'Ellipse');
      await designPanelPage.checkCopyVariantPropertyValue('Property 2', 'Green');

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.checkCopyVariantPropertyValue('Property 1', 'Arrow');
      await designPanelPage.checkCopyVariantPropertyValue('Property 2', 'Blue');

      await layersPanelPage.clickFirstCopyComponentOnLayersTab();
      await designPanelPage.checkCopyVariantPropertyValue('Property 2', 'Green');
      await designPanelPage.changeVariantPropertyValue('Property 2', 'Yellow');
      await designPanelPage.checkCopyVariantPropertyValue('Property 2', 'Yellow');

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.checkCopyVariantPropertyValue('Property 2', 'Blue');
    },
  );

  demoAccountFileTest.describe(() => {
    demoAccountFileTest.beforeEach(async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.combineAsVariantsGroup();
      await assetsPanelPage.waitForChangeIsSaved();
      await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
      await layersPanelPage.openLayersTab();
    });

    demoAccountFileTest(qase([2450], 'Adding New Properties'), async () => {
      await layersPanelPage.selectLayerByName('Ellipse, Green');
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.clickOnAddNewPropertyOption();
      await assetsPanelPage.waitForChangeIsSaved();
      await layersPanelPage.selectLayerByName('Arrow, Blue, Value 1');
      await designPanelPage.checkVariantPropertyValue('Property 3', 'Value 1');

      await layersPanelPage.doubleClickLayerOnLayersTab('Arrow, Blue, Value 1');
      await layersPanelPage.typeNameCreatedLayerAndEnter(
        'Property 1=Rectangle, Property 2=Blue, Property 3=Value 1, Test=TestValue',
      );
      await assetsPanelPage.waitForChangeIsSaved();
      await designPanelPage.checkVariantPropertyValue('Test', 'TestValue');

      await layersPanelPage.selectLayerByName('Ellipse, Green');
      await designPanelPage.enterVariantPropertyValue('Test', 'TestValue2');
      await assetsPanelPage.waitForChangeIsSaved();
      await designPanelPage.checkVariantPropertyValue('Test', 'TestValue2');
      await layersPanelPage.isLayerWithNameSelected(
        'Ellipse, Green, Value 1, TestValue2',
      );
    });

    demoAccountFileTest(qase([2452], 'Editing a Property Value'), async () => {
      await layersPanelPage.selectLayerByName('Ellipse, Yellow');
      await designPanelPage.enterVariantPropertyValue('Property 1', 'Test');
      await layersPanelPage.doubleClickLayerOnLayersTab('Test, Yellow');
      await layersPanelPage.checkLayerNameInputValue(
        'Property 1=Test, Property 2=Yellow',
      );
      await layersPanelPage.typeNameCreatedLayerAndEnter(
        'Property 1=Test, Property 2=Test2',
      );
      await designPanelPage.checkVariantPropertyValue('Property 2', 'Test2');
    });

    demoAccountFileTest(qase([2453], 'Delete Property'), async () => {
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.clickOnAddNewPropertyOption();
      await designPanelPage.clickOnEnter();
      await designPanelPage.waitForChangeIsSaved();

      await designPanelPage.deleteVariantProperty('Property 3');
      await designPanelPage.isMainComponentPropertyVisible('Property 3', false);
      await designPanelPage.isVariantWarningVisible(false);

      await designPanelPage.deleteVariantProperty('Property 2');
      await designPanelPage.isMainComponentPropertyVisible('Property 2', false);
      await designPanelPage.checkVariantWarning(
        'Some variants have identical properties and values',
      );
    });
  });
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.use({ penpotFile: SWAP_FILE });

  demoAccountFileTest(qase([2443], 'SWAP panel with variants'), async () => {
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.clickOnSwapComponentButton();
    await expect(designPanelPage.swapComponentTab).toHaveScreenshot(
      'swap-component-list.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
    await designPanelPage.clickOnSwapGridViewButton();
    await expect(designPanelPage.swapComponentTab).toHaveScreenshot(
      'swap-component-grid.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.use({ penpotFile: BULK_LESS_HAPPY_FILE });

  demoAccountFileTest(qase([2447], 'Property recovery'), async () => {
    const variantLayerName = 'primary, text, default';
    const invalidVariantName = 'Invalid name';

    await demoAccountFileTest.step(
      'Combine the "Form" components as variants',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.combineAsVariantsGroup();
        await layersPanelPage.openLayersTab();
      },
    );

    await demoAccountFileTest.step(
      `Delete the name of "${variantLayerName}"`,
      async () => {
        await layersPanelPage.selectLayerByName(variantLayerName);
        await layersPanelPage.doubleClickLayerOnLayersTab(variantLayerName);
        await layersPanelPage.typeNameCreatedLayerAndEnter('');

        await designPanelPage.checkVariantPropertyValue('Property 1', 'primary');
        await designPanelPage.checkVariantPropertyValue('Property 2', 'text');
        await designPanelPage.checkVariantPropertyValue('Property 3', 'default');
        await designPanelPage.isVariantWarningVisible(false);
      },
    );

    await demoAccountFileTest.step(
      `Rename the variant to "${invalidVariantName}"`,
      async () => {
        await layersPanelPage.doubleClickLayerOnLayersTab(variantLayerName);
        await layersPanelPage.typeNameCreatedLayerAndEnter(invalidVariantName);
        await mainPage.waitForChangeIsSaved();

        await designPanelPage.checkVariantPropertyValue('Property 1', '');
        await designPanelPage.checkVariantPropertyValue('Property 2', '');
        await designPanelPage.checkVariantPropertyValue('Property 3', '');
        await designPanelPage.checkVariantPropertyValue('Property 4', '');
        await designPanelPage.checkVariantWarning(
          'This variant has an invalid name. Try using the following structure:',
        );
      },
    );

    await demoAccountFileTest.step('Set "Property 1" to "primary"', async () => {
      await designPanelPage.changeVariantPropertyValue('Property 1', 'primary');
      await designPanelPage.checkVariantPropertyValue('Property 1', 'primary');
      await designPanelPage.isVariantWarningVisible(false);
    });
  });
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClickFromLayerByName('Rectangle');
    await mainPage.waitForChangeIsSaved();
    await mainPage.createVariantViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.selectLayerByName('Value 2');
    await designPanelPage.changeVariantPropertyValue('Property 1', 'Value 1');
    await designPanelPage.checkVariantWarning(
      'This variant has identical properties and values to another variant. Adjust the values so they can be retrieved.',
    );
    await layersPanelPage.selectLayerByName('Value 1');
    await mainPage.clickShortcutCtrlD();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.checkVariantLayerCount(3);

    await mainPage.clickOnVariantsTitle('Rectangle');
    await designPanelPage.checkVariantWarning(
      'Some variants have identical properties and values',
    );
    await designPanelPage.clickOnLocateDuplicatedVariantsButton();
  });

  demoAccountFileTest(
    qase(
      [2568, 2569],
      'Conflicting variants with identical properties and values / Changing several conflicting variant copies at once',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        '(2568) Conflicting variants with identical properties and values',
        async () => {
          await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
            '2-value1-layers-selected.png',
          );

          await layersPanelPage.selectLayerByName('Value 1');
          await mainPage.pressCopyShortcut();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await mainPage.pressPasteShortcut();
          await layersPanelPage.isLayerWithNameSelected('Rectangle');
          await designPanelPage.checkVariantWarning(
            'This component has conflicting variants. Make sure each variation has a unique set of property values.',
          );
        },
      );

      await demoAccountFileTest.step(
        '(2569) Changing several conflicting variant copies at once',
        async () => {
          await layersPanelPage.selectLayerByName('Value 2');
          await mainPage.pressCopyShortcut();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await mainPage.pressPasteShortcut();
          await layersPanelPage.isLayerWithNameSelected('Rectangle');
          await designPanelPage.checkVariantWarning(
            'This component has conflicting variants. Make sure each variation has a unique set of property values.',
          );
          await layersPanelPage.selectNCopyComponentLayers(1);
          await designPanelPage.checkCopyVariantPropertyValue('Property 1', 'Mixed');
          await designPanelPage.checkVariantWarning(
            'This component has conflicting variants. Make sure each variation has a unique set of property values.',
          );
          await designPanelPage.changeVariantPropertyValue('Property 1', 'Value 1');
          await designPanelPage.checkCopyVariantPropertyValue(
            'Property 1',
            'Value 1',
          );
          await layersPanelPage.clickNCopyComponentOnLayersTab(0);
          await designPanelPage.checkCopyVariantPropertyValue(
            'Property 1',
            'Value 1',
          );
          await designPanelPage.checkVariantWarning(
            'This component has conflicting variants. Make sure each variation has a unique set of property values.',
          );
          await layersPanelPage.clickNCopyComponentOnLayersTab(1);
          await designPanelPage.checkCopyVariantPropertyValue(
            'Property 1',
            'Value 1',
          );
          await designPanelPage.checkVariantWarning(
            'This component has conflicting variants. Make sure each variation has a unique set of property values.',
          );
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([2615, 2616, 2617], 'Toggle boolean properties from variants'),
  async ({ page, mainPage }) => {
    const colorPalettePage = new ColorPalettePage(page);

    await demoAccountFileTest.step(
      'Create two component variants, changing fill color to one of them',
      async () => {
        await mainPage.createDefaultEllipseByCoordinates(200, 300);
        await mainPage.createComponentViaShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.createVariantViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.checkVariantLayerCount(2);
        await layersPanelPage.collapseOrUncollapseLayerByName('Value 2');
        await layersPanelPage.selectFirstLayerByNameJustForVisibleChildren(
          'Ellipse',
        );
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex(sampleData.color.redHexCode);
      },
    );

    await demoAccountFileTest.step(
      '2615 Toggle displayed for true/false properties',
      async () => {
        await updateVariantPropertyValue('Value 2', 'false');
        await updateVariantPropertyValue('Value 1', 'true');
        await createVariantInstanceAndToggleSwitch();
      },
    );

    await demoAccountFileTest.step(
      '2616 Toggle displayed for on/off properties',
      async () => {
        await updateVariantPropertyValue('false', 'off');
        await updateVariantPropertyValue('true', 'on');
        await createVariantInstanceAndToggleSwitch();
      },
    );

    await demoAccountFileTest.step(
      '2617 Toggle displayed for yes/no properties',
      async () => {
        await updateVariantPropertyValue('off', 'no');
        await updateVariantPropertyValue('on', 'yes');
        await createVariantInstanceAndToggleSwitch();
      },
    );

    async function updateVariantPropertyValue(
      variantName: string,
      newPropertyValue: string,
    ) {
      await layersPanelPage.selectFirstLayerByNameJustForVisibleChildren(
        variantName,
      );
      await layersPanelPage.isLayerWithNameSelected(variantName);
      await designPanelPage.checkVariantPropertyValue('Property 1', variantName);
      await designPanelPage.enterVariantPropertyValue(
        'Property 1',
        newPropertyValue,
      );
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerWithNameSelected(newPropertyValue);
    }

    async function createVariantInstanceAndToggleSwitch() {
      await mainPage.pressCopyShortcut();
      await mainPage.clickViewportByCoordinates(400, 400);
      await mainPage.pressPasteShortcut();
      await mainPage.waitForChangeIsSaved();

      await designPanelPage.isSelectedHexCode(sampleData.color.grayHexCode);
      await designPanelPage.variantPropertySwitch.click();
      await designPanelPage.isSelectedHexCode(sampleData.color.redHexCode);
    }
  },
);
