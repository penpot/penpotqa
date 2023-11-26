const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { test, expect} = require("@playwright/test");

test.beforeEach(async ({ page}) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
});

mainTest("PF-1 Set square grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "square-grid-default.png"
  );
});

mainTest("PF-2 Square grid - change size", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeSizeForGrid("8");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "square-grid-changed-size.png"
  );
});

mainTest("PF-3 Square grid - change opacity", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickGridActionsButton();
  await mainPage.changeOpacityForGrid("70");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "square-grid-changed-opacity.png"
  );
});

mainTest("PF-4 Use default square grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeSizeForGrid("8");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickGridActionsButton();
  await mainPage.clickUseDefaultGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "square-grid-default.png"
  );
});

mainTest("PF-6 Hide and unhide square grid via Design panel",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("square-grid-default.png");
  await mainPage.clickHideGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("square-grid-hide.png");
  await mainPage.clickUnhideGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("square-grid-unhide.png");
});

mainTest("PF-7 Hide and unhide square grid via Main menu",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("square-grid-default.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideGridsMainMenuSubItem();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("square-grid-hide.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowGridsMainMenuSubItem();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("square-grid-unhide.png");
});

mainTest("PF-11 Remove square grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickRemoveGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "board-without-grid.png"
  );
});

mainTest("PF-12 Set columns grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "columns-grid-default.png"
  );
});

mainTest("PF-13 Columns grid - change columns number", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("8");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "columns-grid-changed-columns.png"
  );
});

mainTest("PF-14 Columns grid - change width", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("3");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickGridActionsButton();
  await mainPage.changeWidthForGrid("10");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "columns-grid-changed-width.png"
  );
});

mainTest("PF-17 Columns grid - change opacity", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("columns-grid-default.png");
  await mainPage.clickGridActionsButton();
  await mainPage.changeOpacityForGrid("50");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("columns-grid-opacity-50.png");
  await mainPage.changeOpacityForGrid("100");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("columns-grid-opacity-100.png");
});

mainTest("PF-18 Use default columns grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("3");
  await mainPage.clickGridActionsButton();
  await mainPage.clickUseDefaultGridButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "columns-grid-default.png"
  );
});

mainTest("PF-20 Hide and unhide columns grid via Design panel", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("columns-grid-default.png");
  await mainPage.clickHideGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("columns-grid-hide.png");
  await mainPage.clickUnhideGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("columns-grid-unhide.png");
});

mainTest("PF-25 Remove columns grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickRemoveGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "board-without-grid.png"
  );
});

mainTest("PF-26 Set rows grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Rows");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-default.png");
});

mainTest("PF-27 Rows grid - change rows number", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Rows");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("12");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "rows-grid-changed-rows.png"
  );
});

mainTest("PF-28 Rows grid - change height",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Rows");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("3");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickGridActionsButton();
  await mainPage.changeHeightForGrid("20");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "rows-grid-changed-height.png"
  );
});

mainTest("PF-31 Rows grid - change opacity", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Rows");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-default.png");
  await mainPage.clickGridActionsButton();
  await mainPage.changeOpacityForGrid("50");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-opacity-50.png");
  await mainPage.changeOpacityForGrid("100");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-opacity-100.png");
});

mainTest("PF-32 Use default rows grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Rows");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("3");
  await mainPage.clickGridActionsButton();
  await mainPage.clickUseDefaultGridButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-default.png");
});

mainTest("PF-35 Hide and unhide rows grid via Main menu",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Rows");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-default.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideGridsMainMenuSubItem();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-hide.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowGridsMainMenuSubItem();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-unhide.png");
});

mainTest("PF-39 Remove rows grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickRemoveGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "board-without-grid.png"
  );
});
