const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { ColorPalettePopUp } = require("../../pages/workspace/color-palette-popup");
const { expect, test } = require("@playwright/test");
const { random } = require("../../helpers/string-generator");
const { TeamPage } = require("../../pages/dashboard/team-page");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");

const teamName = random().concat('autotest');

test.beforeEach( async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest("PF-68 Add fill to board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.isFillHexCodeSet("FFFFFF");
  await mainPage.isFillOpacitySet("100");
  await expect(mainPage.createdLayer).toHaveScreenshot("board-fill.png");
});

mainTest("PF-69 Add fill to shape", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.isFillHexCodeSet("B1B2B5");
  await mainPage.isFillOpacitySet("100");
  await expect(mainPage.createdLayer).toHaveScreenshot("rectangle-fill.png");
});

mainTest("PF-72 Add fill to path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddFillButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await mainPage.isFillHexCodeSet("B1B2B5");
  await mainPage.isFillOpacitySet("100");
  await expect(mainPage.createdLayer).toHaveScreenshot("path-fill.png");
});

mainTest("PF-73 Change fill color for board", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#FF0000");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFillHexCodeSet("FF0000");
  await mainPage.isFillOpacitySet("100");
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "board-changed-fill.png"
  );
});

mainTest("PF-74 Change fill color for shape", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#FF0000");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFillHexCodeSet("FF0000");
  await mainPage.isFillOpacitySet("100");
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "rectangle-changed-fill.png"
  );
});

mainTest("PF-77 Change fill color for path", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddFillButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickFillColorIcon();
  await colorPalettePopUp.setHex("#FF0000");
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFillHexCodeSet("FF0000");
  await mainPage.isFillOpacitySet("100");
  await expect(mainPage.createdLayer).toHaveScreenshot("path-changed-fill.png");
});

mainTest("PF-78 Change fill opacity for board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.changeOpacityForFill("70");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFillHexCodeSet("FFFFFF");
  await mainPage.isFillOpacitySet("70");
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "board-changed-opacity.png"
  );
});

mainTest("PF-79 Change fill opacity for shape", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.changeOpacityForFill("70");
  await mainPage.clickViewportTwice();
  await mainPage.isFillHexCodeSet("B1B2B5");
  await mainPage.isFillOpacitySet("70");
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "rectangle-changed-opacity.png"
  );
});

mainTest("PF-82 Change fill opacity for path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddFillButton();
  await mainPage.changeOpacityForFill("70");
  await mainPage.clickMoveButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFillHexCodeSet("B1B2B5");
  await mainPage.isFillOpacitySet("70");
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "path-changed-opacity.png"
  );
});

mainTest("PF-93 Remove fill for board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickRemoveFillButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "board-removed-fill.png"
  );
});

mainTest("PF-94 Remove fill for shape", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickRemoveFillButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot(
    "rectangle--removed-fill.png"
  );
});

mainTest("PF-97 Remove fill for path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickAddFillButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickRemoveFillButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await expect(mainPage.createdLayer).toHaveScreenshot("path-removed-fill.png");
});
