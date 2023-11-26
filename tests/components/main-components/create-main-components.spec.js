const { mainTest } = require("../../../fixtures");
const { MainPage } = require("../../../pages/main-page");
const { expect, test } = require("@playwright/test");
const { DashboardPage } = require("../../../pages/dashboard-page");
const { TeamPage } = require("../../../pages/team-page");
const { random } = require("../../../helpers/string-generator");

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.deleteProjectsIfExist();
  await dashboardPage.deleteFilesIfExist();
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest("Create component shape", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportByCoordinates(200, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.expandComponentsBlockOnAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "components-rectangle.png"
  );
});

mainTest("Drag a component from assets tab and drop into workspace", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportByCoordinates(200, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAssetsTab();
  await mainPage.isComponentAddedToFileLibraryComponents();
});
