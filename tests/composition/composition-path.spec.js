const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");
const { ColorPalettePopUp } = require("../../pages/color-palette-popup");

mainTest("CO-272 Create Path from toolbar - closed", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot("path-closed.png");
});

mainTest("CO-274 Create Path from toolbar - opened", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot("path-opened.png");
});

mainTest("CO-277 Rename path with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickLayerOnLayersTab();
  await mainPage.renameCreatedLayer("renamed path");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed path");
});

mainTest("CO-280 Add and edit Shadow to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddShadowButton();
  await mainPage.clickShadowActionsButton();
  await mainPage.changeXForShadow("10");
  await mainPage.changeYForShadow("15");
  await mainPage.changeBlurForShadow("10");
  await mainPage.changeSpreadForShadow("20");
  await mainPage.changeOpacityForShadow("50");
  await mainPage.clickShadowColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-drop-shadow.png");
  await mainPage.selectTypeForShadow("Inner shadow");
  await mainPage.changeXForShadow("5");
  await mainPage.changeYForShadow("7");
  await mainPage.changeBlurForShadow("9");
  await mainPage.changeSpreadForShadow("12");
  await mainPage.changeOpacityForShadow("25");
  await mainPage.clickShadowColorIcon();
  await colorPalettePopUp.setHex("#96e637");
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-inner-shadow.png");
});

mainTest("CO-283 Add and edit Blur to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-blur.png");
});

mainTest("CO-297 Add rotation to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-rotated-90.png");
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-rotated-120.png");
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-rotated-45.png");
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-rotated-359.png");
});

mainTest("CO-298-1 Delete path via rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.deleteLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-298-2 Delete path via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-310 Flip Vertical and Flip Horizontal path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.flipVerticalViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-flipped-vertical.png");
  await mainPage.flipHorizontalViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-flipped-vertical-horizontal.png"
  );
  await mainPage.flipVerticalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-flipped-horizontal.png"
  );
  await mainPage.flipHorizontalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-non-flipped-jpeg.png");
});

mainTest("CO-322 Selection to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.selectionToBoardViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-to-board.png");
});
