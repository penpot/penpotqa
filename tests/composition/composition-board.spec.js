const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { ColorPalettePopUp } = require("../../pages/color-palette-popup");
const { expect } = require("@playwright/test");

mainTest("CO-1 Change color background", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCanvasBackgroundColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("color-background.png");
});

mainTest("CO-2 Create a board from toolbar", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-4 Rename board with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickCreatedBoardTitleOnCanvas();
  await mainPage.renameCreatedLayer("New test board");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isBoardNameDisplayed("New test board");
  await mainPage.doubleClickLayerOnLayersTab();
  await mainPage.renameCreatedLayer("renamed board");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isBoardNameDisplayed("renamed board");
});

mainTest("CO-9 Add, hide, unhide, change type and delete Shadow to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddShadowButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-drop-shadow-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-drop-shadow-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-drop-shadow-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.selectTypeForShadow("Inner shadow");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-inner-shadow-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeShadow();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-inner-shadow-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-10 Add and edit Shadow to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
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
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-drop-shadow.png", {
      mask: [mainPage.guides]
    });
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
    "board-inner-shadow.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-12 Add, hide, unhide and delete Blur to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCanvasBackgroundColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddBlurButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-blur-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-blur-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-blur-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-blur-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-13 Add and edit Blur to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-blur.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-14 Add, edit and delete Stroke to board",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(100, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddStrokeButton();
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-stroke-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeStrokeSettings('#43E50B','60', '10', 'Inside', 'Dotted');
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-stroke-inside-dotted.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','80', '5', 'Outside', 'Dashed');
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-stroke-outside-dashed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','100', '3', 'Center', 'Solid');
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-stroke-center-solid.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','40', '4', 'Center', 'Mixed');
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-stroke-center-mixed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.removeStroke();
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-stroke-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-25-1 Delete board via rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-25-2 Delete board via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-28 Add rotation to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("board-rotated-90.png");
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("board-rotated-120.png");
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("board-rotated-45.png");
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("board-rotated-359.png");
});

mainTest("CO-29 Change border radius multiple values", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickIndividualCornersRadiusButton();
  await mainPage.changeFirstCornerRadiusForLayer("30");
  await mainPage.changeSecondCornerRadiusForLayer("60");
  await mainPage.changeThirdCornerRadiusForLayer("90");
  await mainPage.changeFourthCornerRadiusForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("board-changed-corners.png");
  await mainPage.changeFirstCornerRadiusForLayer("0");
  await mainPage.changeSecondCornerRadiusForLayer("0");
  await mainPage.changeThirdCornerRadiusForLayer("0");
  await mainPage.changeFourthCornerRadiusForLayer("0");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-33 Zoom to board by double click board icon on the list",async ({ page }) => {
  const mainPage = new MainPage(page);
  const board1 = "Board #1";
  const board2 = "Board #2";
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(100, 150);
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickBoardTitleOnCanvas("Board");
  await mainPage.renameCreatedLayer(board1);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(250, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickBoardTitleOnCanvas("Board");
  await mainPage.renameCreatedLayer(board2);
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickLayerIconOnLayersTab(board1);
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-first-zoom.png", { mask: [mainPage.guides], }
  );
  await mainPage.doubleClickLayerIconOnLayersTab(board2);
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-second-zoom.png", { mask: [mainPage.guides] }
  );
});

mainTest("CO-34 Hide and show board from rightclick and icons",async ({ page }) => {
  const mainPage = new MainPage(page);
  const board1 = "Board #1";
  const board2 = "Board #2";
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(100, 150);
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickBoardTitleOnCanvas("Board");
  await mainPage.renameCreatedLayer(board1);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(250, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickBoardTitleOnCanvas("Board");
  await mainPage.renameCreatedLayer(board2);
  await mainPage.waitForChangeIsSaved();
  await mainPage.hideUnhideLayerByIconOnLayersTab(board1);
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot(
    "board-first-hide.png", { mask: [mainPage.guides, mainPage.usersSection] }
  );
  await mainPage.hideLayerViaRightClickOnCanvas(board2);
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot(
    "board-second-hide.png", { mask: [mainPage.guides, mainPage.usersSection] }
  );
  await mainPage.hideUnhideLayerByIconOnLayersTab(board2);
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot(
    "board-second-show.png", { mask: [mainPage.guides, mainPage.usersSection] }
  );
  await mainPage.unHideLayerViaRightClickOnLayersTab(board1);
  await expect(page).toHaveScreenshot(
    "board-first-show.png", { mask: [mainPage.guides, mainPage.usersSection] }
  );
});

mainTest("CO-53 Click 'Focus on' board from right click", async ({ page }) => {
  const mainPage = new MainPage(page);
  const board1 = "Board #1";
  const board2 = "Board #2";
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(100, 150);
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickBoardTitleOnCanvas("Board");
  await mainPage.renameCreatedLayer(board1);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(250, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickBoardTitleOnCanvas("Board");
  await mainPage.renameCreatedLayer(board2);
  await mainPage.waitForChangeIsSaved();

  await mainPage.focusBoardViaRightClickOnCanvas(board1);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab(board1, true);
  await mainPage.isLayerPresentOnLayersTab(board2, false);
  await mainPage.isFocusModeOn();
  await expect(page).toHaveScreenshot(
    "board-first-focus-on.png", { mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton] }
  );
  await mainPage.clickOnFocusModeLabel();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab(board1, true);
  await mainPage.isLayerPresentOnLayersTab(board2, true);
  await mainPage.isFocusModeOff();
  await expect(page).toHaveScreenshot(
    "board-focus-off.png", { mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton] }
  );

  await mainPage.focusLayerViaRightClickOnLayersTab(board2);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab(board1, false);
  await mainPage.isLayerPresentOnLayersTab(board2, true);
  await mainPage.isFocusModeOn();
  await expect(page).toHaveScreenshot(
    "board-second-focus-on.png", { mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton] }
  );
  await mainPage.clickOnFocusModeLabel();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab(board1, true);
  await mainPage.isLayerPresentOnLayersTab(board2, true);
  await mainPage.isFocusModeOff();
  await expect(page).toHaveScreenshot(
    "board-focus-off.png", { mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton] }
  );
});

mainTest("CO-56 Click 'Focus off' board from shortcut F",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.focusBoardViaRightClickOnCanvas("Board");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab("Board", true);
  await mainPage.isFocusModeOn();
  await expect(page).toHaveScreenshot(
    "board-single-focus-on.png", { mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton] }
  );
  await mainPage.focusLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab("Board", true);
  await mainPage.isFocusModeOff();
  await expect(page).toHaveScreenshot(
    "board-single-focus-off.png", { mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton] }
  );
});

mainTest("CO-411 Search board - ignore case", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickCreatedBoardTitleOnCanvas();
  await mainPage.renameCreatedLayer("Test");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isBoardNameDisplayed("Test");
  await mainPage.searchLayer("test");
  await mainPage.isLayerSearched("Test");
});
