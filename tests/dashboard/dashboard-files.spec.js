const { dashboardTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { DashboardPage } = require("../../pages/dashboard-page");

dashboardTest("DA-1 Create new file in Drafts on title panel",async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaTitlePanel();
  const mainPage = new MainPage(page);
  await mainPage.isMainPageLoaded();
  await mainPage.isProjectAndFileNameExistInFile("Drafts", "New File 1");
  await mainPage.clickPencilBoxButton();
  await dashboardPage.checkNumberOfFiles("1 file");
});

dashboardTest("DA-2 Create new file in Drafts via 'New file' placeholder", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.checkNumberOfFiles("1 file");
  }
);

dashboardTest("DA-3 Open file in Drafts", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.checkNumberOfFiles("1 file");
  await dashboardPage.reloadPage();
  await dashboardPage.openFile();
  await mainPage.isMainPageLoaded();
});

dashboardTest("DA-5 Rename file in Drafts via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFileViaRightclick("test");
});

dashboardTest(
  "DA-7 Duplicate file in Drafts via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.duplicateFileViaRightclick();
    await dashboardPage.isSuccessMessageDisplayed(
      "Your file has been duplicated successfully"
    );
    await dashboardPage.waitSuccessMessageHidden();
    await dashboardPage.checkNumberOfFiles("2 files");
  }
);

dashboardTest(
  "DA-9 Add file as Shared Library in Drafts via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  }
);

dashboardTest("DA-11 Remove file as Shared Library via Options icon in Drafts",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.isMainPageLoaded();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.openSidebarItem("Libraries");
    await dashboardPage.isFilePresent("New File 1");
    await dashboardPage.openSidebarItem("Drafts");
    await dashboardPage.deleteFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
    await dashboardPage.openSidebarItem("Libraries");
    await dashboardPage.checkNoLibrariesExist();
  });

dashboardTest(
  "DA-12 Remove file as Shared Library in Drafts via rightclick",
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
  "DA-13 Download Penpot file in Drafts via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadPenpotFileViaRightclick();
  }
);

dashboardTest(
  "DA-15 Download standard file in Drafts via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadStandardFileViaRightclick();
  }
);

dashboardTest("DA-17 Import file to Drafts .penpot", async ({page}) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem("Drafts");
  await dashboardPage.importFileFromProjectPage("documents/QA test file.penpot")
  await dashboardPage.isFilePresent("Wireframing kit"); // todo: issue 5596
  }
);

dashboardTest("DA-18 Import file to Drafts svgjson", async ({page}) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem("Drafts");
  await dashboardPage.importFileFromProjectPage("documents/QA test zip file.zip")
  await dashboardPage.isFilePresent("Wireframing kit"); // todo: issue 5597
});

dashboardTest(
  "DA-22 Delete file in Drafts via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.deleteFileViaRightclick();
    await dashboardPage.isSuccessMessageDisplayed("Your file has been deleted successfully");
    await dashboardPage.waitSuccessMessageHidden();
    await dashboardPage.checkNumberOfFiles("0 files");
  }
);

dashboardTest("DA-24 Create new project ", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
});

dashboardTest(
  "DA-25 Create a file in Project via plus button on title panel",
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
  "DA-26 Create a file in Project via 'New file' placeholder",
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

dashboardTest("DA-28 Rename file in Project", async ({ page }) => {
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

dashboardTest("DA-29 Duplicate file in Project", async ({ page }) => {
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
  await dashboardPage.reloadPage();
  await dashboardPage.isHeaderDisplayed("Projects");
  await dashboardPage.checkNumberOfFiles("2 files");
  await dashboardPage.duplicateFileViaOptionsIcon();
  await dashboardPage.isSuccessMessageDisplayed(
    "Your file has been duplicated successfully"
  );
  await dashboardPage.reloadPage();
  await dashboardPage.isHeaderDisplayed("Projects");
  await dashboardPage.checkNumberOfFiles("3 files");
});

dashboardTest(
  "DA-33-1 Add file as Shared Library in Project via rightclick",
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
  "DA-33-2 Add file as Shared Library in Project via Options icon",
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
  "DA-34-1 Remove file as Shared Library in Project via rightclick",
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
  "DA-34-2 Remove file as Shared Library in Project via Options icon",
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
    await dashboardPage.reloadPage();
    await dashboardPage.deleteFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  }
);

dashboardTest(
  "DA-35-1 Download Penpot file in Project via rigthclick",
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
  "DA-35-2 Download Penpot file in Project via Options icon",
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
  "DA-36-1 Download standard file in Project via rigthclick",
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
  "DA-36-2 Download standard file in Project via Options icon",
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

dashboardTest(
  "DA-37-1 Delete file in Project via rightclick",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.deleteFileViaRightclick();
    await dashboardPage.isSuccessMessageDisplayed("Your file has been deleted successfully");
    await dashboardPage.waitSuccessMessageHidden();
    await dashboardPage.checkNumberOfFiles("0 files");
  }
);

dashboardTest(
  "DA-37-2 Delete file in Project via Options icon",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName("TestProject");
    await dashboardPage.isProjectTitleDisplayed("TestProject");
    await dashboardPage.createFileViaPlaceholder();
    const mainPage = new MainPage(page);
    await mainPage.clickPencilBoxButton();
    await dashboardPage.deleteFileViaOptionsIcon();
    await dashboardPage.isSuccessMessageDisplayed("Your file has been deleted successfully");
    await dashboardPage.waitSuccessMessageHidden();
    await dashboardPage.checkNumberOfFiles("0 files");
  }
);

dashboardTest("DA-52-1 Rename project via rightclick", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameProjectViaRightclick(
    "Renamed new Project Via Right Click"
  );
});

dashboardTest("DA-52-2 Rename project via Options icon", async ({ page }) => {
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
});

dashboardTest("DA-53 Duplicate Project", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.duplicateProjectViaRightclick();
  await dashboardPage.isHeaderDisplayed("TestProject (copy)");
  await dashboardPage.openSidebarItem("Projects");
  await dashboardPage.duplicateProjectViaOptionsIcon();
  await dashboardPage.isHeaderDisplayed("TestProject (copy) (copy)");
});

dashboardTest("DA-54 Unpin project", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.checkPinnedProjectsSidebarItem("TestProject");
  await dashboardPage.clickUnpinProjectButton();
  await dashboardPage.checkPinnedProjectsSidebarItem(
    "Pinned projects will appear here"
  );
});

dashboardTest("DA-55 Pin project", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.clickUnpinProjectButton();
  await dashboardPage.checkPinnedProjectsSidebarItem(
    "Pinned projects will appear here"
  );
  await dashboardPage.clickPinProjectButton();
  await dashboardPage.checkPinnedProjectsSidebarItem("TestProject");
});

dashboardTest("DA-59 Import file to project - fail invalid format", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.openSidebarItem("Drafts");
    await dashboardPage.importFileWithInvalidFormat("images/images.png")
});

dashboardTest("DA-60-1 Delete project via rightclick", async ({ page }) => {
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

dashboardTest("DA-60-2 Delete project via Options icon", async ({ page }) => {
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

dashboardTest("DA-62 Search file from Drafts", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFileViaRightclick("qwe");
  await dashboardPage.openSidebarItem("Drafts");
  await dashboardPage.search("qwe");
  await dashboardPage.isHeaderDisplayed("Search results");
  await dashboardPage.isFilePresent("qwe");
});

dashboardTest("DA-63 Search file from Projects", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName("TestProject");
  await dashboardPage.isProjectTitleDisplayed("TestProject");
  await dashboardPage.createFileViaPlaceholder();
  const mainPage = new MainPage(page);
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFileViaRightclick("qaz");
  await dashboardPage.openSidebarItem("Projects");
  await dashboardPage.search("qaz");
  await dashboardPage.isHeaderDisplayed("Search results");
  await dashboardPage.isFilePresent("qaz");
});
