import { expect } from '@playwright/test';
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

mainAccountFileTest(
  qase([2215], 'Apply default "stroke width" token to a path (by left click)'),
  async ({ mainPage }) => {
    const strokeToken: MainToken<TokenClass> = {
      class: TokenClass.StrokeWidth,
      name: 'stroke-width',
      value: '5.5',
    };

    await mainAccountFileTest.step(
      'Create path and stroke width token',
      async () => {
        await mainPage.createDefaultOpenPath();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(strokeToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(strokeToken.name);
      },
    );

    await mainAccountFileTest.step(
      `Apply "${strokeToken.name}" token and verify stroke width`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(strokeToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(strokeToken.name);
        await designPanelPage.checkStrokeWidth(strokeToken.value);
      },
    );

    await mainAccountFileTest.step(
      'Verify screenshot and Stroke Width menu item is selected',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-stroke-width-5-5.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await tokensPage.tokensComp.isMenuItemWithNameSelected(
          strokeToken.name,
          'Stroke Width',
        );
      },
    );
  },
);
