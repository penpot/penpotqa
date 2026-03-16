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

mainTest(qase(71, 'Import file to Drafts .penpot'), async () => {
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.importFileFromProjectPage('documents/QA test file v1.penpot');
  await dashboardPage.isFilePresent('QA test file v1');
});

mainTest(qase(1145, 'Import file to project - fail invalid format'), async () => {
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.importFileWithInvalidFormat('images/images.png');
});

mainTest(qase(1919, 'Import file to project - new .penpot format'), async () => {
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.importFile('documents/QA new test file.penpot');
  await dashboardPage.isFilePresent('QA new test file');
});

mainTest(qase(2091, 'Import library from the web (by URL)'), async () => {
  const penpotFilesURL = 'https://penpot.github.io/penpot-files/';
  const useLibraryInPenpotURL = 'https://design.penpot.dev/#?template=';
  const libraryFileName = 'tutorial-for-beginners v.2.0.penpot';

  await dashboardPage.gotoLink(
    useLibraryInPenpotURL + penpotFilesURL + libraryFileName,
  );
  await dashboardPage.confirmFileImport();
  await dashboardPage.isFilePresent('tutorial-for-beginners v.2.0');
});

mainTest(qase(2264, 'Import (.penpot) file with new path format'), async () => {
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.importFile('documents/QA new path file.penpot');
  await dashboardPage.isFilePresent('New File 1');
});

mainTest(qase(2239, 'Import file to project - file upload error'), async () => {
  await dashboardPage.clickAddProjectButton();
  await dashboardPage.setProjectName('Test Project');
  await dashboardPage.isProjectTitleDisplayed('Test Project');
  await dashboardPage.importFileWithInvalidFile(
    'documents/hand-made-icons-by-cocomaterial.penpot',
  );
  await dashboardPage.isImportErrorDisplayed(
    'The following files have errors:Hand-Made Icons by cocomaterialFiles with errors will not be uploaded.',
  );
  await dashboardPage.clickOnModalAcceptButton();
});
