import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { demoAccountApiFixture } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const libraryName = 'Library A';
const libraryFilePath = 'documents/tokens/library-a.penpot';
const redTokenName = 'red';
const redTokenDesktopValue = '#ec1c1c';

let mainPage: MainPage;
let dashboardPage: DashboardPage;
let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let tokensPage: TokensPage;

demoAccountApiFixture.beforeEach(
  `Import the shared library "${libraryName}" with tokens, sets and themes`,
  async ({ page }) => {
    mainPage = new MainPage(page);
    dashboardPage = new DashboardPage(page);
    assetsPanelPage = new AssetsPanelPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);
    tokensPage = new TokensPage(page);

    await dashboardPage.openSidebarItem('Drafts');
    await dashboardPage.importFileFromProjectPage(libraryFilePath);
    await dashboardPage.isFilePresentWithName(libraryName);
  },
);

demoAccountApiFixture(
  qase(
    [3862, 2845],
    'Set linked library as tokens source: library tokens are listed and cannot be edited',
  ),
  async () => {
    const librarySetsNames = ['Mobile', 'Desktop'];
    const localColorToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: 'local-color',
      value: '#00ff00',
    };

    await demoAccountApiFixture.step(
      `Create a file with its own color token "${localColorToken.name}"`,
      async () => {
        await dashboardPage.createFileViaTitlePanel();
        await mainPage.isMainPageLoaded();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(localColorToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(localColorToken.name);
      },
    );

    await demoAccountApiFixture.step(
      `Link "${libraryName}" and set it as tokens source`,
      async () => {
        await assetsPanelPage.linkSharedLibraryAsTokensSource(libraryName);
      },
    );

    await demoAccountApiFixture.step(
      `3862: open the Tokens tab → "${libraryName}" tokens are listed`,
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        await tokensPage.tokensComp.isTokenVisibleWithName(redTokenName);
      },
    );

    await demoAccountApiFixture.step(
      `2845: "${libraryName}" is the tokens source, its sets are listed and the file's own token is no longer shown`,
      async () => {
        await tokensPage.isTokensSourceName(libraryName);
        for (const setName of librarySetsNames) {
          await tokensPage.setsComp.isSetNameVisible(setName);
        }
        await tokensPage.tokensComp.isTokenVisibleWithName(
          localColorToken.name,
          false,
        );
      },
    );

    await demoAccountApiFixture.step(
      '3862: right click a library token → "Edit token" is not available',
      async () => {
        await tokensPage.tokensComp.isMenuItemVisible(
          redTokenName,
          'Edit token',
          false,
        );
      },
    );
  },
);

demoAccountApiFixture(
  qase(
    [3868],
    'Token value change in a component in the library syncs to the consumer file',
  ),
  async ({ page }) => {
    const updatedRedToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: redTokenName,
      value: '#0000ff',
    };

    await demoAccountApiFixture.step(
      `Create a consumer file with a copy of the "${libraryName}" component that uses the "${redTokenName}" token`,
      async () => {
        await dashboardPage.createFileViaTitlePanel();
        await mainPage.isMainPageLoaded();
        await mainPage.clickMoveButton();
        await assetsPanelPage.linkSharedLibraryAsTokensSource(libraryName);
        await assetsPanelPage.clickLibraryTitleWithName(libraryName);
        await assetsPanelPage.clickLibraryComponentsTitle();
        await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.openLayersTab();
        await layersPanelPage.selectCopyComponentChildLayer();
        await designPanelPage.checkFillTokenResolvedValue(redTokenDesktopValue);
      },
    );

    let libraryTokensPage: TokensPage;

    await demoAccountApiFixture.step(
      `Open "${libraryName}" in other tab`,
      async () => {
        await assetsPanelPage.clickAssetsTab();
        const libraryPage =
          await assetsPanelPage.openLibraryFileInNewTab(libraryName);
        libraryTokensPage = new TokensPage(libraryPage);
        await libraryTokensPage.isMainPageLoaded();
      },
    );

    await demoAccountApiFixture.step('Click on "Desktop" set', async () => {
      await libraryTokensPage.clickTokensTab();
      await libraryTokensPage.setsComp.clickSetItemButton('Desktop');
      await libraryTokensPage.setsComp.isSetSelectedByName('Desktop');
    });

    await demoAccountApiFixture.step(
      `Change the value of the "${redTokenName}" token to ${updatedRedToken.value}`,
      async () => {
        await libraryTokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        await libraryTokensPage.tokensComp.editTokenViaRightClickAndSave(
          updatedRedToken,
        );
      },
    );

    await demoAccountApiFixture.step(
      'Open the consumer file: a notification indicates the library has updates',
      async () => {
        await page.bringToFront();
        await assetsPanelPage.isLibraryUpdatesMessageVisible();
      },
    );

    await demoAccountApiFixture.step(
      'Accept the library update: the new token value is applied',
      async () => {
        await assetsPanelPage.clickWrapperUpdateButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isErrorScreenNotDisplayed();
        await layersPanelPage.openLayersTab();
        await layersPanelPage.selectCopyComponentChildLayer();
        await designPanelPage.checkFillTokenResolvedValue(updatedRedToken.value);
      },
    );
  },
);

demoAccountApiFixture(
  qase(
    [3880],
    'Unlinking the source library leaves tokens unresolved without errors',
  ),
  async () => {
    const shapes = ['Rectangle', 'Ellipse'];

    await demoAccountApiFixture.step(
      `Create a consumer file with "${libraryName}" as tokens source`,
      async () => {
        await dashboardPage.createFileViaTitlePanel();
        await mainPage.isMainPageLoaded();
        await assetsPanelPage.linkSharedLibraryAsTokensSource(libraryName);
      },
    );

    await demoAccountApiFixture.step(
      `Create several shapes with the "${redTokenName}" library token applied`,
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 200);
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        await tokensPage.tokensComp.applyTokenToSelectedShape(redTokenName);
        await mainPage.createDefaultEllipseByCoordinates(500, 200);
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        await tokensPage.tokensComp.applyTokenToSelectedShape(redTokenName);
      },
    );

    await demoAccountApiFixture.step(
      `Open the Libraries modal and unlink "${libraryName}"`,
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickLibrariesButton();
        await assetsPanelPage.disconnectSharedLibraryByName(libraryName);
        await assetsPanelPage.isNoConnectedLibrariesMessageVisible();
        await assetsPanelPage.clickCloseModalButton();
      },
    );

    await demoAccountApiFixture.step(
      'The shapes show the token as unresolved and the app does not crash',
      async () => {
        await layersPanelPage.openLayersTab();
        for (const shape of shapes) {
          await layersPanelPage.selectLayerByName(shape);
          await designPanelPage.isFillTokenNotExistOrDeleted(redTokenName);
        }
        await mainPage.isErrorScreenNotDisplayed();
      },
    );

    await demoAccountApiFixture.step(
      `Link "${libraryName}" again and set it as tokens source`,
      async () => {
        await assetsPanelPage.linkSharedLibraryAsTokensSource(libraryName);
      },
    );

    await demoAccountApiFixture.step(
      'The tokens resolve again on the same shapes',
      async () => {
        await layersPanelPage.openLayersTab();
        for (const shape of shapes) {
          await layersPanelPage.selectLayerByName(shape);
          await designPanelPage.checkFillTokenResolvedValue(redTokenDesktopValue);
        }
        await mainPage.isErrorScreenNotDisplayed();
      },
    );
  },
);
