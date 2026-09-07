import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest(
  qase([2172], 'Apply default "opacity" token to an image (by left click)'),
  async ({ mainPage }) => {
    const opacityToken: MainToken<TokenClass> = {
      class: TokenClass.Opacity,
      name: 'opacity',
      value: '0.7',
    };

    await mainAccountFileTest.step(
      'Upload image and create opacity token',
      async () => {
        await mainPage.uploadImage('images/sample.jpeg');
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(opacityToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(opacityToken.name);
      },
    );

    await mainAccountFileTest.step(
      `Apply "${opacityToken.name}" token and verify it is applied`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(opacityToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(opacityToken.name);
      },
    );

    await mainAccountFileTest.step(
      'Verify screenshot and Opacity menu item is selected',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot('image-opacity-0-7.png', {
          mask: mainPage.maskViewport(),
        });
        await tokensPage.tokensComp.isMenuItemWithNameSelected(
          opacityToken.name,
          'Opacity',
        );
      },
    );
  },
);
