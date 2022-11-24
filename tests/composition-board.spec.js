const { mainTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");
const { ColorPalettePopUp } = require("../pages/color-palette-popup");
const { expect } = require("@playwright/test");

mainTest("Change color background", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCanvasBackgroundColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("color-background.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Create a board (Toolbar)", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkHtmlOfCreatedLayer(
    '<rect rx="0" ry="0" x="630" y="410" transform="" width="100" height="100" class="frame-background" style="fill: rgb(255, 255, 255); fill-opacity: 1;"></rect>'
  );
  await expect(page).toHaveScreenshot("board.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Rename board with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickCreatedLayerTitleOnCanvas();
  await mainPage.renameCreatedLayer("New test board");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("New test board");
  await mainPage.doubleClickCreatedLayerOnLayersPanel();
  await mainPage.renameCreatedLayer("renamed board");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed board");
});

mainTest("Add and edit Shadow to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.clickAddShadowButton();
  await mainPage.clickShadowActionsButton();
  await mainPage.changeXForShadow("10");
  await mainPage.changeYForShadow("15");
  await mainPage.changeBlurForShadow("10");
  await mainPage.changeSpreadForShadow("20");
  await mainPage.changeOpacityForShadow("50");
  await mainPage.clickShadowColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("board-drop-shadow.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.selectTypeForShadow("Inner shadow");
  await mainPage.changeXForShadow("5");
  await mainPage.changeYForShadow("7");
  await mainPage.changeBlurForShadow("9");
  await mainPage.changeSpreadForShadow("12");
  await mainPage.changeOpacityForShadow("25");
  await mainPage.clickShadowColorIcon();
  await colorPalettePopUp.setHex("#96e637");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("board-inner-shadow.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Add and edit Blur to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("board-blur.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Delete board via rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("empty-canvas.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Delete board via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("empty-canvas.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Add rotation to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("board-rotated-90.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("board-rotated-120.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("board-rotated-45.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("board-rotated-359.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Change border radius multiple values", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickSingleCornerRadiusButton();
  await mainPage.changeFirstCornerRadiusForLayer("30");
  await mainPage.changeSecondCornerRadiusForLayer("60");
  await mainPage.changeThirdCornerRadiusForLayer("90");
  await mainPage.changeFourthCornerRadiusForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("board-changed-corners.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeFirstCornerRadiusForLayer("0");
  await mainPage.changeSecondCornerRadiusForLayer("0");
  await mainPage.changeThirdCornerRadiusForLayer("0");
  await mainPage.changeFourthCornerRadiusForLayer("0");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("board-default-corners.png", {
    mask: [mainPage.usersSection],
  });
});
