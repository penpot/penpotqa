const { dashboardTest } = require("../../fixtures");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");
const { test } = require("@playwright/test");
const { random } = require("../../helpers/string-generator");
const { TeamPage } = require("../../pages/dashboard/team-page");

const teamName = random().concat('autotest');

test.beforeEach( async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.deleteProjectsIfExist();
  await dashboardPage.deleteFilesIfExist();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  await teamPage.deleteTeam(teamName);
});

dashboardTest("DA-66 Upload single font", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem("Fonts");
  await dashboardPage.uploadFont("fonts/Pacifico.ttf");
  await dashboardPage.isFontUploaded("Pacifico", "Regular");
});

dashboardTest("DA-68 Fonts - upload fail invalid file format", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem("Fonts");
  await dashboardPage.uploadFontWithInvalidFormat("images/images.png");
});

dashboardTest("DA-69 Search font", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem("Fonts");
  await dashboardPage.uploadFont("fonts/ArialTh.ttf");
  await dashboardPage.uploadFont("fonts/Allura-Regular.otf");
  await dashboardPage.searchFont("Arial Th");
});

dashboardTest("DA-71 Edit font", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem("Fonts");
  await dashboardPage.uploadFont("fonts/Allura-Regular.otf");
  await dashboardPage.isFontUploaded("Allura", "Regular");
  await dashboardPage.editFont("New Test Font");
});

dashboardTest("DA-72 Delete font", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem("Fonts");
  await dashboardPage.uploadFont("fonts/Pacifico.ttf");
  await dashboardPage.isFontUploaded("Pacifico", "Regular");
  await dashboardPage.deleteFont();
  await dashboardPage.isFontsTablePlaceholderDisplayed(
    "Custom fonts you upload will appear here."
  );
});
