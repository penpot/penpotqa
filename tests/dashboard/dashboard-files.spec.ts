import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { random } from 'helpers/string-generator';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.hideLibrariesAndTemplatesCarrousel();
});

mainTest.afterEach(async () => {
  await teamPage.deleteTeam(teamName);
});

mainTest.describe('Drafts management', () => {
  mainTest(
    qase(
      [55, 57, 76],
      'Drafts: create a new file via title panel, open and delete it via right click',
    ),
    async () => {
      await mainTest.step(
        '(55) Create new file in Drafts on title panel',
        async () => {
          await dashboardPage.createFileViaTitlePanel();
          await mainPage.isMainPageLoaded();
          await mainPage.isProjectAndFileNameExistInFile('Drafts', 'New File 1');
          await mainPage.clickPencilBoxButton();
          await dashboardPage.checkNumberOfFiles('1 file');
        },
      );

      await mainTest.step('(57) Open file (in Drafts)', async () => {
        await dashboardPage.reloadPage();
        await dashboardPage.openFile();
        await mainPage.isMainPageLoaded();
        await mainPage.backToDashboardFromFileEditor();
      });

      await mainTest.step('(76) Delete file in Drafts via right click', async () => {
        await dashboardPage.deleteFileViaRightclick();
        await dashboardPage.isDeletedFileSuccessMessageVisible();
        await dashboardPage.waitSuccessMessageHidden();
        await dashboardPage.checkNumberOfFiles('0 files');
      });
    },
  );

  mainTest(
    qase(1913, 'Download Penpot file (.penpot) (in Drafts) via right click'),
    async () => {
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.clickPencilBoxButton();
      await dashboardPage.downloadFileViaRightClick();
    },
  );

  mainTest(qase(78, 'Create new project'), async () => {
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
  });
});

mainTest.describe('Files management', () => {
  mainTest.beforeEach(async () => {
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.createFileViaProjectPlaceholder();
    await mainPage.clickPencilBoxButton();
  });

  mainTest(
    qase(80, "Create a file in Project via 'New file' placeholder"),
    async () => {
      await dashboardPage.checkNumberOfFiles('1 file');
    },
  );

  mainTest(qase(1114, 'Rename file in Project'), async () => {
    await dashboardPage.renameFile('test_panel', false);
    await dashboardPage.renameFile('test_rightclick');
  });

  mainTest(qase(1115, 'Duplicate file in Project'), async () => {
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
    qase(
      [1119, 1120],
      'Add file as Shared Library in Project via right click and delete via right click',
    ),
    async () => {
      await mainTest.step(
        '(1119) Add file as Shared Library (in project) via rightclick',
        async () => {
          await dashboardPage.addFileAsSharedLibraryViaRightclick();
          await dashboardPage.isSharedLibraryIconDisplayed();
        },
      );

      await mainTest.step(
        '(1120) Remove file as Shared Library (in project)',
        async () => {
          await dashboardPage.deleteFileAsSharedLibraryViaRightclick();
          await dashboardPage.isSharedLibraryIconNotDisplayed();
        },
      );
    },
  );

  mainTest(
    qase(1119, 'Add file as Shared Library in Project via Options icon'),
    async () => {
      await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
      await dashboardPage.isSharedLibraryIconDisplayed();
    },
  );

  mainTest(
    qase(1121, 'Download Penpot file (.penpot) (in project) via right click'),
    async () => {
      await dashboardPage.downloadFileViaRightClick();
    },
  );

  mainTest(
    qase(1121, 'Download Penpot file (.penpot) (in project) via Options icon'),
    async () => {
      await dashboardPage.downloadFileViaOptionsIcon();
    },
  );

  mainTest(qase(1123, 'Delete file in Project via right click'), async () => {
    await dashboardPage.deleteFileViaRightclick();
    await dashboardPage.isDeletedFileSuccessMessageVisible();
    await dashboardPage.waitSuccessMessageHidden();
    await dashboardPage.checkNumberOfFiles('0 files');
  });

  mainTest(qase(1123, 'Delete file in Project via Options icon'), async () => {
    await dashboardPage.deleteFileViaOptionsIcon();
    await dashboardPage.isDeletedFileSuccessMessageVisible();
    await dashboardPage.waitSuccessMessageHidden();
    await dashboardPage.checkNumberOfFiles('0 files');
  });

  mainTest(qase(1138, 'Rename project via right click'), async () => {
    await dashboardPage.renameProjectViaRightClick(
      'Renamed new Project Via Right Click',
    );
  });

  mainTest(qase(1138, 'Rename project via Options icon'), async () => {
    await dashboardPage.renameProjectViaOptionsIcon(
      'New Renamed Project Via Options Icon',
    );
  });

  mainTest(qase(1139, 'Duplicate Project'), async () => {
    await dashboardPage.duplicateProjectViaRightclick();
    await dashboardPage.isHeaderDisplayed('Test Project (copy)');
    await dashboardPage.openSidebarItem('Projects');
    await dashboardPage.duplicateProjectViaOptionsIcon();
    await dashboardPage.isHeaderDisplayed('Test Project (copy) (copy)');
  });

  mainTest(qase(1146, 'Delete project via right click'), async () => {
    await dashboardPage.deleteProjectViaRightclick();
    await dashboardPage.isProjectTitleNotVisible('Test Project');
  });

  mainTest(qase(1146, 'Delete project via Options icon'), async () => {
    await dashboardPage.deleteProjectViaOptionsIcon();
    await dashboardPage.isProjectTitleNotVisible('Test Project');
  });
});

mainTest(qase([1140, 1141], 'Pin/Unpin project'), async () => {
  await mainTest.step('(1141) Pin project', async () => {
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.clickPinProjectButton();
    await dashboardPage.isPinUnpinButtonActive();
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.checkPinnedProjectsSidebarItem('Test Project');
  });

  await mainTest.step('(1140) Unpin project', async () => {
    await dashboardPage.clickPinProjectButton();
    await dashboardPage.isPinUnpinButtonInactive();
    await dashboardPage.checkPinnedProjectsSidebarItem(
      'Pinned projects will appear here',
      true,
    );
  });
});

mainTest(
  qase(
    2276,
    'Project and Library names with long names limited to 250 characters and truncated in the UI',
  ),
  async () => {
    const longName =
      'QTest Project With An Excessively Long Name To Check Overflow Test Project With An Excessively Long Name To Check Overflow';
    const longName250 =
      'QTest Project With An Excessively Long Name To Check Overflow Test Project With An Excessively Long Name To Check OverflowQTest Project With An Excessively Long Name To Check Overflow Test Project With An Excessively Project With An Excessively Exces';

    await mainTest.step(
      'Add new project, set name and assert truncation',
      async () => {
        await dashboardPage.clickAddProjectButton();
        await dashboardPage.setProjectName(longName);
        await dashboardPage.isProjectItemNameTruncated(longName);
      },
    );

    await mainTest.step(
      'Pin project and assert truncation from Pinned Projects sidebar',
      async () => {
        await dashboardPage.clickPinProjectButton();
        await dashboardPage.checkPinnedProjectsSidebarItem(longName);
        await dashboardPage.isPinnedProjectItemNameTruncated(longName);
      },
    );

    await mainTest.step(
      'Add second project with > 250 characters and assert name is = 250 characters',
      async () => {
        await dashboardPage.clickAddProjectButton();
        await dashboardPage.setProjectName(longName250 + '123');
        await dashboardPage.isProjectTitleDisplayed(longName250);
      },
    );

    await mainTest.step(
      'Add a library to the project and assert library name is truncated',
      async () => {
        await dashboardPage.createFileViaProjectPlaceholder();
        await mainPage.isMainPageLoaded();
        await mainPage.clickPencilBoxButton();
        await dashboardPage.addFileAsSharedLibraryViaOptionsIcon();
        await dashboardPage.isSharedLibraryIconDisplayed();
        await dashboardPage.openSidebarItem('Libraries');
        await dashboardPage.isFilePresent('New File 1');
        await dashboardPage.renameFile(longName250);
        await dashboardPage.isLibraryItemNameTruncated(longName250);
      },
    );
  },
);
