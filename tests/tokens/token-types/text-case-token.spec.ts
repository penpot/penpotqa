import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;
let assetsPanelPage: AssetsPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest(
  qase([2522], 'Apply a capitalize text case token to a uppercase text layer'),
  async ({ mainPage }) => {
    const textCaseToken: MainToken<TokenClass> = {
      class: TokenClass.TextCase,
      name: 'text-case-capitalize',
      value: 'Capitalize',
    };
    const text = 'EXAMPLE TEXT';

    await mainAccountFileTest.step(
      'Create text layer and text case token',
      async () => {
        await mainPage.createTextLayerByCoordinates(100, 200, text);
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(textCaseToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(textCaseToken.name);
      },
    );

    await mainAccountFileTest.step(
      `Apply "${textCaseToken.name}" token and verify text case matches`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(textCaseToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name);
        await designPanelPage.checkTextCase(textCaseToken.value);
      },
    );
  },
);

mainAccountFileTest(
  qase([2520], 'Override and re-apply a text case token'),
  async ({ mainPage }) => {
    const textCaseToken: MainToken<TokenClass> = {
      class: TokenClass.TextCase,
      name: 'text-case-capitalize',
      value: 'Capitalize',
    };
    const text = 'EXAMPLE TEXT';

    await mainAccountFileTest.step(
      'Set typography style with Upper text case',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickAddFileLibraryTypographyButton();
        await assetsPanelPage.selectTextCase('Upper');
        await assetsPanelPage.minimizeFileLibraryTypography();
        await assetsPanelPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      `Create text layer and apply "${textCaseToken.name}" token`,
      async () => {
        await tokensPage.clickTokensTab();
        await mainPage.createTextLayerByCoordinates(100, 200, text);
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(textCaseToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(textCaseToken.name);
        await tokensPage.tokensComp.clickOnTokenWithName(textCaseToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name);
        await designPanelPage.checkTextCase(textCaseToken.value);
      },
    );

    await mainAccountFileTest.step(
      'Override with typography style and verify token is detached',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickOnTypographyMenuButton();
        await designPanelPage.checkTextCase('Upper');
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.isTokenAppliedWithName(
          textCaseToken.name,
          false,
        );
      },
    );

    await mainAccountFileTest.step(
      'Re-apply token and verify it overrides the typography style',
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(textCaseToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name);
        await designPanelPage.checkTextCase(textCaseToken.value);
      },
    );

    await mainAccountFileTest.step(
      'Override text case manually and verify token is detached',
      async () => {
        await designPanelPage.changeTextCase('Lower');
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(
          textCaseToken.name,
          false,
        );
        await designPanelPage.checkTextCase('Lower');
      },
    );
  },
);
