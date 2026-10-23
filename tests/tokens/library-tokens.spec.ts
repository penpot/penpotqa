import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountApiFixture } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

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
  qase(3862, 'Library tokens cannot be edited from the consumer file'),
  async () => {
    await dashboardPage.createFileViaTitlePanel();
    await mainPage.isMainPageLoaded();
    await assetsPanelPage.linkSharedLibraryAsTokensSource(libraryName);

    await demoAccountApiFixture.step(
      `Open the Tokens tab: "${libraryName}" tokens are listed`,
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.isTokensSourceName(libraryName);
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        await tokensPage.tokensComp.isTokenVisibleWithName(redTokenName);
      },
    );

    await demoAccountApiFixture.step(
      'Right click a library token: "Edit token" is not available',
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
    3868,
    'Token value change in a component in the library syncs to the consumer file',
  ),
  async ({ page }) => {
    const updatedRedToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: redTokenName,
      value: '#0000ff',
    };
    let libraryUrl: string;

    await demoAccountApiFixture.step(
      `In "${libraryName}", create a component whose shape uses the "${redTokenName}" token`,
      async () => {
        await dashboardPage.openFileWithName(libraryName);
        await mainPage.isMainPageLoaded();
        libraryUrl = page.url();
        await mainPage.createDefaultRectangleByCoordinates(300, 300);
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        await tokensPage.tokensComp.applyTokenToSelectedShape(redTokenName);
        await layersPanelPage.openLayersTab();
        // The "Saved" indicator is still shown from the previous change, so the
        // save request itself is awaited before leaving the file
        const componentSaved = mainPage.waitForUpdateFileRequest();
        await mainPage.createComponentViaShortcut();
        await componentSaved;
        await mainPage.backToDashboardFromFileEditor('Personal Projects');
        await mainPage.reloadPage();
        await mainPage.isHeaderDisplayed('Personal Projects');
      },
    );

    await demoAccountApiFixture.step(
      'Create a consumer file with a copy of the library component',
      async () => {
        await dashboardPage.createFileViaTitlePanel();
        await mainPage.isMainPageLoaded();
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

    const libraryPage = await page.context().newPage();
    const libraryMainPage = new MainPage(libraryPage);
    const libraryTokensPage = new TokensPage(libraryPage);

    await demoAccountApiFixture.step(
      `Open "${libraryName}" in other tab`,
      async () => {
        await libraryPage.goto(libraryUrl);
        await libraryMainPage.isMainPageLoaded();
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
        // The tab is closed afterwards, so the save request itself is awaited
        const tokenSaved = libraryMainPage.waitForUpdateFileRequest();
        await libraryTokensPage.tokensComp.editTokenViaRightClickAndSave(
          updatedRedToken,
        );
        await tokenSaved;
        await libraryPage.close();
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
        await layersPanelPage.selectCopyComponentChildLayer();
        await designPanelPage.checkFillTokenResolvedValue(updatedRedToken.value);
      },
    );
  },
);

demoAccountApiFixture(
  qase(3880, 'Unlinking the source library leaves tokens unresolved without errors'),
  async () => {
    const shapes = ['Rectangle', 'Ellipse'];

    await dashboardPage.createFileViaTitlePanel();
    await mainPage.isMainPageLoaded();
    await assetsPanelPage.linkSharedLibraryAsTokensSource(libraryName);

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
