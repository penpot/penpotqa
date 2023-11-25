const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { expect, test } = require("@playwright/test");
const { ColorPalettePopUp } = require("../../pages/workspace/color-palette-popup");
const { random } = require("../../helpers/string-generator");
const { TeamPage } = require("../../pages/dashboard/team-page");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");

const teamName = random().concat('autotest');

test.beforeEach( async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.deleteProjectsIfExist();
  await dashboardPage.deleteFilesIfExist();
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest("CO-220 Import JPEG image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot("image-jpeg.png");
});

mainTest("CO-221 Import PNG image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot("image-png.png");
});

mainTest("CO-222 Import GIF image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/giphy.gif");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
});

mainTest("CO-225 Rename image with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickLayerOnLayersTab();
  await mainPage.renameCreatedLayer("renamed image");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed image");
});

mainTest("CO-227 Add, hide, unhide, change type and delete Shadow to image",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddShadowButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-drop-shadow-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-drop-shadow-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-drop-shadow-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.selectTypeForShadow("Inner shadow");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-inner-shadow-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-inner-shadow-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-228 Add and edit Shadow to image", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewportTwice();
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
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-drop-shadow.png");
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
  await expect(mainPage.viewport).toHaveScreenshot("image-inner-shadow.png");
});

mainTest("CO-229 Add, hide, unhide and delete Blur to image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddBlurButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-blur-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-blur-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-blur-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-blur-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-231 Add, edit and delete Stroke to image",async ({ page }) => {
  test.setTimeout(45000);
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddStrokeButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-stroke-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.changeStrokeSettings('#43E50B','60', '10', 'Inside', 'Dotted');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-stroke-inside-dotted.png", {
      mask: [mainPage.guides]
    });
  await mainPage.changeStrokeSettings('#F5358F','80', '5', 'Outside', 'Dashed');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-stroke-outside-dashed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.changeStrokeSettings('#F5358F','100', '3', 'Center', 'Solid');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-stroke-center-solid.png", {
      mask: [mainPage.guides]
    });
  await mainPage.changeStrokeSettings('#F5358F','40', '4', 'Center', 'Mixed');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-stroke-center-mixed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeStroke();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-stroke-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-242-1 Delete image via rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-242-2 Delete image via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/giphy.gif");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-244 Change border radius multiple values", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickIndividualCornersRadiusButton();
  await mainPage.changeFirstCornerRadiusForLayer("30");
  await mainPage.changeSecondCornerRadiusForLayer("60");
  await mainPage.changeThirdCornerRadiusForLayer("90");
  await mainPage.changeFourthCornerRadiusForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-changed-corners.png");
  await mainPage.changeFirstCornerRadiusForLayer("0");
  await mainPage.changeSecondCornerRadiusForLayer("0");
  await mainPage.changeThirdCornerRadiusForLayer("0");
  await mainPage.changeFourthCornerRadiusForLayer("0");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-png.png");
});

mainTest("CO-245 Change border radius one value", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAllCornersRadiusButton();
  await mainPage.changeGeneralCornerRadiusForLayer("30");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-corners-30.png");
  await mainPage.changeGeneralCornerRadiusForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-corners-90.png");
  await mainPage.changeGeneralCornerRadiusForLayer("180");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-corners-180.png");
  await mainPage.changeGeneralCornerRadiusForLayer("0");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-corners-0.png");
});

mainTest("CO-412 Add rotation to image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-rotated-90.png");
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-rotated-120.png");
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-rotated-45.png");
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-rotated-359.png");
});

mainTest("CO-267 Selection to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.selectionToBoardViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("image-to-board.png");
});

mainTest("CO-259 Flip Vertical and Flip Horizontal image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.flipVerticalViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-flipped-vertical.png"
  );
  await mainPage.flipHorizontalViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-flipped-vertical-horizontal.png"
  );
  await mainPage.flipVerticalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-flipped-horizontal.png"
  );
  await mainPage.flipHorizontalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "image-non-flipped-jpeg.png"
  );
});
