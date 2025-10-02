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

const teamName = random().concat('autotest');

let mainPage,
  dashboardPage,
  teamPage,
  assetsPanelPage,
  designPanelPage,
  colorPalettePage;

mainTest.beforeEach(async ({ page, browserName }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([2440], 'Create variants by design panel'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickOnComponentMenuButton();
  await designPanelPage.clickOnCreateVariantOption();
  await mainPage.waitForChangeIsSaved();

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
});

mainTest(qase([2396], 'Creating variants from a component group'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(100, 300);
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.setHex('#0ea27a');
  await mainPage.clickViewportOnce();
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.isFillHexCodeSet('0ea27a');
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
});

mainTest(
  qase([2425], 'Create variants by copying an existing component'),
  async ({ browserName }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnVariantsTitle('Rectangle');
    await mainPage.copyLayerViaRightClick();
    await mainPage.pressPasteShortcut(browserName);
    await mainPage.clickViewportOnce();
    await expect(mainPage.viewport).toHaveScreenshot('copy-paste-variants.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  },
);
