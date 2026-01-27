import { Page } from '@playwright/test';
import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DeletedPage } from '@pages/dashboard/dashboard-deleted-page';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import {
  setupViewerRoleUser,
  setupEditorRoleUser,
  setupAdminRoleUser,
} from 'helpers/user-flows';

const teamName: string = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let deletedPage: DeletedPage;

/* =========================================================
 * OWNER
 * ========================================================= */

mainTest.describe('As Owner', () => {
  mainTest.beforeEach(async ({ page }: { page: Page }) => {
    teamPage = new TeamPage(page);
    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);
    deletedPage = new DeletedPage(page);

    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.hideLibrariesAndTemplatesCarrousel();
  });

  mainTest.afterEach(async () => {
    await teamPage.deleteTeam(teamName);
  });

  mainTest(
    qase(
      [2692, 2709, 2687],
      'Restore file from Trash / Search excludes trashed files / Deleted empty state',
    ),
    async () => {
      const projectName = 'Test Project';
      const fileName = 'New File 1';

      await mainTest.step('Create project, file and delete it', async () => {
        await dashboardPage.clickAddProjectButton();
        await dashboardPage.setProjectName(projectName);
        await dashboardPage.isProjectByNameDisplayed(projectName);
        await dashboardPage.createFileViaTitlePanel();
        await mainPage.clickPencilBoxButton();
        await dashboardPage.deleteFileViaRightclick();
      });

      await mainTest.step(
        '(2709) Search a file that is in Trash: the files are excluded',
        async () => {
          await dashboardPage.fillSearchInput(fileName);
          await dashboardPage.isSearchResultMessageVisible(fileName, 10000);
        },
      );

      await mainTest.step(
        '(2692 / 2687) Click on Deleted tab, restore deleted file via options icon / Access "Deleted" section from the dashboard navigation - empty state',
        async () => {
          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.openDeletedTab();

          await deletedPage.isDeletedFileVisible(projectName, fileName);
          await deletedPage.restoreDeletedFileViaOptions(projectName, fileName);

          await dashboardPage.isRestoreAlertMessageVisible(fileName);
          await deletedPage.isEmptyTrashMessageVisible();

          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.isFilePresent(fileName);
        },
      );
    },
  );

  mainTest(qase([2705, 2713], 'Restore all trash / Clear all trash'), async () => {
    const projects = [
      { projectName: 'Test Project 1', fileName: 'New File 1' },
      { projectName: 'Test Project 2', fileName: 'New File 2' },
    ];

    for (const { projectName } of projects) {
      await mainTest.step(
        `Add project "${projectName}", create a file and delete it`,
        async () => {
          await dashboardPage.clickAddProjectButton();
          await dashboardPage.setProjectName(projectName);
          await dashboardPage.isProjectByNameDisplayed(projectName);
          await dashboardPage.createFileViaTitlePanel();
          await mainPage.clickPencilBoxButton();
          await dashboardPage.deleteProjectViaRightclick();
          await dashboardPage.isProjectTitleNotVisible(projectName);
        },
      );
    }

    await mainTest.step('(2713) Restore all trash (bulk)', async () => {
      await dashboardPage.openDeletedTab();

      for (const { projectName } of projects) {
        await deletedPage.isDeletedProjectVisible(projectName);
      }

      await deletedPage.restoreAllProjectsAndFiles();
      await deletedPage.isEmptyTrashMessageVisible();

      await dashboardPage.openSidebarItem('Projects');

      for (const { projectName } of projects) {
        await dashboardPage.isProjectByNameDisplayed(projectName);
      }
    });

    await mainTest.step('(2705) Clear all trash (bulk)', async () => {
      await dashboardPage.deleteProjectsIfExist();
      await dashboardPage.openDeletedTab();

      await deletedPage.deleteAllProjectsAndFilesForever();
      await deletedPage.isEmptyTrashMessageVisible();
    });
  });

  mainTest(
    qase(2712, 'Delete and restore file added as shared library'),
    async () => {
      const projectName = 'Test Project';
      const fileName = 'New File 1';

      await mainTest.step('Create shared library file and delete it', async () => {
        await dashboardPage.clickAddProjectButton();
        await dashboardPage.setProjectName(projectName);
        await dashboardPage.isProjectByNameDisplayed(projectName);
        await dashboardPage.createFileViaTitlePanel();
        await mainPage.clickPencilBoxButton();
        await dashboardPage.addFileAsSharedLibraryViaRightclick();
        await dashboardPage.deleteFileViaRightclick();
        await dashboardPage.isFileNotVisible(fileName);
      });

      await mainTest.step('Restore shared library file from Trash', async () => {
        await dashboardPage.openSidebarItem('Projects');
        await dashboardPage.openDeletedTab();

        await deletedPage.isDeletedFileVisible(projectName, fileName);
        await deletedPage.restoreDeletedFileViaOptions(projectName, fileName);

        await dashboardPage.isRestoreAlertMessageVisible(fileName);
        await dashboardPage.openSidebarItem('Projects');
        await dashboardPage.isFilePresentWithName(fileName);
        await dashboardPage.isSharedLibraryIconDisplayed();
      });
    },
  );
});

/* =========================================================
 * EDITOR
 * ========================================================= */

mainTest.describe('As Editor', () => {
  const projectName = 'Test Project';
  const fileName = 'New File 1';

  mainTest.beforeEach(async ({ page }) => {
    await setupEditorRoleUser(page);

    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);
    deletedPage = new DeletedPage(page);

    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.hideLibrariesAndTemplatesCarrousel();
  });

  mainTest(
    qase([2693, 2701], 'Restore and permanently delete file from Trash'),
    async () => {
      await mainTest.step(
        '(2693) Restore file from Trash (deleted project, editor user role)',
        async () => {
          await dashboardPage.clickAddProjectButton();
          await dashboardPage.setProjectName(projectName);
          await dashboardPage.isProjectByNameDisplayed(projectName);
          await dashboardPage.createFileViaTitlePanel();
          await mainPage.clickPencilBoxButton();
          await dashboardPage.deleteProjectViaOptionsIcon();

          await dashboardPage.openDeletedTab();

          await deletedPage.isDeletedFileVisible(projectName, fileName);
          await deletedPage.restoreDeletedFileViaOptions(projectName, fileName);

          await dashboardPage.isRestoreAlertMessageVisible(fileName);

          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.isFilePresent(fileName);
        },
      );

      await mainTest.step(
        '(2701) Permanent Delete file from Trash (editor user role)',
        async () => {
          await dashboardPage.deleteFileViaOptionsIcon();
          await dashboardPage.openDeletedTab();

          await deletedPage.isDeletedFileVisible(projectName, fileName);
          await deletedPage.deleteForeverDeletedFileViaOptions(
            projectName,
            fileName,
          );

          await dashboardPage.isDeleteAlertMessageVisible(fileName);
        },
      );
    },
  );
});

/* =========================================================
 * ADMIN
 * ========================================================= */

mainTest.describe('As Admin', () => {
  const projectName = 'Test Project';
  const fileName = 'New File 1';

  mainTest.beforeEach(async ({ page }) => {
    await setupAdminRoleUser(page);

    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);
    deletedPage = new DeletedPage(page);

    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.hideLibrariesAndTemplatesCarrousel();
  });

  mainTest(
    qase([2694, 2702], 'Restore and permanently delete project from Trash'),
    async () => {
      await mainTest.step(
        '(2694) Restore project from Trash (admin user role)',
        async () => {
          await dashboardPage.clickAddProjectButton();
          await dashboardPage.setProjectName(projectName);
          await dashboardPage.isProjectByNameDisplayed(projectName);
          await dashboardPage.createFileViaTitlePanel();
          await mainPage.clickPencilBoxButton();
          await dashboardPage.deleteProjectViaOptionsIcon();

          await dashboardPage.openDeletedTab();

          await deletedPage.isDeletedProjectVisible(projectName);
          await deletedPage.restoreDeletedProjectViaOptions(projectName);

          await dashboardPage.isRestoreAlertMessageVisible(fileName);

          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.isProjectByNameDisplayed(projectName);
        },
      );

      await mainTest.step(
        '(2702) Permanent Delete project from Trash (admin user role)',
        async () => {
          await dashboardPage.deleteProjectViaOptionsIcon();
          await dashboardPage.openDeletedTab();

          await deletedPage.isDeletedProjectVisible(projectName);
          await deletedPage.deleteForeverDeletedProjectViaOptions(projectName);

          await dashboardPage.isDeleteAlertMessageVisible(projectName);
        },
      );
    },
  );
});

/* =========================================================
 * VIEWER
 * ========================================================= */

mainTest.describe('As Viewer', () => {
  mainTest.beforeEach(async ({ page }) => {
    await setupViewerRoleUser(page);

    dashboardPage = new DashboardPage(page);

    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.hideLibrariesAndTemplatesCarrousel();
  });

  mainTest(qase(2697, 'Viewer cannot access trash'), async () => {
    await dashboardPage.isDeletedTabNotVisible();
  });
});
