const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { ColorPalettePopUp } = require("../../pages/color-palette-popup");
const { expect } = require("@playwright/test");

mainTest("CO-59 Create a rectangle from toolbar", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot("rectangle.png");
});

mainTest("CO-80 Rename rectangle with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickCreatedLayerOnLayersPanel();
  await mainPage.renameCreatedLayer("renamed rectangle");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed rectangle");
});

mainTest("CO-70 Add and edit Shadow to rectangle", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateRectangleButton();
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
  await expect(mainPage.viewport).toHaveScreenshot("rectangle-drop-shadow.png");
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
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-inner-shadow.png"
  );
});

mainTest("CO-73 Add and edit Blur to rectangle", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("rectangle-blur.png");
});

mainTest("CO-76-1 Delete rectangle via rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-76-2 Delete rectangle via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-62 Add rotation to rectangle", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("rectangle-rotated-90.png");
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("rectangle-rotated-120.png");
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("rectangle-rotated-45.png");
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("rectangle-rotated-359.png");
});

mainTest("CO-63 Change border radius multiple values", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickIndividualCornersRadiusButton();
  await mainPage.changeFirstCornerRadiusForLayer("30");
  await mainPage.changeSecondCornerRadiusForLayer("60");
  await mainPage.changeThirdCornerRadiusForLayer("90");
  await mainPage.changeFourthCornerRadiusForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-changed-corners.png"
  );
  await mainPage.changeFirstCornerRadiusForLayer("0");
  await mainPage.changeSecondCornerRadiusForLayer("0");
  await mainPage.changeThirdCornerRadiusForLayer("0");
  await mainPage.changeFourthCornerRadiusForLayer("0");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("rectangle.png");
});

mainTest("CO-104 Transform rectangle to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.transformToPathViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("rectangle-to-path.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-111 Selection to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.selectionToBoardViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("rectangle-to-board.png");
});
