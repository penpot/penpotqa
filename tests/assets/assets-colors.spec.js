const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");
const { ColorPalettePopUp } = require("../../pages/color-palette-popup");

mainTest("AS-22 Filter Colors from All Assets drop-down", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.selectTypeFromAllAssetsSelector("Colors");
  await mainPage.isAssetsTitleDisplayed("Colors (0)");
});

mainTest("AS-23 File library colors - add", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#ffff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isColorAddedToFileLibraryColors("#ffff00");
  await expect(mainPage.assetsPanel).toHaveScreenshot("colors-add-color.png");
});

mainTest("AS-24 File library colors - edit", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#ffff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.editFileLibraryColor();
  await colorPalettePopUp.setHex("#00ff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isColorAddedToFileLibraryColors("#ffff00#00ff00");
  await expect(mainPage.assetsPanel).toHaveScreenshot("colors-edit-color.png");
});

mainTest("AS-25 File library colors - rename", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#ffff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.renameFileLibraryColor("test color");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isColorAddedToFileLibraryColors("test color#ffff00");
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "colors-rename-color.png"
  );
});

mainTest("AS-26 File library colors - delete", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#ffff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteFileLibraryColor();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isColorNotAddedToFileLibraryColors();
  await mainPage.selectTypeFromAllAssetsSelector("Colors");
  await mainPage.isAssetsTitleDisplayed("Colors (0)");
});

mainTest("AS-27 File library colors- create group", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#ffff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createGroupFileLibraryColors("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupCreated("Test Group");
  await expect(mainPage.assetsPanel).toHaveScreenshot("group-colors.png");
});
