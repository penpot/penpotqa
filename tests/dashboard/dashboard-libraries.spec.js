const { dashboardTest } = require("../../fixtures");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");
const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.minimizeLibrariesAndTemplatesCarouselIfExpanded();
});

dashboardTest(
  "DA-128 Expand Libraries & Templates carousel",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
    await dashboardPage.isLibrariesAndTemplatesSectionDisplayed();
  }
);

dashboardTest(
  "DA-130 Flip Libraries & Templates carousel",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
    await dashboardPage.isLibrariesAndTemplatesSectionDisplayed();
    await dashboardPage.flipRightLibrariesAndTemplatesCarousel();
    await dashboardPage.flipRightLibrariesAndTemplatesCarousel();
    await dashboardPage.flipRightLibrariesAndTemplatesCarousel();
    await expect(dashboardPage.librariesAndTemplatesSection).toHaveScreenshot(
      "libraries-carousel-flipped-right.png"
    );
    await dashboardPage.flipLeftLibrariesAndTemplatesCarousel();
    await dashboardPage.flipLeftLibrariesAndTemplatesCarousel();
    await dashboardPage.flipLeftLibrariesAndTemplatesCarousel();
    await expect(dashboardPage.librariesAndTemplatesSection).toHaveScreenshot(
      "libraries-carousel-flipped-left.png"
    );
  }
);

dashboardTest(
  "DA-129 Minimize Libraries & Templates carousel",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
    await dashboardPage.isLibrariesAndTemplatesSectionDisplayed();
    await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
    await dashboardPage.isLibrariesAndTemplatesSectionNotDisplayed();
  }
);
