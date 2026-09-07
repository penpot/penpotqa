import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest.describe(() => {
  const fontFamilyToken: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: 'font-family',
    value: 'Actor',
  };

  const fontFamilyTokenRef: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: 'font-family2',
    value: `{${fontFamilyToken.name}}`,
  };
  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: fontFamilyToken.name,
    value: 'Inter',
  };

  mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(fontFamilyToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(fontFamilyToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(fontFamilyToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainAccountFileTest(qase([2472], 'Apply a font family token'), async () => {
    await mainAccountFileTest.step(
      `Verify "${fontFamilyToken.name}" token is applied and font name matches`,
      async () => {
        await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
        await designPanelPage.checkFontName(fontFamilyToken.value);
      },
    );
  });

  mainAccountFileTest(
    qase([2475], 'Edit a font family token'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        `Edit "${fontFamilyToken.name}" token to "${updatedTokenData.value}" and verify font is updated`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(
            updatedTokenData,
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkFontName(updatedTokenData.value);
          await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
        },
      );

      await mainAccountFileTest.step(
        'Verify applied token title reflects updated value',
        async () => {
          await tokensPage.tokensComp.checkAppliedTokenTitle(
            'Token: font-family\n' +
              'Original value: Inter\n' +
              'Resolved value: Inter',
          );
        },
      );
    },
  );

  mainAccountFileTest(
    qase([2506], 'Reference a font family token'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        `Verify "${fontFamilyToken.name}" is applied and create reference token "${fontFamilyTokenRef.name}"`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
          await designPanelPage.checkFontName(fontFamilyToken.value);
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            fontFamilyTokenRef,
          );
          await tokensPage.tokensComp.isTokenVisibleWithName(
            fontFamilyTokenRef.name,
          );
        },
      );

      await mainAccountFileTest.step(
        `Apply "${fontFamilyTokenRef.name}" token to another layer`,
        async () => {
          await mainPage.clickViewportOnce();
          await layersPanelPage.openLayersTab();
          await mainPage.clickOnLayerOnCanvas();
          await tokensPage.clickTokensTab();
          await tokensPage.tokensComp.clickOnTokenWithName(fontFamilyTokenRef.name);
        },
      );

      await mainAccountFileTest.step(
        `Edit source token to "${updatedTokenData.value}" and verify font is updated via reference`,
        async () => {
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(
            updatedTokenData,
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkFontName(updatedTokenData.value);
          await tokensPage.tokensComp.isTokenAppliedWithName(
            fontFamilyTokenRef.name,
          );
        },
      );
    },
  );
});

mainAccountFileTest(
  qase([2484], 'Create a font family token with multiple fonts'),
  async ({ mainPage }) => {
    const fontFamilyToken: MainToken<TokenClass> = {
      class: TokenClass.FontFamily,
      name: 'font-family',
      value: `'Actor, 'Cinzel', Abel, Aboreto, "Biryani"'`,
    };

    await mainAccountFileTest.step(
      'Create default text layer and open tokens tab',
      async () => {
        await mainPage.createDefaultTextLayerByCoordinates(100, 200);
        await tokensPage.clickTokensTab();
      },
    );

    await mainAccountFileTest.step(
      'Click on add token button and fill token name',
      async () => {
        await tokensPage.tokensComp.clickOnAddTokenButton(fontFamilyToken);
        await tokensPage.tokensComp.fillTokenName(fontFamilyToken.name);
      },
    );

    await mainAccountFileTest.step(
      'Fill in the font family field with a set of names of a font family.',
      async () => {
        await tokensPage.tokensComp.fillTokenValue(fontFamilyToken.value!);
        await tokensPage.tokensComp.clickOnTokenDescription();
        await tokensPage.tokensComp.isSaveButtonEnabled();
      },
    );

    await mainAccountFileTest.step(
      'Click on Save and assert token is visible',
      async () => {
        await tokensPage.tokensComp.baseComp.clickOnSaveButton();
        await tokensPage.tokensComp.isTokenVisibleWithName(fontFamilyToken.name);
      },
    );
  },
);

mainAccountFileTest(
  qase([2469], 'Check missing name and font family token errors'),
  async ({ mainPage }) => {
    const fontFamilyToken: MainToken<TokenClass> = {
      class: TokenClass.FontFamily,
      name: 'font-family',
      value: `Actor`,
    };

    await mainAccountFileTest.step(
      'Create default text layer and open Tokens tab',
      async () => {
        await mainPage.createDefaultTextLayerByCoordinates(100, 200);
        await tokensPage.clickTokensTab();
      },
    );

    await mainAccountFileTest.step(
      'Click on add token button, leave name field empty and assert save is disabled',
      async () => {
        await tokensPage.tokensComp.clickOnAddTokenButton(fontFamilyToken);
        await tokensPage.tokensComp.isSaveButtonDisabled();
      },
    );

    await mainAccountFileTest.step(
      `Type "${fontFamilyToken.value}" in the token value input, clear it and assert error message`,
      async () => {
        await tokensPage.tokensComp.fillTokenValue(fontFamilyToken.value!);
        await tokensPage.tokensComp.clearTokenValue();
        await tokensPage.tokensComp.isErrorHintMessageVisible(
          'Token value cannot be empty',
        );
        await tokensPage.tokensComp.isSaveButtonDisabled();
      },
    );

    await mainAccountFileTest.step(
      `Type "${fontFamilyToken.name}" in the token name input, clear it and assert error message`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenNameInput();
        await tokensPage.tokensComp.fillTokenName(fontFamilyToken.name);
        await tokensPage.tokensComp.clearTokenNameInput();
        await tokensPage.tokensComp.isErrorHintMessageVisible(
          'Name should be at least 1 character',
        );
        await tokensPage.tokensComp.isSaveButtonDisabled();
      },
    );
  },
);
