import { Page } from '@playwright/test';
import { mainTest } from '../../fixtures';
import { MainPage } from '../../pages/workspace/main-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { TeamPage } from '../../pages/dashboard/team-page';
import { random } from '../../helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import { DeletedPage } from '../../pages/dashboard/dashboard-deleted-page';
import { timeout } from 'playwright.config';

const teamName: string = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let deletedPage: DeletedPage;

mainTest.beforeEach('Create a new team', async ({ page }: { page: Page }) => {
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

mainTest.describe('As Owner - Deleted files (Trash)', () => {
  const projectName = 'Test Project';
  const fileName = 'New File 1';

  mainTest.beforeEach(
    'Create a new project, file and delete it',
    async ({ page }: { page: Page }) => {
      await dashboardPage.clickAddProjectButton();
      await dashboardPage.setProjectName(projectName);
      await dashboardPage.isProjectTitleDisplayed(projectName);
      await dashboardPage.createFileViaTitlePanel();
      await mainPage.clickPencilBoxButton();
      await dashboardPage.checkNumberOfFiles('1 file');
      await dashboardPage.deleteFileViaRightclick();
    },
  );

  mainTest(
    qase(2692, 'Restore file from Trash (existing project, owner user role)'),
    async ({ page }) => {
      await mainTest.step(
        'Open Deleted tab and restore deleted file via options icon',
        async () => {
          await dashboardPage.openDeletedTab();
          await deletedPage.isDeletedItemVisible(projectName, fileName);
          await deletedPage.restoreDeletedFile(projectName, fileName);
        },
      );

      await mainTest.step(
        'Navigate to Projects and verify the file is restored',
        async () => {
          await dashboardPage.isRestoreAlertMessageVisible(fileName);
          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.isFilePresent(fileName);
        },
      );
    },
  );
});
