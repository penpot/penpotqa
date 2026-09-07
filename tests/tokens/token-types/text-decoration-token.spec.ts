import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest.describe(() => {
  const decorationToken: MainToken<TokenClass> = {
    class: TokenClass.TextDecoration,
    name: 'text-decoration',
    value: 'underline',
  };

  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.TextDecoration,
    name: decorationToken.name,
    value: 'strike-through',
  };

  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
  });

  mainAccountFileTest(
    qase(
      [2526, 2531],
      'Apply a Text decoration token to a text layer and Edit a Text decoration token',
    ),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        `(2526) Apply "${decorationToken.name}" token to a text layer`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
            decorationToken,
          );
          await tokensPage.tokensComp.isTokenVisibleWithName(decorationToken.name);
          await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await designPanelPage.isTextUnderlineChecked();
        },
      );

      await mainAccountFileTest.step(
        `(2531) Edit "${decorationToken.name}" token to "${updatedTokenData.value}" and verify token is still applied and strikethrough is shown`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(
            updatedTokenData,
          );
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await designPanelPage.isTextStrikethroughChecked();
        },
      );
    },
  );

  mainAccountFileTest(
    qase([2535], 'Re-Apply the token after change the decorator manually'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        `Apply "${decorationToken.name}" token to a text layer`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
            decorationToken,
          );
          await tokensPage.tokensComp.isTokenVisibleWithName(decorationToken.name);
          await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        `Verify "${decorationToken.name}" token is applied with underline`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await designPanelPage.isTextUnderlineChecked();
        },
      );

      await mainAccountFileTest.step(
        'Manually change to strikethrough and verify token is detached',
        async () => {
          await designPanelPage.changeTextOption('Strikethrough');
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(
            decorationToken.name,
            false,
          );
          await designPanelPage.isTextStrikethroughChecked();
        },
      );

      await mainAccountFileTest.step(
        'Re-apply token and verify underline is restored',
        async () => {
          await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await designPanelPage.isTextUnderlineChecked();
        },
      );
    },
  );
});
