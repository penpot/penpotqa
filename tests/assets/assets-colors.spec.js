const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let mainPage,
  dashboardPage,
  teamPage,
  assetsPanelPage,
  colorPalettePopUp,
  designPanelPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePopUp = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
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

mainTest(qase([932], 'Filter Colors from All Assets drop-down'), async () => {
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.selectTypeFromAllAssetsDropdown('Colors');
  await assetsPanelPage.isAssetsSectionNameDisplayed('Colors', '0');
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryColorButton();
    await colorPalettePopUp.setHex('#ffff00');
    await colorPalettePopUp.clickSaveColorStyleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([933], 'File library colors - add'), async () => {
    await assetsPanelPage.isColorAddedToFileLibraryColors('#ffff00');
  });

  mainTest(qase([934], 'Edit Color Asset After Applying to Element'), async () => {
    await mainPage.createDefaultBoardByCoordinates(500, 200);
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickFileLibraryColorsColorBullet();
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickFileLibraryColorsColorBullet();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('apply-color-to-shapes.png', {
      mask: await mainPage.maskViewport(),
    });
    await assetsPanelPage.editFileLibraryColor();
    await colorPalettePopUp.setHex('#00ff00');
    await colorPalettePopUp.clickSaveColorStyleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isColorAddedToFileLibraryColors('#ffff00#00ff00');
    await expect(mainPage.viewport).toHaveScreenshot('edited-color-to-shapes.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([935], 'File library colors - rename'), async () => {
    await assetsPanelPage.renameFileLibraryColor('test color');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isColorAddedToFileLibraryColors('test color#ffff00');
  });

  mainTest(qase([936], 'File library colors - delete'), async () => {
    await assetsPanelPage.deleteFileLibraryColor();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isColorNotAddedToFileLibraryColors();
    await assetsPanelPage.selectTypeFromAllAssetsDropdown('Colors');
    await assetsPanelPage.isAssetsSectionNameDisplayed('Colors', '0');
  });

  mainTest(qase([937], 'File library colors - create group'), async () => {
    await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('Test Group');
    await assetsPanelPage.isColorToFileLibraryColorsNotVisible();
  });

  mainTest(qase([939], 'File library colors - rename group'), async () => {
    await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.renameGroupFileLibrary('New Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('New Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'group-colors-renamed.png',
    );
  });

  mainTest(qase([942], 'File library colors- ungroup'), async () => {
    await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.ungroupFileLibrary();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupRemoved();
    await assetsPanelPage.isColorAddedToFileLibraryColors('#ffff00');
  });

  mainTest(qase([1027], 'File library colors - apply to stroke'), async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickAddStrokeButton();
    await assetsPanelPage.clickAndPressAltFileLibraryColorsColorBullet();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportByCoordinates(900, 100, 3);
    await expect(mainPage.viewport).toHaveScreenshot(
      'apply-color-to-stroke-board.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
  });
});
