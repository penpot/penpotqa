const { mainTest } = require('../../fixtures');
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

let dashboardPage, teamPage, mainPage, assetsPanelPage, designPanelPage, layersPanelPage, colorPalettePage;
test.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.createDefaultRectangleByCoordinates(300, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.addFileAsSharedLibraryViaRightclick();
  await dashboardPage.isSharedLibraryIconDisplayed();

  await dashboardPage.createFileViaTitlePanel();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickLibrariesButton();
  await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
  await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
  await dashboardPage.reloadPage();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickLibraryTitle();
  await assetsPanelPage.clickLibraryComponentsTitle();
  await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.isFileVisibleByName('New File 2');
  await dashboardPage.checkNumberOfFiles('2 files');
  await dashboardPage.deleteFileWithNameViaRightClick('New File 1');
  await dashboardPage.clickDeleteFileButton();

  await dashboardPage.checkNumberOfFiles('1 file');
  await dashboardPage.openFileWithName('New File 2');
  await mainPage.isSecondPageNameDisplayed('Main components');
});

test.afterEach(async ({}, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});
