import { mainTest } from '../../fixtures';
import { random } from '../../helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '../../pages/workspace/main-page';
import { TeamPage } from '../../pages/dashboard/team-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { TokensPage } from '../../pages/workspace/tokens/tokens-base-page';
import { BaseComponent } from '../../pages/base-component';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page }) => {
  const teamPage: TeamPage = new TeamPage(page);
  const dashboardPage: DashboardPage = new DashboardPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest.afterEach(async ({ page }) => {
  const mainPage = new MainPage(page);
  const teamPage = new TeamPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase(2213, 'Import tokens'), async ({ page }) => {
  const dashboardPage: DashboardPage = new DashboardPage(page);
  const mainPage: MainPage = new MainPage(page);
  const tokensPage: TokensPage = new TokensPage(page);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.toolsComp.clickOnTokenToolsButton();
  await tokensPage.toolsComp.importTokens('documents/tokens-example.json');
  await tokensPage.themesComp.checkSelectedTheme('2 active themes');
  await tokensPage.setsComp.isSetNameVisible('client_theme_template');
});

mainTest(qase(2221, 'Import .penpot file with tokens'), async ({ page }) => {
  const dashboardPage: DashboardPage = new DashboardPage(page);
  const tokensPage: TokensPage = new TokensPage(page);
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.importFileFromProjectPage(
    'documents/penpot-file-with-tokens.penpot',
  );
  await dashboardPage.isFilePresent('⚙️ Design Tokens Starter Set | Edited');
  await dashboardPage.openFileWithName('⚙️ Design Tokens Starter Set | Edited');
  await tokensPage.clickTokensTab();
  await tokensPage.themesComp.checkSelectedTheme('2 active themes');
  await tokensPage.setsComp.isSetNameVisible('client_theme_template');
});

mainTest(qase(2240, 'Error while importing a tokens file'), async ({ page }) => {
  const mainPage: MainPage = new MainPage(page);
  const dashboardPage: DashboardPage = new DashboardPage(page);
  const tokensPage: TokensPage = new TokensPage(page);
  const errorCount = 1;
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.toolsComp.clickOnTokenToolsButton();
  await tokensPage.toolsComp.importTokens(
    'documents/import-tokens-error-format.json',
  );
  await tokensPage.checkImportErrorMessage(`Import Error: Could not parse JSON.`);
  await tokensPage.closeModalWindow();
  await tokensPage.closeModalWindow();
  await tokensPage.isImportErrorMessageVisible(false);

  await tokensPage.toolsComp.clickOnTokenToolsButton();
  await tokensPage.toolsComp.importTokens(
    'documents/import-tokens-error-naming.json',
  );
  await tokensPage.checkImportErrorMessage(
    `Import Error: Invalid token name in JSON.`,
  );
  await tokensPage.expandDetailMessage();
  await tokensPage.toolsComp.checkImportTokenDetailErrorCount(errorCount);
  await tokensPage.closeModalWindow();
  await tokensPage.isImportErrorMessageVisible(false);
});

mainTest(
  qase(2293, 'Successful import of tokens file with validation errors'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const dashboardPage: DashboardPage = new DashboardPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const firstBadTokenName = 'dark.theme.accent.default';
    const errorCount = 18;
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.toolsComp.clickOnTokenToolsButton();
    await tokensPage.toolsComp.importTokens('documents/stitches-tokens.json');
    await tokensPage.tokensComp.expandSectionByName('Color');
    await tokensPage.tokensComp.isTokenVisibleWithName(firstBadTokenName);
    await tokensPage.tokensComp.checkInvalidTokenCount(errorCount);
  },
);

mainTest(qase(2252, 'Import tokens multifile folder'), async ({ page }) => {
  const mainPage: MainPage = new MainPage(page);
  const dashboardPage: DashboardPage = new DashboardPage(page);
  const tokensPage: TokensPage = new TokensPage(page);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.toolsComp.clickOnTokenToolsButton();
  await tokensPage.toolsComp.importTokensFolder('documents/tokens-folder-example');
  await tokensPage.themesComp.checkSelectedTheme('Mode / Light');
  await tokensPage.setsComp.isSetNameVisible('light');
  await tokensPage.setsComp.isSetNameVisible('dark');
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let dashboardPage: DashboardPage;
  let tokensPage: TokensPage;

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    dashboardPage = new DashboardPage(page);
    tokensPage = new TokensPage(page);

    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.toolsComp.clickOnTokenToolsButton();
  });

  mainTest(
    qase(2375, 'Import tokens .zip (with a single file inside)'),
    async () => {
      await tokensPage.toolsComp.importTokensZip('documents/tokens-single-file.zip');
      await tokensPage.themesComp.checkSelectedTheme('3 active themes');
      await tokensPage.setsComp.isSetNameVisible('client_theme_template');
    },
  );

  mainTest(qase(2376, 'Import tokens .zip (with a multifile inside)'), async () => {
    await tokensPage.toolsComp.importTokensZip('documents/tokens-multifile.zip');
    await tokensPage.themesComp.checkSelectedTheme('3 active themes');
    await tokensPage.setsComp.isSetNameVisible('client_theme_template');
  });

  mainTest(
    qase(
      2377,
      'Import tokens .zip (with a multifile inside) skipping not yet supported tokens',
    ),
    async ({ page }) => {
      const baseComp: BaseComponent = new BaseComponent(page);

      await tokensPage.toolsComp.importTokensZip(
        'documents/tokens-multifile-with-skipped-tokens.zip',
      );

      await tokensPage.checkImportErrorMessage(
        `Import was successful. Some tokens were not included.`,
      );
      await tokensPage.expandDetailMessage();
      await tokensPage.toolsComp.checkImportTokenDetailErrorCount(2);

      await baseComp.closeModalWindow();
      await tokensPage.isImportErrorMessageVisible(false);

      await page.waitForTimeout(1000);
    },
  );

  mainTest(qase(2384, 'Import tokens .zip (empty or invalid)'), async ({ page }) => {
    const tokensPage: TokensPage = new TokensPage(page);
    const baseComp: BaseComponent = new BaseComponent(page);

    await tokensPage.toolsComp.importTokensZip('documents/tokens-invalid.zip');
    await tokensPage.checkImportErrorMessage(
      `No tokens, sets, or themes were found in this file.`,
    );
    await baseComp.closeModalWindow();
    await baseComp.closeModalWindow();
    await tokensPage.isImportErrorMessageVisible(false);
  });
});

mainTest(
  qase(2361, 'Apply imported font size tokens'),
  async ({ page, browserName }) => {
    const mainPage: MainPage = new MainPage(page);
    const dashboardPage: DashboardPage = new DashboardPage(page);
    const assetsPanelPage: AssetsPanelPage = new AssetsPanelPage(page);
    const tokensPage: TokensPage = new TokensPage(page);

    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.toolsComp.clickOnTokenToolsButton();
    await tokensPage.toolsComp.importTokens(
      'documents/fluid-typescale-tokens-1.json',
    );
    await tokensPage.setsComp.clickOnSetCheckboxByName('fluid-typescale-tokens-1');
    await tokensPage.tokensComp.expandAllTokens();
    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.tokensComp.clickOnTokenWithName('font-scale.const.max.f0');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName('font-scale.const.max.f0');
    await mainPage.waitForResizeHandlerVisible();
    await assetsPanelPage.checkFontSize('18');
  },
);
