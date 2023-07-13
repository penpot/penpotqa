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
  await mainPage.clickCanvasBackgroundColorIcon();
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
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-blur.png");
});

mainTest("CO-171 Add, edit and delete Stroke to Text", async ({ page, browserName}) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultTextLayer(browserName);
  await mainPage.clickAddStrokeButton();
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#43E50B','60', '10', 'Inside');
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-inside-dotted.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','80', '5', 'Outside');
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-outside-dashed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','100', '3', 'Center');
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-center-solid.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.changeStrokeSettings('#F5358F','40', '4', 'Center');
  await mainPage.clickViewportByCoordinates(200, 200);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "text-stroke-center-mixed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.removeStroke();
  await mainPage.clickViewportByCoordinates(200, 200);
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
    if (browserName === "webkit") {
      await mainPage.clickViewportTwice();
      await mainPage.typeTextFromKeyboard();
    } else {
      await mainPage.clickViewportOnce();
      await mainPage.typeText("Hello World!");
    }
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

// mainTest("CO-192 Hide and show text from rightclick and icon",
//   async ({ page, browserName }) => {
//     const mainPage = new MainPage(page);
//     const defaultText = "Hello World!";
//     const text1 = "Text Layer #1";
//     const text2 = "Text Layer #2";
//     await mainPage.createDefaultTextLayer(browserName);
//     await mainPage.doubleClickLayerOnLayersTabWithTitle(defaultText);
//     await mainPage.renameCreatedLayer(text1);
//     await mainPage.waitForChangeIsSaved();
//     await mainPage.createDefaultTextLayer(browserName, 400, 500);
//     await mainPage.doubleClickLayerOnLayersTabWithTitle(defaultText);
//     await mainPage.renameCreatedLayer(text2);
//     await mainPage.waitForChangeIsSaved();
//     await mainPage.hideUnhideLayerByIconOnLayersTab(text1);
//     await mainPage.waitForChangeIsSaved();
//     await expect(page).toHaveScreenshot(
//       "text-first-hide.png", { mask: [mainPage.guides, mainPage.usersSection] }
//     );
//     await mainPage.hideLayerViaRightClickOnCanvas(text2);
//     await mainPage.waitForChangeIsSaved();
//     await expect(page).toHaveScreenshot(
//       "text-second-hide.png", { mask: [mainPage.guides, mainPage.usersSection] }
//     );
//     await mainPage.hideUnhideLayerByIconOnLayersTab(text2);
//     await mainPage.waitForChangeIsSaved();
//     await expect(page).toHaveScreenshot(
//       "text-second-show.png", { mask: [mainPage.guides, mainPage.usersSection] }
//     );
//     await mainPage.unHideLayerViaRightClickOnLayersTab(text1);
//     await expect(page).toHaveScreenshot(
//       "text-first-show.png", { mask: [mainPage.guides, mainPage.usersSection] }
//     );
// });

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
  await mainPage.selectionToBoardViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("text-to-board.png");
});
