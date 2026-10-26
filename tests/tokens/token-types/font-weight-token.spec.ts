import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const FONT_STYLE_ERROR =
  'Error setting font weight/style. This font style does not exist in the current font';

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let assetsPanelPage: AssetsPanelPage;

demoAccountFileTest.beforeEach(
  'Create a text layer (Source Sans Pro, 400, size 9) and open the Tokens tab',
  async ({ page, mainPage }) => {
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);
    assetsPanelPage = new AssetsPanelPage(page);

    await mainPage.clickMoveButton();
    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await designPanelPage.changeTextFont('Source Sans Pro');
    await designPanelPage.changeTextFontStyle('400');
    await designPanelPage.changeTextFontSize('9');
    await tokensPage.clickTokensTab();
  },
);

demoAccountFileTest(
  qase(
    [2558],
    'Apply a Font Weight token to a text not matching a family font style, but with a fallback value',
  ),
  async ({ mainPage }) => {
    const fontWeightToken1: MainToken<TokenClass> = {
      class: TokenClass.FontWeight,
      name: 'extra-black-font-weight',
      value: 'extra-black',
    };

    const fontWeightToken2: MainToken<TokenClass> = {
      class: TokenClass.FontWeight,
      name: '500-italic-font-weight',
      value: '500 italic',
    };

    await demoAccountFileTest.step('Create font weight tokens', async () => {
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken1);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken1.name);
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken2);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken2.name);
    });

    await demoAccountFileTest.step(
      `Apply "${fontWeightToken1.name}" with non-existing style and verify fallback value "900"`,
      async () => {
        await mainPage.clickViewportOnce();
        await layersPanelPage.openLayersTab();
        await mainPage.clickOnLayerOnCanvas();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken1.name);
        await mainPage.checkImportErrorMessage(FONT_STYLE_ERROR);
        await mainPage.closeModalWindow();
        await mainPage.isImportErrorMessageVisible(false);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken1.name);
        await designPanelPage.checkFontStyle('900');
      },
    );

    await demoAccountFileTest.step(
      `Apply "${fontWeightToken2.name}" with non-existing style and verify fallback value "600 Italic"`,
      async () => {
        await mainPage.clickViewportOnce();
        await layersPanelPage.openLayersTab();
        await mainPage.clickOnLayerOnCanvas();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken2.name);
        await mainPage.checkImportErrorMessage(FONT_STYLE_ERROR);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken2.name);
        await designPanelPage.checkFontStyle('600 Italic');
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [2559],
    'Apply a Font Weight token to a text not matching a family font style, with no fallback value',
  ),
  async ({ mainPage }) => {
    const fontWeightToken: MainToken<TokenClass> = {
      class: TokenClass.FontWeight,
      name: 'extra-black-font-weight',
      value: '500',
    };

    await demoAccountFileTest.step(
      `Create "${fontWeightToken.name}" token and change font to Splash`,
      async () => {
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken.name);
        await designPanelPage.changeTextFont('Splash');
      },
    );

    await demoAccountFileTest.step(
      'Apply token and verify error is shown and font style falls back to default',
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken.name);
        await mainPage.checkImportErrorMessage(FONT_STYLE_ERROR);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken.name);
        await designPanelPage.checkFontStyle('400');
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [2562],
    'Edit the value of a Font Weight token already applied to a component text with duplicated copies',
  ),
  async ({ mainPage }) => {
    const fontWeightToken: MainToken<TokenClass> = {
      class: TokenClass.FontWeight,
      name: '700-italic-font-weight',
      value: '700 Italic',
    };

    const updatedTokenData: MainToken<TokenClass> = {
      class: TokenClass.FontWeight,
      name: fontWeightToken.name,
      value: '200',
    };

    await demoAccountFileTest.step(
      `Create and apply "${fontWeightToken.name}" token to text layer`,
      async () => {
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken.name);
        await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken.name);
        await designPanelPage.checkFontStyle('700 Italic');
      },
    );

    await demoAccountFileTest.step('Create component and duplicate it', async () => {
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.copyLayerViaRightClick();
      await mainPage.pressPasteShortcut();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.openLayersTab();
      await layersPanelPage.checkCopyComponentLayerCount(1);
      await tokensPage.clickTokensTab();
    });

    await demoAccountFileTest.step(
      `Edit token to "${updatedTokenData.value}" and verify new value applies to both component copies`,
      async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.openLayersTab();
        await layersPanelPage.selectMainComponentChildLayer();
        await designPanelPage.checkFontStyle(updatedTokenData.value);
        await mainPage.clickViewportOnce();
        await layersPanelPage.selectCopyComponentChildLayer();
        await designPanelPage.checkFontStyle(updatedTokenData.value);
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [2563],
    "Applied font weight tokens should be disabled when they're overriden by a typography asset style (and vice versa)",
  ),
  async ({ mainPage }) => {
    const fontWeightToken: MainToken<TokenClass> = {
      class: TokenClass.FontWeight,
      name: '700-italic-font-weight',
      value: '700 italic',
    };

    await demoAccountFileTest.step(
      'Create a typography asset from the text (Source Sans Pro, 400)',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickAddFileLibraryTypographyButton();
        await assetsPanelPage.minimizeFileLibraryTypography();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      `Create and apply "${fontWeightToken.name}" token to the text`,
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken.name);
        await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken.name);
        await designPanelPage.isTypographyAssetAgVisible(false);
        await designPanelPage.checkFontStyle('700 Italic');
      },
    );

    await demoAccountFileTest.step(
      'Apply the typography asset and verify the font weight token is no longer applied',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isTypographyAssetAgVisible(true);
        await designPanelPage.clickOnTypographyMenuButton();
        await designPanelPage.checkFontStyle('400');
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.isTokenAppliedWithName(
          fontWeightToken.name,
          false,
        );
      },
    );

    await demoAccountFileTest.step(
      `Re-apply "${fontWeightToken.name}" token and verify the typography asset is detached`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken.name);
        await designPanelPage.isTypographyAssetAgVisible(false);
        await designPanelPage.checkFontStyle('700 Italic');
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [2555],
    'Apply a Font Weight token to a text directly matching a family font style',
  ),
  async ({ mainPage }) => {
    // Token value → Font Style shown once applied (names are converted to weights).
    const cases: { token: MainToken<TokenClass>; fontStyle: string }[] = [
      {
        token: { class: TokenClass.FontWeight, name: 'fw-700', value: '700' },
        fontStyle: '700',
      },
      {
        token: {
          class: TokenClass.FontWeight,
          name: 'fw-extralight-italic',
          value: 'Extralight Italic',
        },
        fontStyle: '200 Italic',
      },
      {
        token: { class: TokenClass.FontWeight, name: 'fw-heavy', value: 'heavy' },
        fontStyle: '900',
      },
      {
        token: {
          class: TokenClass.FontWeight,
          name: 'fw-300-italic',
          value: '300 italic',
        },
        fontStyle: '300 Italic',
      },
    ];

    await demoAccountFileTest.step(
      'Create the "700", "Extralight Italic", "heavy" and "300 italic" Font Weight tokens',
      async () => {
        for (const { token } of cases) {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(token);
          await tokensPage.tokensComp.isTokenVisibleWithName(token.name);
        }
      },
    );

    for (const { token, fontStyle } of cases) {
      await demoAccountFileTest.step(
        `Apply "${token.value}" → Font Style is "${fontStyle}" and the token is highlighted`,
        async () => {
          await tokensPage.tokensComp.clickOnTokenWithName(token.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(token.name);
          await designPanelPage.checkFontStyle(fontStyle);
        },
      );
    }
  },
);
