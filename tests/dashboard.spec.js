// @ts-check
const { dashboardTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");
const { DashboardPage } = require("../pages/dashboard-page");

dashboardTest(
  "Create and open a file (in Drafts) via 'New file' placeholder",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFile();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.checkNumberOfFiles("1 file");
  }
);

dashboardTest("Rename file (in Drafts) via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFile();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFile("test");
});

dashboardTest("Duplicate file (in Drafts) via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFile();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.duplicateFile();
  await dashboardPage.isSuccessMessageDisplayed(
    "Your file has been duplicated successfully"
  );
  await page.reload();
  await dashboardPage.checkNumberOfFiles("2 files");
});

dashboardTest(
  "Add file as Shared Library (in Drafts) via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFile();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibrary();
    await dashboardPage.isSharedLibraryIconDisplayed();
  }
);

dashboardTest(
  "Remove file as Shared Library (in Drafts) via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFile();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibrary();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.deleteFileAsSharedLibrary();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  }
);

dashboardTest(
  "Download Penpot file (in Drafts) via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFile();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadPenpotFile();
  }
);

dashboardTest(
  "Download standard file (in Drafts) via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFile();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadStandardFile();
  }
);

dashboardTest("Delete file (in Drafts) via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFile();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteFile();
  await dashboardPage.checkNumberOfFiles("0 files");
});
