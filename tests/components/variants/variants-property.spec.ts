import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page }) => {
  let teamPage = new TeamPage(page);
  await teamPage.createTeam(teamName);
});

mainTest.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);

  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(
    [2441],
    'Component groups are passed to Property when creating a component with variants (several groups)',
  ),
  async ({ page }) => {
    let dashboardPage = new DashboardPage(page);
    let mainPage = new MainPage(page);
    let assetsPanelPage = new AssetsPanelPage(page);
    let layersPanelPage = new LayersPanelPage(page);
    let designPanelPage = new DesignPanelPage(page);

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

mainTest(qase([2443], 'SWAP panel with variants'), async ({ page }) => {
  let dashboardPage = new DashboardPage(page);
  let mainPage = new MainPage(page);
  let layersPanelPage = new LayersPanelPage(page);
  let designPanelPage = new DesignPanelPage(page);

  await dashboardPage.importAndOpenFile('documents/swap.penpot');
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();

  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.clickOnSwapComponentButton();
  await expect(designPanelPage.swapComponentTab).toHaveScreenshot(
    'swap-component-list.png',
  );
  await designPanelPage.clickOnSwapGridViewButton();
  await expect(designPanelPage.swapComponentTab).toHaveScreenshot(
    'swap-component-grid.png',
  );
});

mainTest(
  qase([2444], 'Changing Property for Child Components'),
  async ({ page }) => {
    let dashboardPage = new DashboardPage(page);
    let mainPage = new MainPage(page);
    let layersPanelPage = new LayersPanelPage(page);
    let designPanelPage = new DesignPanelPage(page);
    let assetsPanelPage = new AssetsPanelPage(page);

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
    await designPanelPage.changeVariantPropertyValue('Property 2', 'Yellow');
    await designPanelPage.checkCopyVariantPropertyValue('Property 2', 'Yellow');

    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.checkCopyVariantPropertyValue('Property 2', 'Blue');
  },
);

mainTest(qase([2447], 'Property recovery'), async ({ page }) => {
  let dashboardPage = new DashboardPage(page);
  let mainPage = new MainPage(page);
  let layersPanelPage = new LayersPanelPage(page);
  let designPanelPage = new DesignPanelPage(page);
  let assetsPanelPage = new AssetsPanelPage(page);

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
  let mainPage: MainPage;
  let designPanelPage: DesignPanelPage;
  let layersPanelPage: LayersPanelPage;
  let assetsPanelPage: AssetsPanelPage;
  let dashboardPage: DashboardPage;

  mainTest.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);
    assetsPanelPage = new AssetsPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);
    designPanelPage = new DesignPanelPage(page);

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

mainTest.describe(() => {
  let mainPage: MainPage;
  let designPanelPage: DesignPanelPage;
  let layersPanelPage: LayersPanelPage;
  let dashboardPage: DashboardPage;

  mainTest.beforeEach(async ({ browserName, page }) => {
    mainPage = new MainPage(page);
    dashboardPage = new DashboardPage(page);
    layersPanelPage = new LayersPanelPage(page);
    designPanelPage = new DesignPanelPage(page);

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
  });

  mainTest(
    qase([2568], 'Conflicting variants with identical properties and values'),
    async ({ browserName }) => {
      await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
        '2-value1-layers-selected.png',
      );
      await layersPanelPage.selectLayerByName('Value 1');
      await mainPage.pressCopyShortcut(browserName);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.pressPasteShortcut(browserName);
      await layersPanelPage.isLayerWithNameSelected('Rectangle');
      await designPanelPage.checkVariantWarning(
        'This component has conflicting variants. Make sure each variation has a unique set of property values.',
      );
    },
  );

  mainTest(
    qase([2569], 'Changing several conflicting variant copies at once'),
    async ({ browserName }) => {
      await layersPanelPage.selectLayerByName('Value 1');
      await mainPage.pressCopyShortcut(browserName);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.pressPasteShortcut(browserName);
      await layersPanelPage.isLayerWithNameSelected('Rectangle');

      await layersPanelPage.selectLayerByName('Value 2');
      await mainPage.pressCopyShortcut(browserName);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.pressPasteShortcut(browserName);
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
      await designPanelPage.checkCopyVariantPropertyValue('Property 1', 'Value 1');
      await layersPanelPage.clickNCopyComponentOnLayersTab(0);
      await designPanelPage.checkCopyVariantPropertyValue('Property 1', 'Value 1');
      await designPanelPage.checkVariantWarning(
        'This component has conflicting variants. Make sure each variation has a unique set of property values.',
      );
      await layersPanelPage.clickNCopyComponentOnLayersTab(1);
      await designPanelPage.checkCopyVariantPropertyValue('Property 1', 'Value 1');
      await designPanelPage.checkVariantWarning(
        'This component has conflicting variants. Make sure each variation has a unique set of property values.',
      );
    },
  );
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let designPanelPage: DesignPanelPage;
  let layersPanelPage: LayersPanelPage;
  let dashboardPage: DashboardPage;

  mainTest.beforeEach(async ({ browserName, page }) => {
    mainPage = new MainPage(page);
    dashboardPage = new DashboardPage(page);
    layersPanelPage = new LayersPanelPage(page);
    designPanelPage = new DesignPanelPage(page);

    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();

    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createVariantViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase([2615], 'Toggle displayed for true/false properties'),
    async ({ browserName }) => {},
  );
});
