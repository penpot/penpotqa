const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { ColorPalettePopUp } = require("../../pages/workspace/color-palette-popup");
const { expect, test } = require("@playwright/test");
const { random } = require("../../helpers/string-generator");
const { TeamPage } = require("../../pages/dashboard/team-page");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");

const teamName = random().concat('autotest');

test.beforeEach( async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest("CO-59 Create a rectangle from toolbar", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot("rectangle.png");
});

mainTest("CO-68 Click 'Focus off' rectangle from shortcut F",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.focusLayerViaRightClickOnCanvas();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab("Rectangle", true);
  await mainPage.isFocusModeOn();
  await expect(page).toHaveScreenshot(
    "rectangle-single-focus-on.png", {
      mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      maxDiffPixels: 5
    }
  );
  await mainPage.focusLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab("Rectangle", true);
  await mainPage.isFocusModeOff();
  await expect(page).toHaveScreenshot(
    "rectangle-single-focus-off.png", {
      mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      maxDiffPixels: 5
    }
  );
});

mainTest("CO-69 Add, hide, unhide, change type and delete Shadow to rectangle",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddShadowButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-drop-shadow-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-drop-shadow-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-drop-shadow-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.selectTypeForShadow("Inner shadow");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-inner-shadow-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-inner-shadow-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-72 Add, hide, unhide and delete Blur to rectangle",async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddBlurButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-blur-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-blur-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-blur-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-blur-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-74 Add, edit and delete Stroke to rectangle",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddStrokeButton();
  await mainPage.clickViewportOnce();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-stroke-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#43E50B','60', '10', 'Inside', 'Dotted');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-stroke-inside-dotted.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','80', '5', 'Outside', 'Dashed');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-stroke-outside-dashed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','100', '3', 'Center', 'Solid');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-stroke-center-solid.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','40', '4', 'Center', 'Mixed');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-stroke-center-mixed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.removeStroke();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-stroke-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-80 Rename rectangle with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickLayerOnLayersTab();
  await mainPage.renameCreatedLayer("renamed rectangle");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed rectangle");
});

mainTest("CO-70 Add and edit Shadow to rectangle", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateRectangleButton();
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
  await mainPage.waitForChangeIsSaved();
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
  await mainPage.deleteLayerViaRightClick();
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
  await mainPage.waitForChangeIsSaved();
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
  await mainPage.transformToPathViaRightClick();
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
  await mainPage.selectionToBoardViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "rectangle-to-board.png", {
      mask: [mainPage.guides]
    });
});
