const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { ColorPalettePopUp } = require("../../pages/color-palette-popup");
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
  await mainPage.clickViewport();
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
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#FF0000");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#B1B2B5");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.isFirstFileLibraryColorBulletDisplayed();
  await colorPalettePopUp.isSecondFileLibraryColorBulletDisplayed();
  await colorPalettePopUp.clickSecondFileLibraryColorBullet();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "board-recent-color.png"
  );
});

mainTest("CP-8 Use colors from File library", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#ffff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.selectFileLibraryColors();
  await colorPalettePopUp.isRecentColorsColorBulletDisplayed();
  await colorPalettePopUp.clickRecentColorsColorBullet();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "rectangle-file-library-color.png"
  );
});

mainTest("CP-18 Open Color palette from toolbar", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#FF0000");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#B1B2B5");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickColorsPanelButton();
  await mainPage.isColorsPanelDisplayed();
  await expect(mainPage.colorsPanel).toHaveScreenshot("colors-panel.png");
  await mainPage.clickColorsPanelButton();
  await mainPage.isColorsPanelNotDisplayed();
});

mainTest(
  "CP-26 Open color picker from add or edit color in assets",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePopUp = new ColorPalettePopUp(page);
    await mainPage.clickAssetsTab();
    await mainPage.clickAddFileLibraryColorButton();
    await colorPalettePopUp.isColorPalettePopUpOpened();
  }
);
