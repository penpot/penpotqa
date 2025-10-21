const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { random } = require('../../../helpers/string-generator');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');

const teamName = random().concat('autotest');

let mainPage,
  dashboardPage,
  teamPage,
  assetsPanelPage,
  designPanelPage,
  colorPalettePage,
  layersPanelPage;

mainTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  await teamPage.createTeam(teamName);
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(
    [2441],
    'Component groups are passed to Property when creating a component with variants (several groups)',
  ),
  async () => {
    await dashboardPage.importAndOpenFile('documents/figure.penpot');
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();

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

mainTest(qase([2443], 'SWAP panel with variants'), async () => {
  await dashboardPage.importAndOpenFile('documents/swap.penpot');
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();

  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.clickOnSwapComponentButton();
  await expect(designPanelPage.swapComponentTab).toHaveScreenshot(
    'swap-component-list.png',
    { maxDiffPixelRatio: 0.02 },
  );
  await designPanelPage.clickOnSwapGridViewButton();
  await expect(designPanelPage.swapComponentTab).toHaveScreenshot(
    'swap-component-grid.png',
    { maxDiffPixelRatio: 0.02 },
  );
});

mainTest(qase([2444], 'Changing Property for Child Components'), async () => {
  await dashboardPage.importAndOpenFile('documents/figure.penpot');
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.combineAsVariantsGroup();
  await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
  await layersPanelPage.openLayersTab();

  await layersPanelPage.selectLayerByName('Ellipse, Green');
  await layersPanelPage.copyElementViaAltDragAndDrop(100, 100);
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.changeVariantPropertyValue('Property 1', 'Arrow');
  await designPanelPage.changeVariantPropertyValue('Property 2', 'Blue');
  await layersPanelPage.copyElementViaAltDragAndDrop(100, 300);
  await designPanelPage.waitForChangeIsSaved();

  await layersPanelPage.clickFirstCopyComponentOnLayersTab();
  await designPanelPage.changeVariantPropertyValue('Property 1', 'Ellipse');
  await designPanelPage.changeVariantPropertyValue('Property 2', 'Yellow');
});

mainTest(qase([2447], 'Property recovery'), async () => {
  await dashboardPage.importAndOpenFile('documents/bulk-less-happy.penpot');
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.combineAsVariantsGroup();
  await layersPanelPage.openLayersTab();

  await layersPanelPage.selectLayerByName('primary, text, default');
  await layersPanelPage.doubleClickLayerOnLayersTab('primary, text, default');
  await layersPanelPage.typeNameCreatedLayerAndEnter('');
  await mainPage.waitForChangeIsSaved();

  await designPanelPage.checkVariantPropertyValue('Property 1', '');
  await designPanelPage.checkVariantPropertyValue('Property 2', '');
  await designPanelPage.checkVariantPropertyValue('Property 3', '');
  await designPanelPage.checkVariantPropertyValue('Property 4', '');
  await designPanelPage.checkVariantWarning(
    'This variant has an invalid name. Try using the following structure:',
  );

  await designPanelPage.changeVariantPropertyValue('Property 1', 'primary');
  await designPanelPage.checkVariantPropertyValue('Property 1', 'primary');
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await dashboardPage.importAndOpenFile('documents/figure.penpot');
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();

    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.combineAsVariantsGroup();
    await assetsPanelPage.waitForChangeIsSaved();
    await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
    await layersPanelPage.openLayersTab();
  });

  mainTest(qase([2450], 'Adding New Properties'), async () => {
    await layersPanelPage.selectLayerByName('Ellipse, Green');
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnAddNewPropertyOption();
    await layersPanelPage.selectLayerByName('Arrow, Blue, Value 1');
    await designPanelPage.checkVariantPropertyValue('Property 3', 'Value 1');

    await layersPanelPage.doubleClickLayerOnLayersTab('Arrow, Blue, Value 1');
    await layersPanelPage.typeNameCreatedLayerAndEnter(
      'Property 1=Rectangle, Property 2=Blue, Property 3=Value 1, Test=TestValue',
    );
    await designPanelPage.checkVariantPropertyValue('Test', 'TestValue');

    await layersPanelPage.selectLayerByName('Ellipse, Green');
    await designPanelPage.enterVariantPropertyValue('Test', 'TestValue2');
    await designPanelPage.checkVariantPropertyValue('Test', 'TestValue2');
    await layersPanelPage.isLayerWithNameSelected(
      'Ellipse, Green, Value 1, TestValue2',
    );
  });

  mainTest(qase([2452], 'Editing a Property Value'), async () => {
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

  mainTest(qase([2453], 'Delete Property'), async () => {
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

mainTest(qase([2568], 'Locate duplicated variants'), async ({ browserName }) => {
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();

  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaShortcut(browserName);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaShortcut(browserName);
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.selectLayerByName('Value 2');
  await designPanelPage.changeVariantPropertyValue('Property 1', 'Value 1');
  await designPanelPage.checkVariantWarning(
    'This variant has identical properties and values to another variant. Adjust the values so they can be retrieved.',
  );
  await layersPanelPage.selectLayerByName('Value 1');
  await mainPage.clickShortcutCtrlD(browserName);
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.checkVariantLayerCount(3);

  await mainPage.clickOnVariantsTitle('Rectangle');
  await designPanelPage.checkVariantWarning(
    'Some variants have identical properties and values',
  );
  await designPanelPage.clickOnLocateDuplicatedVariantsButton();
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    '2-value1-layers-selected.png',
  );
});
