const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { random } = require("../../helpers/string-generator");
const { test } = require("@playwright/test");
const { TeamPage } = require("../../pages/dashboard/team-page");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");

const teamName = random().concat("autotest");

test.beforeEach(async ({ page }) => {
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

mainTest("PF-179 Add export setting via design panel", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddExportButton();
  await mainPage.isExportElementButtonDisplayed("Export 1 element");
});

mainTest("PF-181 Remove export setting via design panel", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddExportButton();
  await mainPage.isExportElementButtonDisplayed("Export 1 element");
  await mainPage.clickRemoveExportButton();
  await mainPage.isExportElementButtonNotDisplayed();
});
