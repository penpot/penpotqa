const { mainTest } = require("../../fixtures");
const { DashboardPage } = require("../../pages/dashboard-page");
const { expect, test } = require("@playwright/test");
const { MainPage } = require("../../pages/main-page");

test.beforeEach(async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.reloadPage();
  await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
  await dashboardPage.isLibrariesAndTemplatesSectionDisplayed();
  await dashboardPage.flipRightLibrariesAndTemplatesCarousel();
  await dashboardPage.importSharedLibrary("Whiteboarding Kit");
  await dashboardPage.minimizeLibrariesAndTemplatesCarouselIfExpanded();
  await dashboardPage.reloadPage();
  await dashboardPage.openSecondFile();
  await mainPage.isMainPageLoaded();
});

mainTest(
  "AS-92 Import shared library from LIBRARIES pop-up",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.clickLibrariesTab();
    await mainPage.clickAddSharedLibraryButton();
    await mainPage.clickCloseLibrariesPopUpButton();
    await mainPage.expandFileLibraryOnAccessPanel(
      "Whiteboarding & mapping kit"
    );
    await expect(mainPage.assetsPanel).toHaveScreenshot("imported-library.png");
  }
);

mainTest(
  "AS-93 Remove shared library from LIBRARIES pop-up",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.clickLibrariesTab();
    await mainPage.clickAddSharedLibraryButton();
    await mainPage.clickCloseLibrariesPopUpButton();
    await mainPage.expandFileLibraryOnAccessPanel(
      "Whiteboarding & mapping kit"
    );
    await expect(mainPage.assetsPanel).toHaveScreenshot("imported-library.png");
    await mainPage.clickLibrariesTab();
    await mainPage.clickRemoveSharedLibraryButton();
    await mainPage.clickCloseLibrariesPopUpButton();
    await mainPage.isFileLibraryOnAccessPanelNotDisplayed(
      "Whiteboarding & mapping kit"
    );
    await expect(mainPage.assetsPanel).toHaveScreenshot("removed-library.png");
  }
);
