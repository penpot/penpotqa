import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { BaseComponent } from '@pages/base-component';

let tokensPage: TokensPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.toolsComp.clickOnTokenToolsButton();
});

mainAccountFileTest(
  qase([2265], 'Export tokens multi-file folder'),
  async ({ page }) => {
    const baseComp: BaseComponent = new BaseComponent(page);

    await mainAccountFileTest.step(
      'Import tokens folder and verify theme is active',
      async () => {
        await tokensPage.toolsComp.importTokensFolder(
          'documents/tokens-folder-example',
        );
        await tokensPage.themesComp.checkSelectedTheme('Mode / Light');
      },
    );

    await mainAccountFileTest.step(
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

    await mainAccountFileTest.step(
      'Export and cancel the download dialog',
      async () => {
        await tokensPage.toolsComp.exportToken();
        await tokensPage.toolsComp.isExportWindowClosed(false);
        await baseComp.clickOnCancelButton();
        await tokensPage.toolsComp.isExportWindowClosed(true);
      },
    );
  },
);
