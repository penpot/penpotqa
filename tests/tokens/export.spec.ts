import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { BaseComponent } from '@pages/base-component';

let tokensPage: TokensPage;

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
  await tokensPage.toolsComp.clickOnTokenToolsButton();
});

demoAccountFileTest(
  qase([2265], 'Export tokens multi-file folder'),
  async ({ page }) => {
    const baseComp: BaseComponent = new BaseComponent(page);

    await demoAccountFileTest.step(
      'Import tokens folder and verify theme is active',
      async () => {
        await tokensPage.toolsComp.importTokensFolder(
          'documents/tokens-folder-example',
        );
        await tokensPage.themesComp.checkSelectedTheme('Mode / Light');
      },
    );

    await demoAccountFileTest.step(
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

    await demoAccountFileTest.step(
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

demoAccountFileTest(qase([2217], 'Export tokens'), async () => {
  const importedFile = 'documents/tokens-example.json';

  await demoAccountFileTest.step(
    'Import tokens from a single JSON file (PENPOT-2213)',
    async () => {
      await tokensPage.toolsComp.importTokens(importedFile);
      await tokensPage.themesComp.checkSelectedTheme('2 active themes');
      await tokensPage.setsComp.isSetNameVisible('client_theme_template');
    },
  );

  await demoAccountFileTest.step(
    'Open Tools > Export: the modal shows the "Single file" option',
    async () => {
      await tokensPage.toolsComp.clickOnTokenToolsButton();
      await tokensPage.toolsComp.clickOnExportButton();
      await tokensPage.toolsComp.checkSingleFileTabSelected();
    },
  );

  await demoAccountFileTest.step(
    'Export: tokens.json is downloaded with the imported tokens, and the modal stays open',
    async () => {
      const download = await tokensPage.toolsComp.exportToken();
      await tokensPage.toolsComp.checkExportedTokensFile(download, importedFile);
      await tokensPage.toolsComp.isExportWindowClosed(false);
    },
  );
});
