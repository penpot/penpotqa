const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { expect } = require('@playwright/test');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { random } = require('../../helpers/string-generator');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let mainPage,
  colorPalettePage,
  teamPage,
  dashboardPage,
  designPanelPage,
  assetsPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([1029], 'Open color picker from Stroke menu'), async () => {
  await mainPage.createDefaultClosedPath();
  await designPanelPage.clickStrokeColorBullet();
  await colorPalettePage.isColorPalettePopUpOpened();
});

mainTest(qase([1030], 'Open color picker from Fill menu'), async () => {
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.isColorPalettePopUpOpened();
});

mainTest(qase([1031], 'Open color picker from Canvas background menu'), async () => {
  await designPanelPage.clickCanvasBackgroundColorIcon();
  await colorPalettePage.isColorPalettePopUpOpened();
});

mainTest(qase([1035], 'Use Recent colors'), async () => {
  const color1 = '#FF0000';
  const color2 = '#B1B2B5';

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
  await colorPalettePage.clickColorBullet(false, 0);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot('board-recent-color.png');
});

// FIXME: File library color selection UI is not available in the current Penpot version
// The expected dropdown for selecting "File library" vs "Recent colors" does not exist
// when clicking fill color icons. Colors from file library are directly accessible
// in the color picker without needing to switch between library modes.
mainTest.fixme(qase([1036], 'Use colors from File library'), async () => {
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

mainTest(qase([1045], 'Open Color palette from shortcut'), async () => {
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

mainTest(qase([1046], 'Open Color palette from toolbar'), async () => {
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

mainTest(qase([1048], 'Choose file library colors'), async () => {
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
  qase([1049], 'Click any layer and change Fill color from palette'),
  async () => {
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
  qase([1054], 'Open color picker from add or edit color in assets'),
  async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryColorButton();
    await colorPalettePage.isColorPalettePopUpOpened();
  },
);

mainTest(
  qase([1996], 'Delete linear gradient stop (from color picker stops list)'),
  async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.isColorPalettePopUpOpened();
    await colorPalettePage.selectColorGradient();
    await colorPalettePage.colorPaletteAddStop();
    await mainPage.waitForChangeIsSaved();
    await colorPalettePage.colorPaletteRemoveStop(1);
    await colorPalettePage.checkGradientStops(2);
  },
);
