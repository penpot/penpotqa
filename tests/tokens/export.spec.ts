import { mainTest } from '../../fixtures';
import { random } from '../../helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '../../pages/workspace/main-page';
import { TeamPage } from '../../pages/dashboard/team-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { TokensPage } from '../../pages/workspace/tokens/tokens-page';
import { BaseComponent } from '../../pages/base-component';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page }) => {
  const teamPage: TeamPage = new TeamPage(page);
  const dashboardPage: DashboardPage = new DashboardPage(page);
  const mainPage: MainPage = new MainPage(page);
  const tokensPage: TokensPage = new TokensPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.toolsComp.clickOnTokenToolsButton();
});

mainTest.afterEach(async ({ page }) => {
  const mainPage = new MainPage(page);
  const teamPage = new TeamPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(2266, 'Export tokens multifile folder (no token, set or theme)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    await tokensPage.toolsComp.clickOnExportButton();
    await tokensPage.toolsComp.clickOnMultipleFilesButton();
    await tokensPage.toolsComp.checkEmptyExportTabMessage();
    await mainPage.closeModalWindow();
    await tokensPage.toolsComp.isExportWindowClosed();
  },
);

mainTest(qase(2265, 'Export tokens multifile folder'), async ({ page }) => {
  const tokensPage: TokensPage = new TokensPage(page);
  const baseComp: BaseComponent = new BaseComponent(page);
  await tokensPage.toolsComp.importTokensFolder('documents/tokens-folder-example');
  await tokensPage.themesComp.checkSelectedTheme('Mode / Light');
  await tokensPage.toolsComp.clickOnTokenToolsButton();
  await tokensPage.toolsComp.clickOnExportButton();
  await tokensPage.toolsComp.clickOnMultipleFilesButton();
  await tokensPage.toolsComp.checkExportFileItemCount(4);
  await tokensPage.toolsComp.ifExportFileExists('mode/light.json');
  await tokensPage.toolsComp.ifExportFileExists('mode/dark.json');
  await tokensPage.toolsComp.exportToken();
  await tokensPage.toolsComp.isExportWindowClosed(false);
  await baseComp.clickOnCancelButton();
  await tokensPage.toolsComp.isExportWindowClosed(true);
});
