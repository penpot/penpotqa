const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { expect, test } = require('@playwright/test');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { random } = require('../../helpers/string-generator');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');

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

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest('CP-1 Open color picker from Stroke menu', async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.createDefaultClosedPath();
  await designPanelPage.clickStrokeColorBullet();
  await colorPalettePage.isColorPalettePopUpOpened();
});

mainTest('CP-2 Open color picker from Fill menu', async ({ page }) => {
  const mainPage = new MainPage(page);
  const designPanelPage = new DesignPanelPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.isColorPalettePopUpOpened();
});

mainTest(
  'CP-3 Open color picker from Canvas background menu',
  async ({ page }) => {
    const designPanelPage = new DesignPanelPage(page);
    const colorPalettePage = new ColorPalettePage(page);
    await designPanelPage.clickCanvasBackgroundColorIcon();
    await colorPalettePage.isColorPalettePopUpOpened();
  },
);

mainTest('CP-7 Use Recent colors', async ({ page }) => {
  const color1 = '#FF0000';
  const color2 = '#B1B2B5';
  const mainPage = new MainPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.setHex(color1);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.setHex(color2);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.clickColorBullet(false, 1);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    'board-recent-color.png',
  );
});

mainTest('CP-8 Use colors from File library', async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  const designPanelPage = new DesignPanelPage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickAddFileLibraryColorButton();
  await colorPalettePage.setHex('#ffff00');
  await colorPalettePage.clickSaveColorStyleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(200, 300);
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.selectFileLibraryColors();
  await colorPalettePage.clickColorBullet();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    'rectangle-file-library-color.png',
  );
});

mainTest('CP-17 Open Color palette from shortcut', async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.setHex('#FF0000');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.setHex('#B1B2B5');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();

  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteDisplayed();
  await expect(mainPage.typographiesColorsBottomPanel).toHaveScreenshot(
    'colors-panel.png',
  );
  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteNotDisplayed();
});

mainTest('CP-18 Open Color palette from toolbar', async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  const designPanelPage = new DesignPanelPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.setHex('#FF0000');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.setHex('#B1B2B5');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.openCloseColorsPaletteFromSidebar();
  await mainPage.isColorsPaletteDisplayed();
  await expect(mainPage.typographiesColorsBottomPanel).toHaveScreenshot(
    'colors-panel.png',
  );
  await mainPage.openCloseColorsPaletteFromSidebar();
  await mainPage.isColorsPaletteNotDisplayed();
});

mainTest('CP-20 Choose file library colors', async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickAddFileLibraryColorButton();
  await colorPalettePage.setHex('#ffff00');
  await colorPalettePage.clickSaveColorStyleButton();
  await mainPage.clickViewportOnce();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAddFileLibraryColorButton();
  await colorPalettePage.setHex('#cdc548');
  await colorPalettePage.clickSaveColorStyleButton();
  await mainPage.clickViewportOnce();
  await mainPage.waitForChangeIsSaved();

  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteDisplayed();
  await colorPalettePage.openColorPaletteMenu();
  await colorPalettePage.isPaletteRecentColorsOptExist();
  await colorPalettePage.isPaletteFileLibraryOptExist();
  await colorPalettePage.selectColorPaletteMenuOption('File library');
  await expect(mainPage.typographiesColorsBottomPanel).toHaveScreenshot(
    'colors-file-library.png',
  );
  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteNotDisplayed();
});

mainTest(
  'CP-21 Click any layer and change Fill color from palette',
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePage = new ColorPalettePage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#FF0000');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#B1B2B5');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'rectangle-color-B1B2B5.png',
    );
    await mainPage.pressColorsPaletteShortcut();
    await mainPage.isColorsPaletteDisplayed();
    await expect(mainPage.typographiesColorsBottomPanel).toHaveScreenshot(
      'colors-panel.png',
    );
    await colorPalettePage.selectColorBulletFromPalette('#FF0000');
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'rectangle-color-FF0000.png',
    );
    await mainPage.pressColorsPaletteShortcut();
    await mainPage.isColorsPaletteNotDisplayed();
  },
);

mainTest(
  'CP-26 Open color picker from add or edit color in assets',
  async ({ page }) => {
    const assetsPanelPage = new AssetsPanelPage(page);
    const colorPalettePage = new ColorPalettePage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryColorButton();
    await colorPalettePage.isColorPalettePopUpOpened();
  },
);
