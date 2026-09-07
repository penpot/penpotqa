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
  qase([2175], 'Apply default "rotation" token to a text (by left click)'),
  async ({ mainPage }) => {
    const rotationToken: MainToken<TokenClass> = {
      class: TokenClass.Rotation,
      name: 'rotation',
      value: '-(22.5+22.5)',
    };
    const tokenResolvedValue = '-45'; // -45 == -(22.5+22.5)

    await mainAccountFileTest.step(
      'Create text layer and rotation token',
      async () => {
        await mainPage.createDefaultTextLayerByCoordinates(320, 210);
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(rotationToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(rotationToken.name);
      },
    );

    await mainAccountFileTest.step(
      `Apply "${rotationToken.name}" token and verify rotation value`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(rotationToken.name);
        await tokensPage.tokensComp.isTokenAppliedWithName(rotationToken.name);
        await designPanelPage.checkRotationForLayer(tokenResolvedValue);
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Verify screenshot and Rotation menu item is selected',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot('text-rotated-315.png', {
          mask: mainPage.maskViewport(),
        });
        await tokensPage.tokensComp.isMenuItemWithNameSelected(
          rotationToken.name,
          'Rotation',
        );
      },
    );
  },
);
