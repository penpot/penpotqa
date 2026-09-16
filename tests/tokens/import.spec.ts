import { demoAccountApiFixture, demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { BaseComponent } from '@pages/base-component';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { SampleData } from 'helpers/sample-data';

const sampleData: SampleData = new SampleData();

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
  let assetsPanelPage: AssetsPanelPage;

  demoAccountApiFixture.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    assetsPanelPage = new AssetsPanelPage(page);

    await dashboardPage.isHeaderDisplayed('Projects');
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

  demoAccountApiFixture(
    qase([2845], 'Import Tokens from Linked Library'),
    async () => {
      // Data from imported shared library
      const linkedLibraryName = 'Rectangle with set and theme tokens';
      const linkedLibraryFilePath =
        'documents/tokens/shared-library-rectangle-with-set-themes-tokens.penpot';
      const setsNames = ['Dark', 'Light', 'Desktop', 'Mobile'];

      // Color token created before importing the library, to verify that it is overridden by the imported tokens
      const colorToken: MainToken<TokenClass> = {
        class: TokenClass.Color,
        name: 'color',
        value: sampleData.color.greenHexCode,
      };

      await demoAccountApiFixture.step(
        'Import a .penpot file shared library with tokens, sets, themes and a rectangle',
        async () => {
          await dashboardPage.openSidebarItem('Drafts');
          await dashboardPage.importFileFromProjectPage(linkedLibraryFilePath);
          await dashboardPage.isFilePresentWithName(linkedLibraryName);
        },
      );

      await demoAccountApiFixture.step(
        'Create a new file, open and add a rectangle',
        async () => {
          await dashboardPage.openSidebarItem('Projects');
          await dashboardPage.createFileViaTitlePanel();
          await mainPage.isMainPageLoaded();
          await mainPage.createDefaultRectangleByCoordinates(320, 210);
        },
      );

      await demoAccountApiFixture.step(
        `From Tokens, create a color token with value ${colorToken.value} and apply to rectangle`,
        async () => {
          await tokensPage.clickTokensTab();
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken);
          await tokensPage.tokensComp.isTokenVisibleWithName(colorToken.name);
          await tokensPage.tokensComp.clickOnTokenWithName(colorToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(colorToken.name);
        },
      );

      await demoAccountApiFixture.step(
        'From ASSETS tab, click on Manage Libraries and add shared library',
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.clickLibrariesButton();
          await assetsPanelPage.firstLibraryItemContainsLibraryName(
            linkedLibraryName,
          );
          await assetsPanelPage.connectSharedLibraryByName(linkedLibraryName);
        },
      );

      await demoAccountApiFixture.step(
        'Click on Import Tokens from shared library and confirm',
        async () => {
          await assetsPanelPage.importTokensFromSharedLibraryByName(
            linkedLibraryName,
          );
          await assetsPanelPage.isImportTokensModalVisible();
          await assetsPanelPage.clickImportTokensFromSharedLibrary();
          await assetsPanelPage.clickCloseModalButton();
        },
      );

      await demoAccountApiFixture.step(
        'From Tokens tab, assert imported tokens, sets and themes are visible',
        async () => {
          await tokensPage.clickTokensTab();
          await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
          await tokensPage.tokensComp.isTokenVisibleWithName('red');
          await tokensPage.setsComp.isSetNameVisible(setsNames[0]);
          await tokensPage.setsComp.isSetNameVisible(setsNames[1]);
          await tokensPage.setsComp.isSetNameVisible(setsNames[2]);
          await tokensPage.setsComp.isSetNameVisible(setsNames[3]);
        },
      );
    },
  );
});
