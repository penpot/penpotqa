import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  await mainPage.clickMoveButton();
});

mainAccountFileTest.describe(() => {
  let tokensPage: TokensPage;
  let mainPage: MainPage;
  let designPanelPage: DesignPanelPage;

  const radiusToken: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'border-radius',
    value: '10',
    description: 'Description',
  };
  const newTokenValue = '20';

  mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    tokensPage = new TokensPage(page);
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(radiusToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(radiusToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainAccountFileTest(
    qase([2125], 'Apply default "all radius" token to a rectangle (by left click)'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        `Verify "${radiusToken.name}" token is applied and corner radius matches`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await designPanelPage.checkGeneralCornerRadius(radiusToken.value);
        },
      );

      await mainAccountFileTest.step(
        'Verify screenshot and RadiusAll menu item is selected',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'rectangle-border-radius-1.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await tokensPage.tokensComp.isAllMenuItemWithSectionNameSelected(
            radiusToken.name,
            'Radius',
          );
        },
      );
    },
  );

  mainAccountFileTest(
    qase(
      [2166],
      'Edit a border radius token, already applied to a shape (with warning renaming message)',
    ),
    async ({ mainPage }) => {
      const radiusToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: 'border-radius',
        value: '-1',
        description: 'Description',
      };

      const updatedTokenData: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: radiusToken.name,
        value: newTokenValue,
      };

      await mainAccountFileTest.step(
        `Edit "${radiusToken.name}" token to value "${updatedTokenData.value}" and verify it is applied`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(
            updatedTokenData,
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGeneralCornerRadius(updatedTokenData.value);
          await tokensPage.tokensComp.isTokenAppliedWithName(updatedTokenData.name);
        },
      );

      await mainAccountFileTest.step(
        'Verify screenshot and applied token title',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'rectangle-border-radius-20.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await tokensPage.tokensComp.checkAppliedTokenTitle(
            'Token: border-radius\n' + 'Original value: 20\n' + 'Resolved value: 20',
          );
        },
      );
    },
  );

  mainAccountFileTest(
    qase([2136], 'Delete a token and redo deletion'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        `Delete "${radiusToken.name}" token and verify it is removed`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await tokensPage.tokensComp.deleteToken(radiusToken.name);
          await tokensPage.tokensComp.isTokenVisibleWithName(
            radiusToken.name,
            false,
          );
        },
      );

      await mainAccountFileTest.step(
        'Undo deletion and verify token is restored',
        async () => {
          await mainPage.clickShortcutCtrlZ();
          await tokensPage.tokensComp.expandTokenByName(TokenClass.BorderRadius);
          await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name, true);
        },
      );
    },
  );
});
