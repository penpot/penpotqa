const { dashboardTest } = require("../../fixtures");
const { DashboardPage } = require("../../pages/dashboard-page");
const { test } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickSidebarItem("Fonts");
  await dashboardPage.deleteFontsIfExist();
});

dashboardTest("DA-66 Upload single font", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickSidebarItem("Fonts");
  await dashboardPage.uploadFont("fonts/Pacifico.ttf");
  await dashboardPage.isFontUploaded("Pacifico", "Regular");
});

dashboardTest("DA-69 Search font", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickSidebarItem("Fonts");
  await dashboardPage.uploadFont("fonts/ArialTh.ttf");
  await dashboardPage.uploadFont("fonts/Allura-Regular.otf");
  await dashboardPage.searchFont("Arial Th");
});

dashboardTest("DA-71 Edit font", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickSidebarItem("Fonts");
  await dashboardPage.uploadFont("fonts/Allura-Regular.otf");
  await dashboardPage.isFontUploaded("Allura", "Regular");
  await dashboardPage.editFont("New Test Font");
});

dashboardTest("DA-72 Delete font", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickSidebarItem("Fonts");
  await dashboardPage.uploadFont("fonts/Pacifico.ttf");
  await dashboardPage.isFontUploaded("Pacifico", "Regular");
  await dashboardPage.deleteFont();
  await dashboardPage.isFontsTablePlaceholderDisplayed(
    "You still have no custom fonts installed."
  );
});
