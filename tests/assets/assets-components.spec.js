const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { expect } = require("@playwright/test");

mainTest(
  "AS-56 Filter Components from All Assets drop-down",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.openAssetsTab();
    await mainPage.selectTypeFromAllAssetsDropdown("Components");
    await mainPage.isAssetsTitleDisplayed("Components (0)");
  },
);

mainTest("AS-80 Duplicate component", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportByCoordinates(200, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.openAssetsTab();
  await mainPage.duplicateFileLibraryComponent();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isSecondComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-rectangle-duplicated.png",
  );
});

mainTest("AS-83 Components - create group", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportByCoordinates(200, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.openAssetsTab();
  await mainPage.createGroupFileLibraryGraphics("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupCreated("Test Group");
  await expect(mainPage.assetsPanel).toHaveScreenshot("group-components.png");
});

mainTest("AS-85 Components - rename group", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportByCoordinates(200, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.openAssetsTab();
  await mainPage.createGroupFileLibraryGraphics("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.renameGroupFileLibrary("New Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupCreated("New Group");
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "group-components-renamed.png",
  );
});

mainTest("AS-88 Components - ungroup", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportByCoordinates(200, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.openAssetsTab();
  await mainPage.createGroupFileLibraryGraphics("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.ungroupFileLibrary();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupRemoved();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-rectangle.png",
  );
});

mainTest("AS-90 Components - change view list tile", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportByCoordinates(300, 400);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportByCoordinates(100, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.openAssetsTab();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-tile-view.png",
  );
  await mainPage.clickFileLibraryChangeViewButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-list-view.png",
  );
  await mainPage.clickFileLibraryChangeViewButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-tile-view.png",
  );
});
