const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { ColorPalettePopUp } = require("../../pages/workspace/color-palette-popup");
const { expect, test } = require("@playwright/test");

mainTest("CO-112 Create an ellipse from toolbar", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse.png");
});

mainTest("CO-114 Rename ellipse with valid name", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.doubleClickLayerOnLayersTab();
  await mainPage.renameCreatedLayer("renamed ellipse");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerNameDisplayed("renamed ellipse");
});

mainTest("CO-117 Add, hide, unhide, change type and delete Shadow to ellipse",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickAddShadowButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "ellipse-drop-shadow-default.png", {
        mask: [mainPage.guides]
      });
    await mainPage.hideShadow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "ellipse-drop-shadow-hide.png", {
        mask: [mainPage.guides]
      });
    await mainPage.unhideShadow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "ellipse-drop-shadow-unhide.png", {
        mask: [mainPage.guides]
      });
    await mainPage.selectTypeForShadow("Inner shadow");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "ellipse-inner-shadow-default.png", {
        mask: [mainPage.guides]
      });
    await mainPage.removeShadow();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "ellipse-inner-shadow-remove.png", {
        mask: [mainPage.guides]
      });
});

mainTest("CO-118 Add and edit Shadow to ellipse", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateEllipseButton();
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
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-drop-shadow.png");

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
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-inner-shadow.png");
});

mainTest("CO-119 Add, hide, unhide and delete Blur to ellipse",async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddBlurButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-blur-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.hideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-blur-hide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.unhideBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-blur-unhide.png", {
      mask: [mainPage.guides]
    });
  await mainPage.removeBlur();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-blur-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-120 Add and edit Blur to ellipse", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddBlurButton();
  await mainPage.changeValueForBlur("55");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-blur.png");
});

mainTest("CO-121 Add, edit and delete Stroke to ellipse", async ({ page }) => {
  test.setTimeout(45000);
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportByCoordinates(100, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddStrokeButton();
  await mainPage.clickViewportOnce();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-stroke-default.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeStrokeSettings('#43E50B','70', '13', 'Inside', 'Dotted');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-stroke-inside-dotted.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeStrokeSettings('#F5358F','80', '5', 'Outside', 'Dashed');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-stroke-outside-dashed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeStrokeSettings('#F5358F','100', '3', 'Center', 'Solid');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-stroke-center-solid.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeStrokeSettings('#F5358F','40', '4', 'Center', 'Mixed');
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-stroke-center-mixed.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.waitForChangeIsSaved();
  await mainPage.removeStroke();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "ellipse-stroke-remove.png", {
      mask: [mainPage.guides]
    });
});

mainTest("CO-126 Click 'Focus off' ellipse from shortcut F",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.focusLayerViaRightClickOnCanvas();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab("Ellipse", true);
  await mainPage.isFocusModeOn();
  await expect(page).toHaveScreenshot(
    "ellipse-single-focus-on.png", {
      mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton] ,
      maxDiffPixels: 5
    }
  );
  await mainPage.focusLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayerPresentOnLayersTab("Ellipse", true);
  await mainPage.isFocusModeOff();
  await expect(page).toHaveScreenshot(
    "ellipse-single-focus-off.png", {
      mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      maxDiffPixels: 5
    }
  );
});

mainTest("CO-136-1 Delete ellipse via rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-136-2 Delete ellipse via shortcut Del", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.deleteLayerViaShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("empty-canvas.png");
});

mainTest("CO-138 Add rotation to ellipse", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeRotationForLayer("90");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-rotated-90.png");
  await mainPage.changeRotationForLayer("120");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-rotated-120.png");
  await mainPage.changeRotationForLayer("45");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-rotated-45.png");
  await mainPage.changeRotationForLayer("360");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-rotated-359.png");
});

mainTest("CO-154 Transform ellipse to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.transformToPathViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("ellipse-to-path.png", {
    mask: [mainPage.usersSection, mainPage.guides],
  });
});

mainTest("CO-161 Selection to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.selectionToBoardViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("ellipse-to-board.png", {
    mask: [mainPage.guides]
  });
});
