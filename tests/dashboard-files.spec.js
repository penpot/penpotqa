const { dashboardTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");
const { DashboardPage } = require("../pages/dashboard-page");

dashboardTest(
  "Create new file (in Drafts) via 'New file' placeholder",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.checkNumberOfFiles("1 file");
  }
);

dashboardTest("Open file (in Drafts)", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.checkNumberOfFiles("1 file");
  await page.reload();
  await dashboardPage.openFIle();
  await mainPage.isMainPageLoaded();
});

dashboardTest("Rename file (in Drafts) via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFileViaRightclick("test");
});

dashboardTest("Duplicate file (in Drafts) via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.duplicateFileViaRightclick();
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
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  }
);

dashboardTest(
  "Remove file as Shared Library (in Drafts) via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.deleteFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  }
);

dashboardTest(
  "Download Penpot file (in Drafts) via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadPenpotFileViaRightclick();
  }
);

dashboardTest(
  "Download standard file (in Drafts) via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadStandardFileViaRightclick();
  }
);

dashboardTest("Delete file (in Drafts) via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteFileViaRightclick();
  await dashboardPage.checkNumberOfFiles("0 files");
});

dashboardTest("Create new project ", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
});

dashboardTest(
  "Create and open a file (in Project) via '+' button on title panel",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaTitlePanel();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.checkNumberOfFiles("1 file");
  }
);

dashboardTest(
  "Create and open a file (in Project) via 'New file' placeholder",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.checkNumberOfFiles("1 file");
  }
);

dashboardTest("Rename file (in Project)", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFileViaOptionsIcon("test_panel");
  await dashboardPage.renameFileViaRightclick("test_rightclick");
});

dashboardTest("Duplicate file (in Project)", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.duplicateFileViaRightclick();
  await dashboardPage.isSuccessMessageDisplayed(
    "Your file has been duplicated successfully"
  );
  await page.reload();
  await dashboardPage.checkNumberOfFiles("2 files");
  await dashboardPage.duplicateFileViaOptionsIcon();
  await dashboardPage.isSuccessMessageDisplayed(
    "Your file has been duplicated successfully"
  );
  await page.reload();
  await dashboardPage.checkNumberOfFiles("3 files");
});

dashboardTest(
  "Add file as Shared Library (in Project) via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  }
);

dashboardTest(
  "Add file as Shared Library (in Project) via Options icon",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
  }
);

dashboardTest(
  "Remove file as Shared Library (in Project) via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.deleteFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  }
);

dashboardTest(
  "Remove file as Shared Library (in Project) via Options icon",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await page.reload();
    await dashboardPage.deleteFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  }
);

dashboardTest(
  "Download Penpot file (in Project) via rigthclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadPenpotFileViaRightclick();
  }
);

dashboardTest(
  "Download Penpot file (in Project) via Options icon",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadPenpotFileViaOptionsIcon();
  }
);

dashboardTest(
  "Download standard file (in Project) via rigthclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadStandardFileViaRightclick();
  }
);

dashboardTest(
  "Download standard file (in Project) via Options icon",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadStandardFileViaOptionsIcon();
  }
);

dashboardTest("Delete file (in Project) via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteFileViaRightclick();
  await dashboardPage.checkNumberOfFiles("0 files");
});

dashboardTest("Delete file (in Project) via Options icon", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteFileViaOptionsIcon();
  await dashboardPage.checkNumberOfFiles("0 files");
});

dashboardTest("Rename project", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameProjectViaOptionsIcon(
    "New Renamed Project Via Options Icon"
  );
  await dashboardPage.renameProjectViaRightclick(
    "Renamed new Project Via Right Click"
  );
});

dashboardTest("Duplicate Project", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.duplicateProjectViaRightclick();
  await dashboardPage.isHeaderDisplayed("TestProject (copy)");
  await dashboardPage.clickSidebarItem("Projects");
  await dashboardPage.duplicateProjectViaOptionsIcon();
  await dashboardPage.isHeaderDisplayed("TestProject (copy) (copy)");
});

dashboardTest("Unpin project", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.clickUnpinProjectButton();
  await dashboardPage.checkPinnedProjectsSidebarItem(
    "Pinned projects will appear here"
  );
});

dashboardTest("Pin project", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.clickUnpinProjectButton();
  await dashboardPage.checkPinnedProjectsSidebarItem(
    "Pinned projects will appear here"
  );
  await page.reload();
  await dashboardPage.clickPinProjectButton();
  await dashboardPage.checkPinnedProjectsSidebarItem("TestProject");
});

dashboardTest("Delete project via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteProjectViaRightclick();
  await dashboardPage.isProjectTitleDisplayed("Drafts");
});

dashboardTest("Delete project via Options icon", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteProjectViaOptionsIcon();
  await dashboardPage.isProjectTitleDisplayed("Drafts");
});

dashboardTest("Search file (from Drafts)", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFileViaRightclick("qwe");
  await dashboardPage.clickSidebarItem("Drafts");
  await dashboardPage.search("qwe");
  await dashboardPage.isHeaderDisplayed("Search results");
  await dashboardPage.isFileNameDisplayed("qwe");
});

dashboardTest("Search file (from Projects)", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFileViaRightclick("qaz");
  await dashboardPage.clickSidebarItem("Projects");
  await dashboardPage.search("qaz");
  await dashboardPage.isHeaderDisplayed("Search results");
  await dashboardPage.isFileNameDisplayed("qaz");
});
