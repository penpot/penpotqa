const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");
const { ColorPalettePopUp } = require("../../pages/color-palette-popup");

mainTest("CO-162 Create a text from toolbar", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewportTwice();
  if (browserName === "webkit") {
    await mainPage.typeTextFromKeyboard();
  } else {
    await mainPage.typeText("Hello World!");
  }
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot("text.png");
});

mainTest("CO-165 Add rotation to text", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewportTwice();
  if (browserName === "webkit") {
    await mainPage.typeTextFromKeyboard();
  } else {
    await mainPage.typeText("Hello World!");
  }
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-rotated-90.png");
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-rotated-120.png");
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-rotated-45.png");
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-rotated-359.png");
});

mainTest(
  "CO-167 Add and edit Shadow to text",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    const colorPalettePopUp = new ColorPalettePopUp(page);
    await mainPage.clickCreateTextButton();
    await mainPage.clickViewportTwice();
    if (browserName === "webkit") {
      await mainPage.typeTextFromKeyboard();
    } else {
      await mainPage.typeText("Hello World!");
    }
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
    await expect(mainPage.viewport).toHaveScreenshot("text-drop-shadow.png");
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
    await expect(mainPage.viewport).toHaveScreenshot("text-inner-shadow.png");
  }
);

mainTest("CO-170 Add and edit Blur to text", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewportTwice();
  if (browserName === "webkit") {
    await mainPage.typeTextFromKeyboard();
  } else {
    await mainPage.typeText("Hello World!");
  }
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-blur.png");
});

mainTest(
  "CO-173-1 Delete text via rightclick",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateTextButton();
    await mainPage.clickViewportTwice();
    if (browserName === "webkit") {
      await mainPage.typeTextFromKeyboard();
    } else {
      await mainPage.typeText("Hello World!");
    }
    await mainPage.isCreatedLayerVisible();
    await mainPage.clickMoveButton();
    await mainPage.clickViewportTwice();
    await mainPage.deleteLayerViaRightclick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
  }
);

mainTest(
  "CO-173-2 Delete text via shortcut Del",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateTextButton();
    await mainPage.clickViewportTwice();
    if (browserName === "webkit") {
      await mainPage.typeTextFromKeyboard();
    } else {
      await mainPage.typeText("Hello World!");
    }
    await mainPage.isCreatedLayerVisible();
    await mainPage.clickMoveButton();
    await mainPage.clickViewportTwice();
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
  }
);

mainTest(
  "CO-177 Rename text with valid name",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateTextButton();
    await mainPage.clickViewportTwice();
    if (browserName === "webkit") {
      await mainPage.typeTextFromKeyboard();
    } else {
      await mainPage.typeText("Hello World!");
    }
    await mainPage.waitForChangeIsSaved();
    await mainPage.doubleClickCreatedLayerOnLayersPanel();
    await mainPage.renameCreatedLayer("renamed text");
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayerNameDisplayed("renamed text");
  }
);

mainTest(
  "CO-216 Change text color and opacity by typing color code",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    const colorPalettePopUp = new ColorPalettePopUp(page);
    await mainPage.clickCreateTextButton();
    await mainPage.clickViewportTwice();
    if (browserName === "webkit") {
      await mainPage.typeTextFromKeyboard();
    } else {
      await mainPage.typeText("Hello World!");
    }
    await mainPage.clickFillColorIcon();
    await colorPalettePopUp.setHex("#304d6a");
    await mainPage.changeOpacityForFill("50");
    if (browserName === "webkit") {
      await mainPage.clickMoveButton();
    }
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickMoveButton();
    await mainPage.clickViewportTwice();
    await expect(mainPage.viewport).toHaveScreenshot("text-fill-opacity.png");
  }
);

mainTest("CO-219 Selection to board", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewportTwice();
  if (browserName === "webkit") {
    await mainPage.typeTextFromKeyboard();
  } else {
    await mainPage.typeText("Hello World!");
  }
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.selectionToBoardViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-to-board.png");
});
