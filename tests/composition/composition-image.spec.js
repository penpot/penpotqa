const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");
const { ColorPalettePopUp } = require("../../pages/color-palette-popup");

mainTest("CO-220 Import JPEG image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkPartialHtmlOfCreatedLayer(
    '<rect rx="0" ry="0" x="360" y="247.5" transform="" width="640" height="426" fill='
  );
  await expect(page).toHaveScreenshot("image-jpeg.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-221 Import PNG image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkPartialHtmlOfCreatedLayer(
    '<rect rx="0" ry="0" x="528.5" y="395.5" transform="" width="303" height="130" fill='
  );
  await expect(page).toHaveScreenshot("image-png.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-222 Import GIF image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/giphy.gif");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkPartialHtmlOfCreatedLayer(
    '<rect rx="0" ry="0" x="547.5" y="361" transform="" width="265" height="199" fill='
  );
});

mainTest("CO-225 Rename image with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickCreatedLayerOnLayersPanel();
  await mainPage.renameCreatedLayer("renamed image");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed image");
});

mainTest("CO-228 Add and edit Shadow to image", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewport();
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
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-drop-shadow.png", {
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
  await expect(page).toHaveScreenshot("image-inner-shadow.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-242-1 Delete image via rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("empty-canvas.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-242-2 Delete image via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/giphy.gif");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("empty-canvas.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-244 Change border radius multiple values", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickIndividualCornersRadiusButton();
  await mainPage.changeFirstCornerRadiusForLayer("30");
  await mainPage.changeSecondCornerRadiusForLayer("60");
  await mainPage.changeThirdCornerRadiusForLayer("90");
  await mainPage.changeFourthCornerRadiusForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-changed-corners.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeFirstCornerRadiusForLayer("0");
  await mainPage.changeSecondCornerRadiusForLayer("0");
  await mainPage.changeThirdCornerRadiusForLayer("0");
  await mainPage.changeFourthCornerRadiusForLayer("0");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-default-corners.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-412 Add rotation to image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewport();
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-rotated-90.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-rotated-120.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-rotated-45.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-rotated-359.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-267 Selection to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.selectionToBoardViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-to-board.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-259 Flip Vertical and Flip Horizontal image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/sample.jpeg");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.flipVerticalViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-flipped-vertical.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.flipHorizontalViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-flipped-vertical-horizontal.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.flipVerticalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-flipped-horizontal.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.flipHorizontalViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("image-non-flipped-jpeg.png", {
    mask: [mainPage.usersSection],
  });
});
