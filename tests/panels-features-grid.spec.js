const { mainTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");
const { expect } = require("@playwright/test");

mainTest("PF-1 Set square grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "square-grid-default.png"
  );
});

mainTest("PF-2 Square grid - change size", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeSizeForGrid("8");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "square-grid-changed-size.png"
  );
});

mainTest("PF-3 Square grid - change opacity", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickGridActionsButton();
  await mainPage.changeOpacityForGrid("70");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "square-grid-changed-opacity.png"
  );
});

mainTest("PF-4 Use default square grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeSizeForGrid("8");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickGridActionsButton();
  await mainPage.clickUseDefaultGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "square-grid-default.png"
  );
});

mainTest("PF-11 Remove square grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
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
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "columns-grid-default.png"
  );
});

mainTest("PF-13 Columns grid - change columns number", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("8");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "columns-grid-changed-columns.png"
  );
});

mainTest("PF-14 Columns grid - change width", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("3");
  await mainPage.clickGridActionsButton();
  await mainPage.changeWidthForGrid("10");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "columns-grid-changed-width.png"
  );
});

mainTest("PF-18 Use default columns grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("3");
  await mainPage.clickGridActionsButton();
  await mainPage.clickUseDefaultGridButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "columns-grid-default.png"
  );
});

mainTest("PF-25 Remove columns grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
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
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Rows");
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-default.png");
});

mainTest("PF-27 Rows grid - change rows number", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Rows");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("12");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "rows-grid-changed-rows.png"
  );
});

mainTest("PF-32 Use default rows grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Rows");
  await mainPage.waitForChangeIsSaved();
  await mainPage.changeColumnsOrRowsNumberForGrid("3");
  await mainPage.clickGridActionsButton();
  await mainPage.clickUseDefaultGridButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("rows-grid-default.png");
});

mainTest("PF-39 Remove rows grid", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddGridButton();
  await mainPage.selectGridType("Columns");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickRemoveGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "board-without-grid.png"
  );
});
