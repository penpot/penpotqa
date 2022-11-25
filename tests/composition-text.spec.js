const { mainTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");
const { expect } = require("@playwright/test");
const { ColorPalettePopUp } = require("../pages/color-palette-popup");

mainTest("CO-162 Create a text (toolbar)", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkHtmlOfCreatedLayer(
    '<text y="459" textLength="72.4375" lengthAdjust="spacingAndGlyphs" x="680" dominant-baseline="text-before-edge" style="text-transform: none; font-family: sourcesanspro; letter-spacing: normal; font-style: normal; font-weight: 400; white-space: pre; font-size: 14px; text-decoration: none solid rgb(0, 0, 0); direction: ltr; fill: rgb(0, 0, 0); fill-opacity: 1;">Hello World!</text>'
  );
  await expect(page).toHaveScreenshot("text.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-165 Add rotation to text", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("text-rotated-90.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("text-rotated-120.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("text-rotated-45.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("text-rotated-359.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-167 Add and edit Shadow to text", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
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
  await expect(page).toHaveScreenshot("text-drop-shadow.png", {
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
  await expect(page).toHaveScreenshot("text-inner-shadow.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-170 Add and edit Blur to text", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("text-blur.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-173-1 Delete text via rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("empty-canvas.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-173-2 Delete text via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("empty-canvas.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("CO-177 Rename text with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickCreatedLayerOnLayersPanel();
  await mainPage.renameCreatedLayer("renamed text");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed text");
});

mainTest(
  "CO-216 Change text color and opacity by typing color code",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePopUp = new ColorPalettePopUp(page);
    await mainPage.clickCreateTextButton();
    await mainPage.clickViewport();
    await mainPage.typeText("Hello World!");
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickFillColorIcon();
    await colorPalettePopUp.setHex("#304d6a");
    await mainPage.changeOpacityForFill("50");
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("text-fill-opacity.png", {
      mask: [mainPage.usersSection],
    });
  }
);

mainTest("CO-219 Selection to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.selectionToBoardViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("text-to-board.png", {
    mask: [mainPage.usersSection],
  });
});
