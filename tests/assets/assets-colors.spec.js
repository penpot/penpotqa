const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page },testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest(qase(932,'AS-22 Filter Colors from All Assets drop-down'), async ({ page }) => {
  const assetsPanelPage = new AssetsPanelPage(page);
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.selectTypeFromAllAssetsDropdown('Colors');
  await assetsPanelPage.isAssetsSectionNameDisplayed('Colors', '0');
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    const colorPalettePopUp = new ColorPalettePage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryColorButton();
    await colorPalettePopUp.setHex('#ffff00');
    await colorPalettePopUp.clickSaveColorStyleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  }); 

  mainTest(qase(933,'AS-23 File library colors - add'), async ({ page }) => {
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.isColorAddedToFileLibraryColors('#ffff00');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'colors-add-color.png',
    );
  });

  mainTest(qase(934,'AS-24 File library colors - edit'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    const colorPalettePopUp = new ColorPalettePage(page);
    await assetsPanelPage.editFileLibraryColor();
    await colorPalettePopUp.setHex('#00ff00');
    await colorPalettePopUp.clickSaveColorStyleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isColorAddedToFileLibraryColors('#ffff00#00ff00');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'colors-edit-color.png',
    );
  });

  mainTest(qase(935,'AS-25 File library colors - rename'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.renameFileLibraryColor('test color');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isColorAddedToFileLibraryColors('test color#ffff00');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'colors-rename-color.png',
    );
  });

  mainTest(qase(936,'AS-26 File library colors - delete'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.deleteFileLibraryColor();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isColorNotAddedToFileLibraryColors();
    await assetsPanelPage.selectTypeFromAllAssetsDropdown('Colors');
    await assetsPanelPage.isAssetsSectionNameDisplayed('Colors', '0');
  });

  mainTest(qase(937,'AS-27 File library colors - create group'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('Test Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot('group-colors.png');
  });

  mainTest(qase(939,'AS-29 File library colors - rename group'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.renameGroupFileLibrary('New Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('New Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'group-colors-renamed.png',
    );
  });

  mainTest(qase(942,'AS-32 File library colors- ungroup'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.ungroupFileLibrary();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupRemoved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'colors-add-color.png',
    );
  });

  mainTest(qase(944,'AS-34 File library colors - apply to element'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickFileLibraryColorsColorBullet();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('apply-color-to-board.png');
  });

  mainTest(qase(1027,'AS-117 File library colors - apply to stroke'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickAddStrokeButton();
    await assetsPanelPage.clickAndPressAltFileLibraryColorsColorBullet();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportByCoordinates(900, 100, 3);
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'apply-color-to-stroke-board.png',
    );
  });
});
