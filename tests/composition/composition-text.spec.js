const { mainTest } = require("../../fixtures");
const { expect, test } = require("@playwright/test");
const { MainPage } = require("../../pages/main-page");
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
  await mainPage.waitForChangeIsSaved();
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

mainTest("CO-166 Add, hide, unhide, change type and delete Shadow to Text",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.createDefaultTextLayer(browserName);
    await mainPage.clickAddShadowButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "text-drop-shadow-default.png", {
        mask: [mainPage.guides]
      });
    await mainPage.hideShadow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "text-drop-shadow-hide.png", {
        mask: [mainPage.guides]
      });
    await mainPage.unhideShadow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "text-drop-shadow-unhide.png", {
        mask: [mainPage.guides]
      });
    await mainPage.selectTypeForShadow("Inner shadow");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "text-inner-shadow-default.png", {
        mask: [mainPage.guides]
      });
    await mainPage.removeShadow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "text-inner-shadow-remove.png", {
        mask: [mainPage.guides]
      });
});

mainTest("CO-167 Add and edit Shadow to text",async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewportTwice();
  if (browserName === "webkit") {
    await mainPage.typeTextFromKeyboard();
  } else {
    await mainPage.typeText("Hello World!");
  }
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
});

mainTest("CO-169 Add, hide, unhide and delete Blur to text",async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.createDefaultTextLayer(browserName);
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddBlurButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-blur-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-blur-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-blur-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-blur-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-170 Add and edit Blur to text", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewportTwice();
  if (browserName === "webkit") {
    await mainPage.typeTextFromKeyboard();
  } else {
    await mainPage.typeText("Hello World!");
  }
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-blur.png");
});

mainTest("CO-171 Add, edit and delete Stroke to Text", async ({ page, browserName}) => {
  test.setTimeout(50000);
  const mainPage = new MainPage(page);
  await mainPage.createDefaultTextLayer(browserName);
  await mainPage.clickAddStrokeButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#43E50B','60', '10', 'Inside');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-inside-dotted.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','80', '5', 'Outside');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-outside-dashed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','100', '3', 'Center');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-center-solid.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','40', '4', 'Center');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-center-mixed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.removeStroke();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-remove.png", {
      mask: [mainPage.guides]
    });
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
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
    await mainPage.clickMoveButton();
    await mainPage.clickViewportTwice();
    await mainPage.deleteLayerViaRightClick();
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
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
    await mainPage.clickMoveButton();
    await mainPage.clickViewportOnce();
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
    await mainPage.doubleClickLayerOnLayersTab();
    await mainPage.renameCreatedLayer("renamed text");
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayerNameDisplayed("renamed text");
  }
);

mainTest("CO-209 Change text uppercase, lowercase",async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultTextLayer(browserName);
  await mainPage.changeTextCase("Upper");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-upper-case.png");
  await mainPage.changeTextCase("Title");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-title-case.png");
  await mainPage.changeTextCase("Lower");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-lower-case.png");
  await mainPage.changeTextCase("None");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-default-case.png");
});

mainTest("CO-210 Change alignment", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultTextLayer(browserName);
  await mainPage.changeHeightAndWidthForLayer("200", "200");
  await mainPage.changeTextAlignment("Middle");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-align-middle.png");
  await mainPage.changeTextAlignment("Bottom");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-align-bottom.png");
  await mainPage.changeTextAlignment("Top");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-align-top.png");
});

mainTest("CO-212 Change RTL/LTR",async ({ page, browserName}) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultTextLayer(browserName);
  await mainPage.changeTextDirection("RTL");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-rtl.png", {
    maxDiffPixelRatio: 0
  });
  await mainPage.changeTextDirection("LTR");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-ltr.png", {
    maxDiffPixelRatio: 0
  });
});

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
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.selectionToBoardViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-to-board.png", {
    mask: [mainPage.guides]
  });
});
