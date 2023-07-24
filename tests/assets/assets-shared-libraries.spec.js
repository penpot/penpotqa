const { mainTest } = require("../../fixtures");
const { expect, test } = require("@playwright/test");
const { DashboardPage } = require("../../pages/dashboard-page");
const { MainPage } = require("../../pages/main-page");

test.describe(() => {
  test.beforeEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    const dashboardPage = new DashboardPage(page);
    await mainPage.backToDashboardFromFileEditor();
    await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
    await dashboardPage.isLibrariesAndTemplatesSectionDisplayed();
    await dashboardPage.flipRightLibrariesAndTemplatesCarousel();
    await dashboardPage.importSharedLibrary("Whiteboarding Kit");
    await dashboardPage.minimizeLibrariesAndTemplatesCarouselIfExpanded();
    await dashboardPage.reloadPage();
    await dashboardPage.openSecondFile("New File 1");
    await mainPage.isMainPageLoaded();
  });

  mainTest("AS-92 Import shared library from LIBRARIES pop-up",async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.clickLibrariesTab();
    await mainPage.clickAddSharedLibraryButton();
    await mainPage.clickCloseLibrariesPopUpButton();
    await mainPage.expandFileLibraryOnAccessPanel("Whiteboarding & mapping kit");
    await expect(mainPage.assetsPanel).toHaveScreenshot("imported-library.png");
  });

  mainTest("AS-93 Remove shared library from LIBRARIES pop-up",async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.clickLibrariesTab();
    await mainPage.clickAddSharedLibraryButton();
    await mainPage.clickCloseLibrariesPopUpButton();
    await mainPage.expandFileLibraryOnAccessPanel("Whiteboarding & mapping kit");
    await expect(mainPage.assetsPanel).toHaveScreenshot("imported-library.png");
    await mainPage.clickLibrariesTab();
    await mainPage.clickRemoveSharedLibraryButton();
    await mainPage.clickCloseLibrariesPopUpButton();
    await mainPage.isFileLibraryOnAccessPanelNotDisplayed("Whiteboarding & mapping kit");
    await expect(mainPage.assetsPanel).toHaveScreenshot("removed-library.png");
  });

  mainTest("AS-94 Search shared library in LIBRARIES pop-up", async ({ page }) => {
    const library1 = "Whiteboarding & mapping kit";
    const library2 = "CircumIcons";
    const mainPage = new MainPage(page);
    const dashboardPage = new DashboardPage(page);
    await mainPage.backToDashboardFromFileEditor();
    await dashboardPage.clickLibrariesAndTemplatesCarouselButton();
    await dashboardPage.isLibrariesAndTemplatesSectionDisplayed();
    await dashboardPage.flipRightLibrariesAndTemplatesCarousel();
    await dashboardPage.importSharedLibrary("Circum Icons pack");
    await dashboardPage.minimizeLibrariesAndTemplatesCarouselIfExpanded();
    await dashboardPage.reloadPage();
    await dashboardPage.openSecondFile("New File 1");
    await mainPage.isMainPageLoaded();
    await mainPage.clickAssetsTab();
    await mainPage.clickLibrariesTab();

    await mainPage.searchForLibrary("Circ");
    await mainPage.isLibraryFoundAfterSearch(library2, true);
    await mainPage.isLibraryFoundAfterSearch(library1, false);
    await mainPage.clearSearchLibraryInput();

    await mainPage.searchForLibrary(library1);
    await mainPage.isLibraryFoundAfterSearch(library2, false);
    await mainPage.isLibraryFoundAfterSearch(library1, true);
    await mainPage.clearSearchLibraryInput();

    await mainPage.searchForLibrary("uncreated library");
    await mainPage.isNoMatchedLibrariesFound("uncreated library");
  });
});

mainTest("AS-95 Publish Shared library",async ({ page }) => {
  const mainPage = new MainPage(page);
  const dashboardPage = new DashboardPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.uploadImageToFileLibraryGraphics("images/images.png");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isImageUploadedToFileLibraryGraphics();
  await mainPage.clickLibrariesTab();
  await mainPage.clickPublishSharedLibraryButton();
  await mainPage.isUnpublishLibraryBtnPresent();
  await mainPage.clickCloseLibrariesPopUpButton();
  await mainPage.isSharedLibraryBadgeVisible();
  await mainPage.backToDashboardFromFileEditor();
  await dashboardPage.openSidebarItem("Libraries");
  await dashboardPage.isFilePresent("New File 1");
});

mainTest("AS-96 Unpublish Shared library",async ({ page }) => {
  const mainPage = new MainPage(page);
  const dashboardPage = new DashboardPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.uploadImageToFileLibraryGraphics("images/images.png");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isImageUploadedToFileLibraryGraphics();
  await mainPage.clickLibrariesTab();
  await mainPage.clickPublishSharedLibraryButton();
  await mainPage.isUnpublishLibraryBtnPresent();
  await mainPage.clickCloseLibrariesPopUpButton();
  await mainPage.isSharedLibraryBadgeVisible();
  await mainPage.backToDashboardFromFileEditor();
  await dashboardPage.openSidebarItem("Libraries");
  await dashboardPage.isFilePresent("New File 1");

  await dashboardPage.openFile();
  await mainPage.clickAssetsTab();
  await mainPage.clickLibrariesTab();
  await mainPage.unPublishSharedLibrary();
  await mainPage.isPublishLibraryBtnPresent();
  await mainPage.clickCloseLibrariesPopUpButton();
  await mainPage.isSharedLibraryBadgeNotVisible();
  await mainPage.backToDashboardFromFileEditor();
  await dashboardPage.openSidebarItem("Libraries");
  await dashboardPage.checkNoLibrariesExist();
});

