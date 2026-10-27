import { demoAccountFileTest, demoAccountApiFixture } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { BaseComponent } from '@pages/base-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    tokensPage = new TokensPage(page);
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.toolsComp.clickOnTokenToolsButton();
  });

  demoAccountFileTest(qase([2213], 'Import tokens'), async () => {
    await demoAccountFileTest.step('Import tokens JSON file', async () => {
      await tokensPage.toolsComp.importTokens('documents/tokens-example.json');
    });

    await demoAccountFileTest.step(
      'Verify themes and sets are imported',
      async () => {
        await tokensPage.themesComp.checkSelectedTheme('2 active themes');
        await tokensPage.setsComp.isSetNameVisible('client_theme_template');
      },
    );
  });

  demoAccountFileTest(
    qase([2240], 'Error while importing a tokens file'),
    async () => {
      const errorCount = 1;

      await demoAccountFileTest.step(
        'Import JSON with invalid format and verify parse error',
        async () => {
          await tokensPage.toolsComp.importTokens(
            'documents/import-tokens-error-format.json',
          );
          await tokensPage.checkImportErrorMessage(
            `Import Error: Could not parse JSON.`,
          );
          await tokensPage.closeModalWindow();
          await tokensPage.closeModalWindow();
          await tokensPage.isImportErrorMessageVisible(false);
        },
      );

      await demoAccountFileTest.step(
        'Import JSON with invalid token naming and verify error with detail count',
        async () => {
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
        },
      );
    },
  );

  demoAccountFileTest(
    qase([2293], 'Successful import of tokens file with validation errors'),
    async () => {
      const firstBadTokenName = 'dark-muted';
      const errorCount = 4;

      await demoAccountFileTest.step(
        'Import tokens file with validation errors',
        async () => {
          await tokensPage.toolsComp.importTokens('documents/stitches-tokens.json');
        },
      );

      await demoAccountFileTest.step(
        `Verify "${firstBadTokenName}" token is visible and invalid token count is ${errorCount}`,
        async () => {
          await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
          await tokensPage.tokensComp.isTokenVisibleWithName(firstBadTokenName);
          await tokensPage.tokensComp.checkInvalidTokenCount(errorCount);
        },
      );
    },
  );

  demoAccountFileTest(qase([2252], 'Import tokens multi-file folder'), async () => {
    await demoAccountFileTest.step('Import tokens multi-file folder', async () => {
      await tokensPage.toolsComp.importTokensFolder(
        'documents/tokens-folder-example',
      );
    });

    await demoAccountFileTest.step(
      'Verify theme and sets are imported',
      async () => {
        await tokensPage.themesComp.checkSelectedTheme('Mode / Light');
        await tokensPage.setsComp.isSetNameVisible('light');
        await tokensPage.setsComp.isSetNameVisible('dark');
      },
    );
  });

  demoAccountFileTest.describe(() => {
    demoAccountFileTest(
      qase([2375], 'Import tokens .zip (with a single file inside)'),
      async () => {
        await demoAccountFileTest.step(
          'Import tokens zip with a single file',
          async () => {
            await tokensPage.toolsComp.importTokensZip(
              'documents/tokens-single-file.zip',
            );
          },
        );

        await demoAccountFileTest.step(
          'Verify themes and sets are imported',
          async () => {
            await tokensPage.themesComp.checkSelectedTheme('3 active themes');
            await tokensPage.setsComp.isSetNameVisible('client_theme_template');
          },
        );
      },
    );

    demoAccountFileTest(
      qase([2376], 'Import tokens .zip (with a multi-file inside)'),
      async () => {
        await demoAccountFileTest.step(
          'Import tokens zip with multiple files',
          async () => {
            await tokensPage.toolsComp.importTokensZip(
              'documents/tokens-multifile.zip',
            );
          },
        );

        await demoAccountFileTest.step(
          'Verify themes and sets are imported',
          async () => {
            await tokensPage.themesComp.checkSelectedTheme('3 active themes');
            await tokensPage.setsComp.isSetNameVisible('client_theme_template');
          },
        );
      },
    );

    demoAccountFileTest(
      qase(
        [2377],
        'Import tokens .zip (with a multi-file inside) skipping not yet supported tokens',
      ),
      async ({ page }) => {
        const baseComp: BaseComponent = new BaseComponent(page);

        await demoAccountFileTest.step(
          'Import tokens zip with skipped tokens',
          async () => {
            await tokensPage.toolsComp.importTokensZip(
              'documents/tokens-multifile-with-skipped-tokens.zip',
            );
          },
        );

        await demoAccountFileTest.step(
          'Verify import warning message and skipped token count',
          async () => {
            await tokensPage.checkImportErrorMessage(
              `Import was successful, but some tokens were skipped because they use unsupported $type values. Expand details to see which tokens were affected.`,
            );
            await tokensPage.expandDetailMessage();
            await tokensPage.toolsComp.checkImportTokenDetailErrorCount(7);
          },
        );

        await demoAccountFileTest.step(
          'Close modal and verify import message is hidden',
          async () => {
            await baseComp.closeModalWindow();
            await tokensPage.isImportErrorMessageVisible(false);
            await page.waitForTimeout(1000);
          },
        );
      },
    );

    demoAccountFileTest(
      qase([2384], 'Import tokens .zip (empty or invalid)'),
      async ({ page }) => {
        const baseComp: BaseComponent = new BaseComponent(page);

        await demoAccountFileTest.step(
          'Import empty or invalid zip file',
          async () => {
            await tokensPage.toolsComp.importTokensZip(
              'documents/tokens-invalid.zip',
            );
          },
        );

        await demoAccountFileTest.step(
          'Verify error message and close modal',
          async () => {
            await tokensPage.checkImportErrorMessage(
              `No tokens, sets, or themes were found in this file.`,
            );
            await baseComp.closeModalWindow();
            await baseComp.closeModalWindow();
            await tokensPage.isImportErrorMessageVisible(false);
          },
        );
      },
    );
  });
});

demoAccountApiFixture.describe(() => {
  let dashboardPage: DashboardPage;
  let mainPage: MainPage;
  let tokensPage: TokensPage;

  demoAccountApiFixture.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
  });

  demoAccountApiFixture(
    qase([2221], 'Import .penpot file with tokens'),
    async () => {
      await demoAccountApiFixture.step(
        'Import penpot file and open it',
        async () => {
          await dashboardPage.openSidebarItem('Drafts');
          await dashboardPage.importFileFromProjectPage(
            'documents/penpot-file-with-tokens.penpot',
          );
          await dashboardPage.isFilePresentWithName(
            '⚙️ Design Tokens Starter Set | Edited',
          );
          await dashboardPage.openFileWithName(
            '⚙️ Design Tokens Starter Set | Edited',
          );
          await mainPage.isMainPageLoaded();
          await tokensPage.clickTokensTab();
        },
      );

      await demoAccountApiFixture.step(
        'Verify themes and sets are imported',
        async () => {
          await tokensPage.themesComp.checkSelectedTheme('2 active themes');
          await tokensPage.setsComp.isSetNameVisible('client_theme_template');
        },
      );
    },
  );
});
