const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let mainPage,
  dashboardPage,
  teamPage,
  layersPanelPage,
  assetsPanelPage,
  designPanelPage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(
    [2430],
    'When converting a component to a variant, the connections are not lost',
  ),
  async () => {
    await dashboardPage.importAndOpenFile('documents/figure.penpot');
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();

    await layersPanelPage.clickMainComponentOnLayersTab();
    await layersPanelPage.copyElementViaAltDragAndDrop(100, 100);

    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.combineAsVariantsGroup();
    await assetsPanelPage.isVariantsAddedToFileLibraryComponents();

    await layersPanelPage.openLayersTab();

    await layersPanelPage.selectLayerByName('Rectangle, Blue');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.setComponentColor('#cd0c3a');
    await layersPanelPage.selectLayerByName('Rectangle, Blue');
    await designPanelPage.isFillHexCodeSetComponent('cd0c3a');
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.isFillHexCodeSetComponent('cd0c3a');
  },
);

mainTest(
  qase([2433], 'Creating a child component by copying a variant'),
  async ({ browserName }) => {
    await dashboardPage.createFileViaPlaceholder();
    browserName === 'webkit' && !(await mainPage.isMainPageVisible())
      ? await dashboardPage.createFileViaPlaceholder()
      : null;
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();

    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createVariantViaRightClick();
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.selectLayerByName('Value 2');
    await mainPage.pressCopyShortcut(browserName);
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.pressPasteShortcut(browserName);
    await layersPanelPage.checkVariantLayerCount(2);
    await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Rectangle');

    await layersPanelPage.selectLayerByName('Value 2');
    await designPanelPage.setComponentColor('#0538D1');
    await layersPanelPage.selectLayerByName('Value 2');
    await designPanelPage.isFillHexCodeSetComponent('0538d1');
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.isFillHexCodeSetComponent('0538d1');
    await designPanelPage.changeFirstVariantProperty('Value 1');
    await designPanelPage.isFillHexCodeSetComponent('B1B2B5');
  },
);
