const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");

mainTest(
  "AS-56 Filter Components from All Assets drop-down",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.selectTypeFromAllAssetsSelector("Components");
    await mainPage.isAssetsTitleDisplayed("Components (0)");
  }
);

mainTest("AS-57 Create component (shape)", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-rectangle.png"
  );
});

mainTest("AS-58 Create component (image)", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot("components-image.png");
});

mainTest("AS-59 Create component (text)", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot("components-text.png");
});

mainTest("AS-61 Create component (path)", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot("components-path.png");
});

mainTest("AS-80 Duplicate component", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.duplicateFileLibraryComponents();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isSecondComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-rectangle-duplicated.png"
  );
});

mainTest("AS-81 Delete component", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.deleteFileLibraryComponents();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isComponentNotAddedToFileLibraryComponents();
  await mainPage.selectTypeFromAllAssetsSelector("Components");
  await mainPage.isAssetsTitleDisplayed("Components (0)");
});

mainTest("AS-83 Components - create group", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.createGroupFileLibraryGraphics("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupCreated("Test Group");
  await expect(mainPage.assetsPanel).toHaveScreenshot("group-components.png");
});

mainTest("AS-85 Components - rename group", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.createGroupFileLibraryGraphics("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.renameGroupFileLibrary("New Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupCreated("New Group");
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "group-components-renamed.png"
  );
});

mainTest("AS-88 Components - ungroup", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.createGroupFileLibraryGraphics("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.ungroupFileLibrary();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupRemoved();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-rectangle.png"
  );
});

mainTest("AS-90 Components - change view (list / tile)", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteLayerViaRightclick();
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteLayerViaRightclick();
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteLayerViaRightclick();
  await mainPage.clickAssetsTab();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-tile-view.png"
  );
  await mainPage.clickFileLibraryChangeViewButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-list-view.png"
  );
  await mainPage.clickFileLibraryChangeViewButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-tile-view.png"
  );
});
