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
  await mainPage.createDefaultClosedPath();
  await mainPage.doubleClickLayerOnLayersTab();
  await mainPage.renameCreatedLayer("renamed path");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed path");
});

mainTest("CO-279 Add, hide, unhide, change type and delete Shadow to Path",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultOpenPath();
  await mainPage.clickAddShadowButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-drop-shadow-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-drop-shadow-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-drop-shadow-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.selectTypeForShadow("Inner shadow");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-inner-shadow-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-inner-shadow-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-280 Add and edit Shadow to path", async ({ page }) => {
  test.setTimeout(50000);
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.createDefaultOpenPath();
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

mainTest("CO-282 Add, hide, unhide and delete Blur to Path",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
  await mainPage.clickAddBlurButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-blur-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-blur-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-blur-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "path-blur-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-283 Add and edit Blur to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-blur.png");
});

mainTest("CO-297 Add rotation to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
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
  await mainPage.createDefaultClosedPath();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.deleteLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-298-2 Delete path via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-303 Hide and show path from rightclick and icons",async ({ page }) => {
  const mainPage = new MainPage(page);
  const path1 = "Path #1";
  const path2 = "Path #2";
  await mainPage.createDefaultClosedPath();
  await mainPage.doubleClickLayerOnLayersTabViaTitle("Path");
  await mainPage.renameCreatedLayer(path1);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(200, 300);
  await mainPage.clickViewportByCoordinates(300, 500);
  await mainPage.clickViewportByCoordinates(100, 200);
  await mainPage.clickViewportByCoordinates(200, 300);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickLayerOnLayersTabViaTitle("Path");
  await mainPage.renameCreatedLayer(path2);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportOnce();
  await mainPage.hideUnhideLayerByIconOnLayersTab(path1);
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot(
    "path-first-hide.png", { mask: [mainPage.guides, mainPage.usersSection] }
  );
  await mainPage.hideLayerViaRightClickOnLayersTab(path2);
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot(
    "path-second-hide.png", { mask: [mainPage.guides, mainPage.usersSection] }
  );
  await mainPage.hideUnhideLayerByIconOnLayersTab(path2);
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot(
    "path-second-show.png", { mask: [mainPage.guides, mainPage.usersSection] }
  );
  await mainPage.unHideLayerViaRightClickOnLayersTab(path1);
  await expect(page).toHaveScreenshot(
    "path-first-show.png", { mask: [mainPage.guides, mainPage.usersSection] }
  );
});

mainTest("CO-310 Flip Vertical and Flip Horizontal path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultClosedPath();
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
  await mainPage.createDefaultClosedPath();
  await mainPage.selectionToBoardViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("path-to-board.png");
});
