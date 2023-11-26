const { dashboardTest } = require("../../fixtures");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");
const { test, expect } = require("@playwright/test");
const { random } = require("../../helpers/string-generator");
const { TeamPage } = require("../../pages/dashboard/team-page");

const teamName = random().concat('autotest');

test.beforeEach( async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.minimizeLibrariesAndTemplatesCarousel();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  await teamPage.deleteTeam(teamName);
});

dashboardTest("DA-128 Expand Libraries & Templates carousel",async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
    await dashboardPage.isLibrariesAndTemplatesSectionDisplayed();
  });

dashboardTest("DA-130 Flip Libraries & Templates carousel",async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.maximizeLibrariesAndTemplatesCarousel();
    await dashboardPage.flipLibrariesAndTemplatesCarousel('right', 3);
    await expect(dashboardPage.librariesAndTemplatesSection).toHaveScreenshot(
      "libraries-carousel-flipped-right.png"
    );
    await dashboardPage.flipLibrariesAndTemplatesCarousel('left', 3);
    await expect(dashboardPage.librariesAndTemplatesSection).toHaveScreenshot(
      "libraries-carousel-flipped-left.png"
    );
  });

dashboardTest(
  "DA-129 Minimize Libraries & Templates carousel",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
    await dashboardPage.isLibrariesAndTemplatesSectionDisplayed();
    await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
    await dashboardPage.isLibrariesAndTemplatesSectionHidden();
  }
);

