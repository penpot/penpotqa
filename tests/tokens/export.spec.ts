import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { BaseComponent } from '@pages/base-component';

const teamName = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.toolsComp.clickOnTokenToolsButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(2266, 'Export tokens multi-file folder (no token, set or theme)'),
  async () => {
    await mainTest.step(
      'Open export multi-file modal and verify empty message',
      async () => {
        await tokensPage.toolsComp.clickOnExportButton();
        await tokensPage.toolsComp.clickOnMultipleFilesButton();
        await tokensPage.toolsComp.checkEmptyExportTabMessage();
      },
    );

    await mainTest.step(
      'Close modal and verify export window is closed',
      async () => {
        await mainPage.closeModalWindow();
        await tokensPage.toolsComp.isExportWindowClosed();
      },
    );
  },
);

mainTest(qase(2265, 'Export tokens multi-file folder'), async ({ page }) => {
  const baseComp: BaseComponent = new BaseComponent(page);

  await mainTest.step(
    'Import tokens folder and verify theme is active',
    async () => {
      await tokensPage.toolsComp.importTokensFolder(
        'documents/tokens-folder-example',
      );
      await tokensPage.themesComp.checkSelectedTheme('Mode / Light');
    },
  );

  await mainTest.step(
    'Open export multi-file modal and verify files list',
    async () => {
      await tokensPage.toolsComp.clickOnTokenToolsButton();
      await tokensPage.toolsComp.clickOnExportButton();
      await tokensPage.toolsComp.clickOnMultipleFilesButton();
      await tokensPage.toolsComp.checkExportFileItemCount(4);
      await tokensPage.toolsComp.ifExportFileExists('mode/light.json');
      await tokensPage.toolsComp.ifExportFileExists('mode/dark.json');
    },
  );

  await mainTest.step('Export and cancel the download dialog', async () => {
    await tokensPage.toolsComp.exportToken();
    await tokensPage.toolsComp.isExportWindowClosed(false);
    await baseComp.clickOnCancelButton();
    await tokensPage.toolsComp.isExportWindowClosed(true);
  });
});
