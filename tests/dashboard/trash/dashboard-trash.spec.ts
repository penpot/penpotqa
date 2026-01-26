import { Page } from '@playwright/test';
import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DeletedPage } from '@pages/dashboard/dashboard-deleted-page';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import { setupViewerRoleUser } from 'helpers/user-flows';
import { setupEditorRoleUser } from 'helpers/user-flows';
import { setupAdminRoleUser } from 'helpers/user-flows';

const teamName: string = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let deletedPage: DeletedPage;

mainTest.describe('As Owner', () => {
  mainTest.slow();

  mainTest.beforeEach('Create a new team', async ({ page }: { page: Page }) => {
    mainTest.slow();

    teamPage = new TeamPage(page);
    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);
    deletedPage = new DeletedPage(page);

    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.hideLibrariesAndTemplatesCarrousel();
  });

  mainTest.afterEach(async ({ page }: { page: Page }) => {
    deletedPage = new DeletedPage(page);
    await teamPage.deleteTeam(teamName);
  });

  mainTest(
    qase(
      [2692, 2709, 2687],
      'Restore file from Trash (existing project, owner user role) / Search a file that is in Trash: the files are excluded / Access "Deleted" section from the dashboard navigation - empty state',
    ),
    async () => {
      const projectName = 'Test Project';
      const fileName = 'New File 1';

      await mainTest.step(
        'Add a new project, create a file and delete it',
        async () => {
          await dashboardPage.clickAddProjectButton();
          await dashboardPage.setProjectName(projectName);
          await dashboardPage.isProjectByNameDisplayed(projectName);
          await dashboardPage.createFileViaTitlePanel();
          await mainPage.clickPencilBoxButton();
          await dashboardPage.deleteFileViaRightclick();
        },
      );

      await mainTest.step(
        '(2709) Search a file that is in Trash: the files are excluded',
        async () => {
          await dashboardPage.fillSearchInput(fileName);
          await dashboardPage.isSearchResultMessageVisible(fileName);
        },
      );

      await mainTest.step(
        '(2692) Click on Deleted tab, restore deleted file via options icon',
        async () => {
          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.openDeletedTab();
          await deletedPage.isDeletedFileVisible(projectName, fileName);
          await deletedPage.restoreDeletedFileViaOptions(projectName, fileName);
          await dashboardPage.isRestoreAlertMessageVisible(fileName);
          await deletedPage.isDeletedFileNotVisible(projectName, fileName);

          await mainTest.step(
            '(2687) Access "Deleted" section from the dashboard navigation - empty state',
            async () => {
              await deletedPage.isEmptyTrashMessageVisible();
            },
          );

          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.isFilePresent(fileName);
        },
      );
    },
  );

  mainTest(
    qase([2705, 2713], 'Restore all trash (bulk) / Clear all trash (bulk)'),
    async () => {
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
          await mainTest.step(`Assert "${projectName}" exists`, async () => {
            await deletedPage.isDeletedProjectVisible(projectName);
          });
        }

        await deletedPage.restoreAllProjectsAndFiles();

        for (const { projectName } of projects) {
          await mainTest.step(`Assert "${projectName}" not exists`, async () => {
            await deletedPage.isDeletedProjectNotVisible(projectName);
            // await deletedPage.waitForDeletedProjectNotVisible(projectName);
          });
        }

        await deletedPage.isEmptyTrashMessageVisible();
        await dashboardPage.openSidebarItem('Projects');

        for (const { projectName } of projects) {
          await mainTest.step(`Assert "${projectName}" exists`, async () => {
            await dashboardPage.isProjectByNameDisplayed(projectName);
          });
        }
      });

      await mainTest.step('Delete projects created', async () => {
        await dashboardPage.deleteProjectViaRightclick();
        await dashboardPage.deleteProjectViaRightclick();
      });

      await mainTest.step('(2705) Clear all trash (bulk) / ', async () => {
        await dashboardPage.openDeletedTab();
        await deletedPage.deleteAllProjectsAndFilesForever();

        for (const { projectName } of projects) {
          await mainTest.step(`Assert "${projectName}" not exists`, async () => {
            await deletedPage.isDeletedProjectNotVisible(projectName);
          });
        }

        await deletedPage.isEmptyTrashMessageVisible();
      });
    },
  );

  mainTest(
    qase(2712, 'Delete and restore file added as a shared library'),
    async () => {
      const projectName = 'Test Project';
      const fileName = 'New File 1';

      await mainTest.step(
        'Add a new project, create a file, add as Shared Library and delete it',
        async () => {
          await dashboardPage.clickAddProjectButton();
          await dashboardPage.setProjectName(projectName);
          await dashboardPage.isProjectByNameDisplayed(projectName);
          await dashboardPage.createFileViaTitlePanel();
          await mainPage.clickPencilBoxButton();
          await dashboardPage.addFileAsSharedLibraryViaRightclick();
          await dashboardPage.deleteFileViaRightclick();
          await dashboardPage.isFileNotVisible(fileName);
        },
      );

      await mainTest.step(
        'Click on Deleted tab, restore deleted file via options icon and assert is Shared Library',
        async () => {
          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.openDeletedTab();
          await deletedPage.isDeletedFileVisible(projectName, fileName);
          await deletedPage.restoreDeletedFileViaOptions(projectName, fileName);
          await dashboardPage.isRestoreAlertMessageVisible(fileName);
          await deletedPage.isDeletedFileNotVisible(projectName, fileName);
          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.isFilePresentWithName(fileName);
          await dashboardPage.isSharedLibraryIconDisplayed();
        },
      );
    },
  );
});

mainTest.describe('As Editor', () => {
  mainTest.slow();

  let setup;
  const projectName = 'Test Project';
  const fileName = 'New File 1';

  mainTest.beforeEach(
    'Set up Editor user: login with main account, create team, invite user with EDITOR role, register through invite and login as Editor ',
    async ({ page }) => {
      mainTest.slow();

      setup = await setupEditorRoleUser(page);

      teamPage = new TeamPage(page);
      dashboardPage = new DashboardPage(page);
      mainPage = new MainPage(page);
      deletedPage = new DeletedPage(page);

      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.hideLibrariesAndTemplatesCarrousel();
    },
  );

  mainTest(
    qase(
      [2693, 2701],
      'Restore file from Trash (deleted project, editor user role) / Permanent Delete file from Trash (editor user role)',
    ),
    async () => {
      await mainTest.step(
        '(2693) Restore file from Trash (deleted project, editor user role)',
        async () => {
          await mainTest.step('Create a new project and delete it', async () => {
            await dashboardPage.clickAddProjectButton();
            await dashboardPage.setProjectName(projectName);
            await dashboardPage.isProjectByNameDisplayed(projectName);
            await dashboardPage.createFileViaTitlePanel();
            await mainPage.clickPencilBoxButton();
            await dashboardPage.deleteProjectViaOptionsIcon();
          });

          await mainTest.step(
            'Click on Deleted tab and restore deleted file via options icon',
            async () => {
              await dashboardPage.openDeletedTab();
              await deletedPage.isDeletedFileVisible(projectName, fileName);
              // await deletedPage.waitForDeletedFileVisible(projectName, fileName);
              await deletedPage.restoreDeletedFileViaOptions(projectName, fileName);
              await dashboardPage.isRestoreAlertMessageVisible(fileName);
              await deletedPage.isDeletedFileNotVisible(projectName, fileName);
            },
          );

          await mainTest.step(
            'Navigate to Projects and verify the file is restored',
            async () => {
              await dashboardPage.openSidebarItem('Projects');
              await dashboardPage.isFilePresent(fileName);
            },
          );
        },
      );

      await mainTest.step(
        '(2701) Permanent Delete file from Trash (editor user role)',
        async () => {
          await mainTest.step('Delete a file', async () => {
            await dashboardPage.deleteFileViaOptionsIcon();
          });

          await mainTest.step(
            'Click on Deleted tab, assert file exists and delete forever via options menu',
            async () => {
              await dashboardPage.openDeletedTab();
              await deletedPage.isDeletedFileVisible(projectName, fileName);
              // await deletedPage.waitForDeletedFileVisible(projectName, fileName);
              await deletedPage.deleteForeverDeletedFileViaOptions(
                projectName,
                fileName,
              );
              await dashboardPage.isDeleteAlertMessageVisible(fileName);
              await deletedPage.isDeletedFileNotVisible(projectName, fileName);
              // await deletedPage.waitForDeletedFileNotVisible(projectName, fileName);
            },
          );
        },
      );
    },
  );
});

mainTest.describe('As Admin', () => {
  mainTest.slow();

  let setup;
  const projectName = 'Test Project';
  const fileName = 'New File 1';

  mainTest.beforeEach(
    'Set up Admin user: login with main account, create team, invite user with ADMIN role, register through invite and login as Admin ',
    async ({ page }) => {
      mainTest.slow();

      setup = await setupAdminRoleUser(page);

      teamPage = new TeamPage(page);
      dashboardPage = new DashboardPage(page);
      mainPage = new MainPage(page);
      deletedPage = new DeletedPage(page);

      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.hideLibrariesAndTemplatesCarrousel();
    },
  );

  mainTest(
    qase(
      [2694, 2702],
      'Restore project from Trash (admin user role) / Permanent Delete project from Trash (admin user role)',
    ),
    async () => {
      await mainTest.step(
        '(2694) Restore project from Trash (admin user role)',
        async () => {
          await mainTest.step('Create a new project and delete it', async () => {
            await dashboardPage.clickAddProjectButton();
            await dashboardPage.setProjectName(projectName);
            await dashboardPage.isProjectByNameDisplayed(projectName);
            await dashboardPage.createFileViaTitlePanel();
            await mainPage.clickPencilBoxButton();
            await dashboardPage.deleteProjectViaOptionsIcon();
          });

          await mainTest.step(
            'Click on Deleted tab, restore deleted project via options icon',
            async () => {
              await dashboardPage.openDeletedTab();
              await deletedPage.isDeletedProjectVisible(projectName);
              // await deletedPage.waitForDeletedProjectVisible(projectName);
              await deletedPage.restoreDeletedProjectViaOptions(projectName);
              await dashboardPage.isRestoreAlertMessageVisible(fileName);
              await deletedPage.isDeletedProjectNotVisible(projectName);
              // await deletedPage.waitForDeletedProjectNotVisible(projectName);
            },
          );

          await mainTest.step(
            'Navigate to Projects and verify project is restored',
            async () => {
              await dashboardPage.openSidebarItem('Projects');
              await dashboardPage.isProjectByNameDisplayed(projectName);
            },
          );
        },
      );

      await mainTest.step(
        '(2702) Permanent Delete project from Trash (admin user role)',
        async () => {
          await mainTest.step('Delete a project via options icon', async () => {
            await dashboardPage.deleteProjectViaOptionsIcon();
          });

          await mainTest.step(
            'Click on Deleted tab, assert project exists and delete forever via options menu',
            async () => {
              await dashboardPage.openDeletedTab();
              await deletedPage.isDeletedProjectVisible(projectName);
              // await deletedPage.waitForDeletedProjectVisible(projectName);
              await deletedPage.deleteForeverDeletedProjectViaOptions(projectName);
              await dashboardPage.isDeleteAlertMessageVisible(projectName);
              await deletedPage.isDeletedProjectNotVisible(projectName);
              // await deletedPage.waitForDeletedProjectNotVisible(projectName);
            },
          );
        },
      );
    },
  );
});

mainTest.describe('As Viewer', () => {
  mainTest.slow();

  let setup;

  mainTest.beforeEach(
    'Set up Viewer user: login with main account, create team, invite user with VIEWER role, register through invite and login as Viewer ',
    async ({ page }) => {
      mainTest.slow();

      setup = await setupViewerRoleUser(page);

      dashboardPage = new DashboardPage(page);

      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.hideLibrariesAndTemplatesCarrousel();
    },
  );

  mainTest(qase(2697, 'Viewer cannot access trash'), async () => {
    await dashboardPage.isDeletedTabNotVisible();
  });
});
