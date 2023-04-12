const { expect } = require("@playwright/test");
const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");

mainTest.beforeEach(async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.changeHeightAndWidthForLayer("300", "300");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreatedBoardTitleOnCanvas();
});

mainTest("FL-1 Add flex layout to board from rightclick", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.addFlexLayoutViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayoutIconVisibleOnLayer();
  await mainPage.isLayoutMenuExpanded();
  await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
});

mainTest("FL-2 Add flex layout to board from shortcut", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.pressFlexLayoutShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayoutIconVisibleOnLayer();
  await mainPage.isLayoutMenuExpanded();
  await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
});

mainTest(
  "FL-4 Remove flex layout from board from rightclick",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.removeFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer(false);
    await mainPage.isLayoutMenuExpanded(false);
    await expect(mainPage.viewport).toHaveScreenshot(
      "board-without-layout.png"
    );
  }
);

mainTest(
  "FL-5 Remove flex layout from board from shortcut",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.pressFlexLayoutShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.pressFlexLayoutShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer(false);
    await mainPage.isLayoutMenuExpanded(false);
    await expect(mainPage.viewport).toHaveScreenshot(
      "board-without-layout.png"
    );
  }
);

mainTest(
  "FL-6 Remove flex layout from board from Design panel",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.pressFlexLayoutShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.removeLayoutFromDesignPanel();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer(false);
    await mainPage.isLayoutMenuExpanded(false);
    await expect(mainPage.viewport).toHaveScreenshot(
      "board-without-layout.png"
    );
  }
);

mainTest("FL-7 Change direction", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.pressFlexLayoutShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayoutIconVisibleOnLayer();
  await mainPage.isLayoutMenuExpanded();
  await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeLayoutDirection("Row reverse");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "layout-row-reverse-direction.png"
  );
  await mainPage.changeLayoutDirection("Column");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "layout-column-direction.png"
  );
  await mainPage.changeLayoutDirection("Column reverse");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "layout-column-reverse-direction.png"
  );
  await mainPage.changeLayoutDirection("Row");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-row-direction.png");
});

mainTest("FL-9 Change alignment", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.pressFlexLayoutShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayoutIconVisibleOnLayer();
  await mainPage.isLayoutMenuExpanded();
  await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeLayoutAlignment("Center");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-align-center.png");
  await mainPage.changeLayoutAlignment("End");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-align-end.png");
  await mainPage.changeLayoutAlignment("Start");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-align-start.png");
});

mainTest("FL-10 Change justification", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.pressFlexLayoutShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayoutIconVisibleOnLayer();
  await mainPage.isLayoutMenuExpanded();
  await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeLayoutJustification("Center");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-justify-center.png");
  await mainPage.changeLayoutJustification("End");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-justify-end.png");
  await mainPage.changeLayoutJustification("Space between");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "layout-justify-space-between.png"
  );
  await mainPage.changeLayoutJustification("Space around");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "layout-justify-space-around.png"
  );
  await mainPage.changeLayoutJustification("Space evenly");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "layout-justify-space-evenly.png"
  );
  await mainPage.changeLayoutJustification("Start");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-justify-start.png");
});

mainTest("FL-12 Change column gap", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.pressFlexLayoutShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayoutIconVisibleOnLayer();
  await mainPage.isLayoutMenuExpanded();
  await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeLayoutColumnGap("5");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-column-gap-5.png");
  await mainPage.changeLayoutColumnGap("15");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-column-gap-15.png");
  await mainPage.changeLayoutColumnGap("0");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-column-gap-0.png");
});

mainTest("FL-13 Change row gap", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.pressFlexLayoutShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayoutIconVisibleOnLayer();
  await mainPage.isLayoutMenuExpanded();
  await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeLayoutDirection("Column");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeLayoutRowGap("5");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-row-gap-5.png");
  await mainPage.changeLayoutRowGap("15");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-row-gap-15.png");
  await mainPage.changeLayoutRowGap("0");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-row-gap-0.png");
});

mainTest("FL-14 Change single padding", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.pressFlexLayoutShortcut();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isLayoutIconVisibleOnLayer();
  await mainPage.isLayoutMenuExpanded();
  await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
  await mainPage.clickCreatedBoardTitleOnCanvas();
  await mainPage.changeLayoutVerticalPadding("5");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeLayoutHorizontalPadding("15");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot("layout-padding-5-15.png");
  await mainPage.changeLayoutHorizontalPadding("0");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "layout-horizontal_padding-0.png"
  );
  await mainPage.changeLayoutVerticalPadding("0");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot(
    "layout-vertical_padding-0.png"
  );
});
