import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { BaseComponent } from '@pages/base-component';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { SampleData } from 'helpers/sample-data';
import { createTeamName } from 'helpers/teams/create-team-name';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

const teamName = createTeamName();
const sampleData: SampleData = new SampleData();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let assetsPanelPage: AssetsPanelPage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest(qase([2213], 'Import tokens'), async () => {
  await mainTest.step('Import tokens JSON file', async () => {
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.toolsComp.clickOnTokenToolsButton();
    await tokensPage.toolsComp.importTokens('documents/tokens-example.json');
  });

  await mainTest.step('Verify themes and sets are imported', async () => {
    await tokensPage.themesComp.checkSelectedTheme('2 active themes');
    await tokensPage.setsComp.isSetNameVisible('client_theme_template');
  });
});

mainTest(qase([2221], 'Import .penpot file with tokens'), async () => {
  await mainTest.step('Import penpot file and open it', async () => {
    await dashboardPage.openSidebarItem('Drafts');
    await dashboardPage.importFileFromProjectPage(
      'documents/penpot-file-with-tokens.penpot',
    );
    await dashboardPage.isFilePresent('⚙️ Design Tokens Starter Set | Edited');
    await dashboardPage.openFileWithName('⚙️ Design Tokens Starter Set | Edited');
    await mainPage.isMainPageLoaded();
    await tokensPage.clickTokensTab();
  });

  await mainTest.step('Verify themes and sets are imported', async () => {
    await tokensPage.themesComp.checkSelectedTheme('2 active themes');
    await tokensPage.setsComp.isSetNameVisible('client_theme_template');
  });
});

mainTest(qase([2240], 'Error while importing a tokens file'), async () => {
  const errorCount = 1;

  await mainTest.step(
    'Import JSON with invalid format and verify parse error',
    async () => {
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();
      await mainPage.clickMoveButton();
      await tokensPage.clickTokensTab();
      await tokensPage.toolsComp.clickOnTokenToolsButton();
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

  await mainTest.step(
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
});

mainTest(
  qase([2293], 'Successful import of tokens file with validation errors'),
  async () => {
    const firstBadTokenName = 'dark-muted';
    const errorCount = 4;

    await mainTest.step('Import tokens file with validation errors', async () => {
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();
      await mainPage.clickMoveButton();
      await tokensPage.clickTokensTab();
      await tokensPage.toolsComp.clickOnTokenToolsButton();
      await tokensPage.toolsComp.importTokens('documents/stitches-tokens.json');
    });

    await mainTest.step(
      `Verify "${firstBadTokenName}" token is visible and invalid token count is ${errorCount}`,
      async () => {
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        await tokensPage.tokensComp.isTokenVisibleWithName(firstBadTokenName);
        await tokensPage.tokensComp.checkInvalidTokenCount(errorCount);
      },
    );
  },
);

mainTest(qase([2252], 'Import tokens multi-file folder'), async () => {
  await mainTest.step('Import tokens multi-file folder', async () => {
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.toolsComp.clickOnTokenToolsButton();
    await tokensPage.toolsComp.importTokensFolder('documents/tokens-folder-example');
  });

  await mainTest.step('Verify theme and sets are imported', async () => {
    await tokensPage.themesComp.checkSelectedTheme('Mode / Light');
    await tokensPage.setsComp.isSetNameVisible('light');
    await tokensPage.setsComp.isSetNameVisible('dark');
  });
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
    qase([2375], 'Import tokens .zip (with a single file inside)'),
    async () => {
      await mainTest.step('Import tokens zip with a single file', async () => {
        await tokensPage.toolsComp.importTokensZip(
          'documents/tokens-single-file.zip',
        );
      });

      await mainTest.step('Verify themes and sets are imported', async () => {
        await tokensPage.themesComp.checkSelectedTheme('3 active themes');
        await tokensPage.setsComp.isSetNameVisible('client_theme_template');
      });
    },
  );

  mainTest(
    qase([2376], 'Import tokens .zip (with a multi-file inside)'),
    async () => {
      await mainTest.step('Import tokens zip with multiple files', async () => {
        await tokensPage.toolsComp.importTokensZip('documents/tokens-multifile.zip');
      });

      await mainTest.step('Verify themes and sets are imported', async () => {
        await tokensPage.themesComp.checkSelectedTheme('3 active themes');
        await tokensPage.setsComp.isSetNameVisible('client_theme_template');
      });
    },
  );

  mainTest(
    qase(
      [2377],
      'Import tokens .zip (with a multi-file inside) skipping not yet supported tokens',
    ),
    async ({ page }) => {
      const baseComp: BaseComponent = new BaseComponent(page);

      await mainTest.step('Import tokens zip with skipped tokens', async () => {
        await tokensPage.toolsComp.importTokensZip(
          'documents/tokens-multifile-with-skipped-tokens.zip',
        );
      });

      await mainTest.step(
        'Verify import warning message and skipped token count',
        async () => {
          await tokensPage.checkImportErrorMessage(
            `Import was successful, but some tokens were skipped because they use unsupported $type values. Expand details to see which tokens were affected.`,
          );
          await tokensPage.expandDetailMessage();
          await tokensPage.toolsComp.checkImportTokenDetailErrorCount(7);
        },
      );

      await mainTest.step(
        'Close modal and verify import message is hidden',
        async () => {
          await baseComp.closeModalWindow();
          await tokensPage.isImportErrorMessageVisible(false);
          await page.waitForTimeout(1000);
        },
      );
    },
  );

  mainTest(
    qase([2384], 'Import tokens .zip (empty or invalid)'),
    async ({ page }) => {
      const baseComp: BaseComponent = new BaseComponent(page);

      await mainTest.step('Import empty or invalid zip file', async () => {
        await tokensPage.toolsComp.importTokensZip('documents/tokens-invalid.zip');
      });

      await mainTest.step('Verify error message and close modal', async () => {
        await tokensPage.checkImportErrorMessage(
          `No tokens, sets, or themes were found in this file.`,
        );
        await baseComp.closeModalWindow();
        await baseComp.closeModalWindow();
        await tokensPage.isImportErrorMessageVisible(false);
      });
    },
  );
});

mainTest(qase([2845], 'Import Tokens from Linked Library'), async () => {
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

  await mainTest.step(
    'Import a .penpot file shared library with tokens, sets, themes and a rectangle',
    async () => {
      await dashboardPage.openSidebarItem('Drafts');
      await dashboardPage.importFileFromProjectPage(linkedLibraryFilePath);
      await dashboardPage.isFilePresent(linkedLibraryName);
    },
  );

  await mainTest.step('Create a new file, open and add a rectangle', async () => {
    await dashboardPage.openSidebarItem('Projects');
    await dashboardPage.createFileViaTitlePanel();
    await mainPage.isMainPageLoaded();
    await mainPage.createDefaultRectangleByCoordinates(320, 210);
  });

  await mainTest.step(
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

  await mainTest.step(
    'From ASSETS tab, click on Manage Libraries and add shared library',
    async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.firstLibraryItemContainsLibraryName(linkedLibraryName);
      await assetsPanelPage.connectSharedLibraryByName(linkedLibraryName);
    },
  );

  await mainTest.step(
    'Click on Import Tokens from shared library and confirm',
    async () => {
      await assetsPanelPage.importTokensFromSharedLibraryByName(linkedLibraryName);
      await assetsPanelPage.isImportTokensModalVisible();
      await assetsPanelPage.clickImportTokensFromSharedLibrary();
      await assetsPanelPage.clickCloseModalButton();
    },
  );

  await mainTest.step(
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
});
