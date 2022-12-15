const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");

mainTest(
  "AS-1 Switch from Layers to Assets via clicking tab and ALT I ALT L shortcuts)",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.isAssetsPanelDisplayed();
    await mainPage.clickLayersTab();
    await mainPage.isLayersPanelDisplayed();
    await mainPage.switchToAssetsPanelViaShortcut();
    await mainPage.isAssetsPanelDisplayed();
    await mainPage.switchToLayersPanelViaShortcut();
    await mainPage.isLayersPanelDisplayed();
  }
);

mainTest("AS-2 Filter Graphics from All Assets drop-down", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.selectTypeFromAllAssetsSelector("Graphics");
  await mainPage.isAssetsTitleDisplayed("Graphics (0)");
});

mainTest("AS-3 File library graphics - add .png", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.uploadImageToFileLibraryGraphics("images/images.png");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isImageUploadedToFileLibraryGraphics();
  await expect(mainPage.assetsPanel).toHaveScreenshot("graphics-png.png");
});

mainTest("AS-4 File library graphics - add .jpg", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.uploadImageToFileLibraryGraphics("images/sample.jpeg");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isImageUploadedToFileLibraryGraphics();
  await expect(mainPage.assetsPanel).toHaveScreenshot("graphics-jpg.png");
});

mainTest("AS-5 File library graphics - add .svg", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.uploadImageToFileLibraryGraphics(
    "images/potato-snack-food-svgrepo-com.svg"
  );
  await mainPage.waitForChangeIsSaved();
  await mainPage.isImageUploadedToFileLibraryGraphics();
  await expect(mainPage.assetsPanel).toHaveScreenshot("graphics-svg.png");
});

mainTest("AS-11 File library graphics - delete", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.uploadImageToFileLibraryGraphics("images/images.png");
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteFileLibraryGraphics();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isImageNotUploadedToFileLibraryGraphics();
  await mainPage.selectTypeFromAllAssetsSelector("Graphics");
  await mainPage.isAssetsTitleDisplayed("Graphics (0)");
});

mainTest("AS-12 File library graphics - create group", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.uploadImageToFileLibraryGraphics("images/images.png");
  await mainPage.waitForChangeIsSaved();
  await mainPage.createGroupFileLibraryGraphics("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupCreated("Test Group");
  await expect(mainPage.assetsPanel).toHaveScreenshot("group-graphics.png");
});

mainTest("AS-14 File library graphics - rename group", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.uploadImageToFileLibraryGraphics("images/images.png");
  await mainPage.waitForChangeIsSaved();
  await mainPage.createGroupFileLibraryGraphics("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.renameGroupFileLibrary("New Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupCreated("New Group");
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "group-graphics-renamed.png"
  );
});

mainTest("AS-17 File library graphics - ungroup", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.uploadImageToFileLibraryGraphics("images/images.png");
  await mainPage.waitForChangeIsSaved();
  await mainPage.createGroupFileLibraryGraphics("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.ungroupFileLibrary();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupRemoved();
  await expect(mainPage.assetsPanel).toHaveScreenshot("graphics-png.png");
});

mainTest(
  "AS-19 File library graphics - change view list tile",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.uploadImageToFileLibraryGraphics("images/images.png");
    await mainPage.waitForChangeIsSaved();
    await mainPage.uploadImageToFileLibraryGraphics("images/sample.jpeg");
    await mainPage.waitForChangeIsSaved();
    await mainPage.uploadImageToFileLibraryGraphics(
      "images/potato-snack-food-svgrepo-com.svg"
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.assetsPanel).toHaveScreenshot(
      "graphics-tile-view.png"
    );
    await mainPage.clickFileLibraryChangeViewButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.assetsPanel).toHaveScreenshot(
      "graphics-list-view.png"
    );
    await mainPage.clickFileLibraryChangeViewButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.assetsPanel).toHaveScreenshot(
      "graphics-tile-view.png"
    );
  }
);
