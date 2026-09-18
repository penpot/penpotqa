import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  await mainPage.clickMoveButton();
});

demoAccountFileTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let assetsPanelPage: AssetsPanelPage;

  const letterSpacingToken: MainToken<TokenClass> = {
    class: TokenClass.LetterSpacing,
    name: 'letter-spacing',
    value: '10',
  };
  const newTokenValue = '5';

  demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    assetsPanelPage = new AssetsPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(letterSpacingToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase([2500], 'Apply a Letter Spacing token and override value from Design tab'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        `Verify "${letterSpacingToken.name}" token is applied and letter spacing matches`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(
            letterSpacingToken.name,
          );
          await designPanelPage.checkLetterSpacing(letterSpacingToken.value);
        },
      );

      await demoAccountFileTest.step(
        `Override letter spacing to "${newTokenValue}" from Design tab and verify token is detached`,
        async () => {
          await designPanelPage.changeTextLetterSpacing(newTokenValue);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(
            letterSpacingToken.name,
            false,
          );
          await designPanelPage.checkLetterSpacing(newTokenValue);
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [2501],
      'Letter Spacing token value can be override by Assets > Typography style',
    ),
    async () => {
      await demoAccountFileTest.step(
        `Verify "${letterSpacingToken.name}" token is applied and letter spacing matches`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(
            letterSpacingToken.name,
          );
          await designPanelPage.checkLetterSpacing(letterSpacingToken.value);
        },
      );

      await demoAccountFileTest.step(
        `Override letter spacing via Assets > Typography style to "${newTokenValue}"`,
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.clickAddFileLibraryTypographyButton();
          await assetsPanelPage.waitForChangeIsSaved();
          await assetsPanelPage.selectLetterSpacing(newTokenValue);
          await designPanelPage.clickOnEnter();
          await assetsPanelPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify token is detached and letter spacing reflects typography style value',
        async () => {
          await tokensPage.clickTokensTab();
          await designPanelPage.clickOnTypographyMenuButton();
          await tokensPage.tokensComp.isTokenAppliedWithName(
            letterSpacingToken.name,
            false,
          );
          await designPanelPage.checkLetterSpacing(newTokenValue);
        },
      );
    },
  );
});

demoAccountFileTest(
  qase(
    [2536],
    'Reference a dimension-type token as an operand (math operation / Dimensions token)',
  ),
  async ({ mainPage }) => {
    const dimensionToken: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'dimension',
      value: '2',
    };
    const letterSpacingToken: MainToken<TokenClass> = {
      class: TokenClass.LetterSpacing,
      name: 'letter-spacing',
      value: `5px*{${dimensionToken.name}}`,
    };

    const updatedTokenData: MainToken<TokenClass> = {
      class: TokenClass.LetterSpacing,
      name: letterSpacingToken.name,
      value: `5px/{${dimensionToken.name}}`,
    };

    await demoAccountFileTest.step(
      `Create "${dimensionToken.name}" and "${letterSpacingToken.name}" tokens with multiplication reference`,
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
          letterSpacingToken,
        );
        await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.checkTokenTitle(
          letterSpacingToken.name,
          `Token: ${letterSpacingToken.name}\n` +
            `Original value: ${letterSpacingToken.value}\n` +
            'Resolved value: 10',
        );
      },
    );

    await demoAccountFileTest.step(
      'Edit to division and verify resolved value is 2.5',
      async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
        await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.checkTokenTitle(
          letterSpacingToken.name,
          `Token: ${letterSpacingToken.name}\n` +
            `Original value: ${updatedTokenData.value}\n` +
            'Resolved value: 2.5',
        );
      },
    );

    await demoAccountFileTest.step(
      'Edit to addition and verify resolved value is 7',
      async () => {
        updatedTokenData.value = `5px+{${dimensionToken.name}}`;
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
        await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.checkTokenTitle(
          letterSpacingToken.name,
          `Token: ${letterSpacingToken.name}\n` +
            `Original value: ${updatedTokenData.value}\n` +
            'Resolved value: 7',
        );
      },
    );

    await demoAccountFileTest.step(
      'Edit to subtraction and verify resolved value is 3',
      async () => {
        updatedTokenData.value = `5px-{${dimensionToken.name}}`;
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
        await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.checkTokenTitle(
          letterSpacingToken.name,
          `Token: ${letterSpacingToken.name}\n` +
            `Original value: ${updatedTokenData.value}\n` +
            'Resolved value: 3',
        );
      },
    );
  },
);
