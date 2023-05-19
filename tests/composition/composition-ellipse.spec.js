const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { ColorPalettePopUp } = require("../../pages/color-palette-popup");
const { expect } = require("@playwright/test");

mainTest("CO-112 Create an ellipse from toolbar", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse.png");
});

mainTest("CO-114 Rename ellipse with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickCreatedLayerOnLayersPanel();
  await mainPage.renameCreatedLayer("renamed ellipse");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed ellipse");
});

mainTest("CO-118 Add and edit Shadow to ellipse", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.clickAddShadowButton();
  await mainPage.clickShadowActionsButton();
  await mainPage.changeXForShadow("10");
  await mainPage.changeYForShadow("15");
  await mainPage.changeBlurForShadow("10");
  await mainPage.changeSpreadForShadow("20");
  await mainPage.changeOpacityForShadow("50");
  await mainPage.clickShadowColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-drop-shadow.png");

  await mainPage.selectTypeForShadow("Inner shadow");
  await mainPage.changeXForShadow("5");
  await mainPage.changeYForShadow("7");
  await mainPage.changeBlurForShadow("9");
  await mainPage.changeSpreadForShadow("12");
  await mainPage.changeOpacityForShadow("25");
  await mainPage.clickShadowColorIcon();
  await colorPalettePopUp.setHex("#96e637");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-inner-shadow.png");
});

mainTest("CO-120 Add and edit Blur to ellipse", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-blur.png");
});

mainTest("CO-136-1 Delete ellipse via rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-136-2 Delete ellipse via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-138 Add rotation to ellipse", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-rotated-90.png");
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-rotated-120.png");
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-rotated-45.png");
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-rotated-359.png");
});

mainTest("CO-154 Transform ellipse to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.transformToPathViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("ellipse-to-path.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-161 Selection to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.selectionToBoardViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-to-board.png");
});
