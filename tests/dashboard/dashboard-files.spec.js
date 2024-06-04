const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { random } = require('../../helpers/string-generator');
const { test } = require('@playwright/test');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest(qase(55,'DA-1 Create new file in Drafts on title panel'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.createFileViaTitlePanel();
  await mainPage.isMainPageLoaded();
  await mainPage.isProjectAndFileNameExistInFile('Drafts', 'New File 1');
  await mainPage.clickPencilBoxButton();
  await dashboardPage.checkNumberOfFiles('1 file');
});

mainTest(
  qase(56,"DA-2 Create new file in Drafts via 'New file' placeholder"),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.checkNumberOfFiles('1 file');
  },
);

mainTest(qase(57,'DA-3 Open file in Drafts'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.checkNumberOfFiles('1 file');
  await dashboardPage.reloadPage();
  await dashboardPage.openFile();
  await mainPage.isMainPageLoaded();
  await mainPage.backToDashboardFromFileEditor();
});

mainTest(qase(59,'DA-5 Rename file in Drafts via right click'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFile('test');
});

mainTest(qase(60,'DA-6 Rename file (in Drafts) via Options icon'), async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.renameFile('test', false);
  });

mainTest(qase(61,'DA-7 Duplicate file in Drafts via right click'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.duplicateFileViaRightclick();
  await dashboardPage.isSuccessMessageDisplayed(
    'Your file has been duplicated successfully',
  );
  await dashboardPage.waitSuccessMessageHidden();
  await dashboardPage.checkNumberOfFiles('2 files');
});

mainTest(
  qase(63,'DA-9 Add file as Shared Library in Drafts via right click'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  },
);

mainTest(
  qase(65,'DA-11 Remove file as Shared Library via Options icon in Drafts'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.isFilePresent('New File 1');
    await dashboardPage.openSidebarItem('Drafts');
    await dashboardPage.deleteFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
    await dashboardPage.openSidebarItem('Libraries');
    await dashboardPage.checkNoLibrariesExist();
  },
);

mainTest(
  qase(66,'DA-12 Remove file as Shared Library in Drafts via right click'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.deleteFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  },
);

mainTest(qase(67,'DA-13 Download Penpot file in Drafts via right click'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.downloadFileViaRightClick(false);
});

mainTest(
  qase(69,'DA-15 Download standard file in Drafts via right click'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadFileViaRightClick();
  },
);

mainTest(qase(71,'DA-17 Import file to Drafts .penpot'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.importFileFromProjectPage(
    'documents/QA test file.penpot',
  );
  await dashboardPage.isFilePresent('QA test file');
});

mainTest(qase(72,'DA-18 Import file to Drafts svg json'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.importFileFromProjectPage(
    'documents/QA test zip file.zip',
  );
  await dashboardPage.isFilePresent('Wireframing kit');
});

mainTest(qase(76,'DA-22 Delete file in Drafts via right click'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteFileViaRightclick();
  await dashboardPage.isSuccessMessageDisplayed(
    'Your file has been deleted successfully',
  );
  await dashboardPage.waitSuccessMessageHidden();
  await dashboardPage.checkNumberOfFiles('0 files');
});

mainTest(qase(78,'DA-24 Create new project'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
});

mainTest(
  qase(79,'DA-25 Create a file in Project via plus button on title panel'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaTitlePanel();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.checkNumberOfFiles('1 file');
  },
);

mainTest(
  qase(80,"DA-26 Create a file in Project via 'New file' placeholder"),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.checkNumberOfFiles('1 file');
  },
);

mainTest(qase(1114,'DA-28 Rename file in Project'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFile('test_panel', false);
  await dashboardPage.renameFile('test_rightclick');
});

mainTest(qase(1115,'DA-29 Duplicate file in Project'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.duplicateFileViaRightclick();
  await dashboardPage.isSuccessMessageDisplayed(
    'Your file has been duplicated successfully',
  );
  await dashboardPage.reloadPage();
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.checkNumberOfFiles('2 files');
  await dashboardPage.duplicateFileViaOptionsIcon();
  await dashboardPage.isSuccessMessageDisplayed(
    'Your file has been duplicated successfully',
  );
  await dashboardPage.reloadPage();
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.checkNumberOfFiles('3 files');
});

mainTest(
  qase(1119,'DA-33-1 Add file as Shared Library in Project via right click'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  },
);

mainTest(
  qase(1119,'DA-33-2 Add file as Shared Library in Project via Options icon'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
  },
);

mainTest(
  qase(1120,'DA-34-1 Remove file as Shared Library in Project via right click'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.deleteFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  },
);

mainTest(
  qase(1120,'DA-34-2 Remove file as Shared Library in Project via Options icon'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconDisplayed();
    await dashboardPage.reloadPage();
    await dashboardPage.deleteFileAsSharedLibraryViaOptionsIcon();
    await dashboardPage.isSharedLibraryIconNotDisplayed();
  },
);

mainTest(
  qase(1121,'DA-35-1 Download Penpot file in Project via right click'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadFileViaRightClick(false);
  },
);

mainTest(
  qase(1121,'DA-35-2 Download Penpot file in Project via Options icon'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadFileViaOptionsIcon(false);
  },
);

mainTest(
  qase(1122,'DA-36-1 Download standard file in Project via right click'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadFileViaRightClick();
  },
);

mainTest(
  qase(1122,'DA-36-2 Download standard file in Project via Options icon'),
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.clickPencilBoxButton();
    await dashboardPage.downloadFileViaOptionsIcon();
  },
);

mainTest(qase(1123,'DA-37-1 Delete file in Project via right click'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteFileViaRightclick();
  await dashboardPage.isSuccessMessageDisplayed(
    'Your file has been deleted successfully',
  );
  await dashboardPage.waitSuccessMessageHidden();
  await dashboardPage.checkNumberOfFiles('0 files');
});

mainTest(qase(1123,'DA-37-2 Delete file in Project via Options icon'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteFileViaOptionsIcon();
  await dashboardPage.isSuccessMessageDisplayed(
    'Your file has been deleted successfully',
  );
  await dashboardPage.waitSuccessMessageHidden();
  await dashboardPage.checkNumberOfFiles('0 files');
});

mainTest(qase(1138,'DA-52-1 Rename project via right click'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameProjectViaRightclick(
    'Renamed new Project Via Right Click',
  );
});

mainTest(qase(1138,'DA-52-2 Rename project via Options icon'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameProjectViaOptionsIcon(
    'New Renamed Project Via Options Icon',
  );
});

mainTest(qase(1139,'DA-53 Duplicate Project'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.duplicateProjectViaRightclick();
  await dashboardPage.isHeaderDisplayed('Test Project (copy)');
  await dashboardPage.openSidebarItem('Projects');
  await dashboardPage.duplicateProjectViaOptionsIcon();
  await dashboardPage.isHeaderDisplayed('Test Project (copy) (copy)');
});

mainTest(qase(1140,'DA-54 Unpin project'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.clickPinProjectButton();
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.checkPinnedProjectsSidebarItem('Test Project');
  await dashboardPage.clickUnpinProjectButton();
  await dashboardPage.checkPinnedProjectsSidebarItem(
    'Pinned projects will appear here',
  );
});

mainTest(qase(1141,'DA-55 Pin project'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.clickPinProjectButton();
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.clickUnpinProjectButton();
  await dashboardPage.checkPinnedProjectsSidebarItem(
    'Pinned projects will appear here',
  );
  await dashboardPage.clickPinProjectButton();
  await dashboardPage.checkPinnedProjectsSidebarItem('Test Project');
});

mainTest(qase(1145,'DA-59 Import file to project - fail invalid format'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.importFileWithInvalidFormat('images/images.png');
});

mainTest(qase(1146,'DA-60-1 Delete project via right click'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteProjectViaRightclick();
  await dashboardPage.isProjectTitleDisplayed('Drafts');
});

mainTest(qase(1146,'DA-60-2 Delete project via Options icon'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.deleteProjectViaOptionsIcon();
  await dashboardPage.isProjectTitleDisplayed('Drafts');
});

mainTest(qase(1148,'DA-62 Search file from Drafts'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFile('qwe');
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.search('qwe');
  await dashboardPage.isHeaderDisplayed('Search results');
  await dashboardPage.isFilePresent('qwe');
});

mainTest(qase(1149,'DA-63 Search file from Projects'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.renameFile('qaz');
  await dashboardPage.openSidebarItem('Projects');
  await dashboardPage.search('qaz');
  await dashboardPage.isHeaderDisplayed('Search results');
  await dashboardPage.isFilePresent('qaz');
});
