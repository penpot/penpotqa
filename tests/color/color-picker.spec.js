const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { ColorPalettePopUp } = require("../../pages/workspace/color-palette-popup");
const { expect } = require("@playwright/test");

mainTest("CP-1 Open color picker from Stroke menu", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickStrokeColorBullet();
  await colorPalettePopUp.isColorPalettePopUpOpened();
});

mainTest("CP-2 Open color picker from Fill menu", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.isColorPalettePopUpOpened();
});

mainTest(
  "CP-3 Open color picker from Canvas background menu",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePopUp = new ColorPalettePopUp(page);
    await mainPage.clickCanvasBackgroundColorIcon();
    await colorPalettePopUp.isColorPalettePopUpOpened();
  }
);

mainTest("CP-7 Use Recent colors", async ({ page }) => {
  const color1 = "#FF0000";
  const color2 = "#B1B2B5";
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex(color1);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex(color2);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.isRecentColorBulletDisplayed(color1);
  await colorPalettePopUp.isRecentColorBulletDisplayed(color2);
  await colorPalettePopUp.clickRecentColorBullet(color1);
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "board-recent-color.png"
  );
});

mainTest("CP-8 Use colors from File library", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.openAssetsTab();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#ffff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.selectFileLibraryColors();
  await colorPalettePopUp.isFileLibraryColorBulletDisplayed();
  await colorPalettePopUp.clickFirstFileLibraryColorBullet();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "rectangle-file-library-color.png"
  );
});

mainTest("CP-17 Open Color palette from shortcut", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#FF0000");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#B1B2B5");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();

  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteDisplayed();
  await expect(mainPage.colorsPalette).toHaveScreenshot("colors-panel.png");
  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteNotDisplayed();
});

mainTest("CP-18 Open Color palette from toolbar", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#FF0000");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#B1B2B5");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.openCloseColorsPaletteFromSidebar();
  await mainPage.isColorsPaletteDisplayed();
  await expect(mainPage.colorsPalette).toHaveScreenshot("colors-panel.png");
  await mainPage.openCloseColorsPaletteFromSidebar();
  await mainPage.isColorsPaletteNotDisplayed();
});

mainTest("CP-20 Choose file library colors", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.openAssetsTab();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#ffff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewportOnce();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#cdc548");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewportOnce();
  await mainPage.waitForChangeIsSaved();

  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteDisplayed();
  await colorPalettePopUp.openColorPaletteMenu();
  await colorPalettePopUp.isPaletteRecentColorsOptExist();
  await colorPalettePopUp.isPaletteFileLibraryOptExist();
  await colorPalettePopUp.selectColorPaletteMenuOption("File library");
  await expect(mainPage.colorsPalette).toHaveScreenshot("colors-file-library.png");
  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteNotDisplayed();
});

mainTest("CP-21 Click any layer and change Fill color from palette",async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#FF0000");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#B1B2B5");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rectangle-color-B1B2B5.png");

  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteDisplayed();
  await expect(mainPage.colorsPalette).toHaveScreenshot("colors-panel.png");
  await colorPalettePopUp.selectColorBulletFromPalette("#FF0000");
  await expect(mainPage.createdLayer).toHaveScreenshot("rectangle-color-FF0000.png");
  await mainPage.pressColorsPaletteShortcut();
  await mainPage.isColorsPaletteNotDisplayed();
});

mainTest("CP-26 Open color picker from add or edit color in assets",async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePopUp = new ColorPalettePopUp(page);
    await mainPage.openAssetsTab();
    await mainPage.clickAddFileLibraryColorButton();
    await colorPalettePopUp.isColorPalettePopUpOpened();
});
