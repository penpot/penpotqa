const { mainTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");
const { expect } = require("@playwright/test");
const { ColorPalettePopUp } = require("../pages/color-palette-popup");

mainTest("CO-272 Create Path (Toolbar) - closed", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkHtmlOfCreatedLayer(
    '<path rx="0" ry="0" d="M196,152L896,652L696,352L196,152Z"></path>'
  );
  await expect(page).toHaveScreenshot("path-closed.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-274 Create Path (Toolbar) - opened", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkHtmlOfCreatedLayer(
    '<path rx="0" ry="0" d="M196,152L896,652L696,352"></path>'
  );
  await expect(page).toHaveScreenshot("path-opened.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-277 Rename path with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickCreatedLayerOnLayersPanel();
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
  await expect(page).toHaveScreenshot("path-drop-shadow.png", {
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
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-inner-shadow.png", {
    mask: [mainPage.usersSection],
  });
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
  await expect(page).toHaveScreenshot("path-blur.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-297 Add rotation to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewport();
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-rotated-90.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-rotated-120.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-rotated-45.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-rotated-359.png", {
    mask: [mainPage.usersSection],
  });
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
  await mainPage.deleteLayerViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("empty-canvas.png", {
    mask: [mainPage.usersSection],
  });
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
  await expect(page).toHaveScreenshot("empty-canvas.png", {
    mask: [mainPage.usersSection],
  });
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
  await mainPage.flipVerticalViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-flipped-vertical.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.flipHorizontalViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-flipped-vertical-horizontal.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.flipVerticalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-flipped-horizontal.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.flipHorizontalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-non-flipped-jpeg.png", {
    mask: [mainPage.usersSection],
  });
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
  await mainPage.selectionToBoardViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("path-to-board.png", {
    mask: [mainPage.usersSection],
  });
});
