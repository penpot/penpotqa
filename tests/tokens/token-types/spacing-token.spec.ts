import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  await mainPage.clickMoveButton();
});

demoAccountFileTest(
  qase([2202], 'Apply default "all gaps" token to a grid board (by left click)'),
  async ({ mainPage }) => {
    const spacingToken: MainToken<TokenClass> = {
      class: TokenClass.Spacing,
      name: 'spacing',
      value: '-20',
    };

    await demoAccountFileTest.step(
      'Create board with grid layout and spacing token',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(320, 210);
        await mainPage.addGridLayoutViaRightClick();
        await designPanelPage.isLayoutRemoveButtonExists();
        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(spacingToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(spacingToken.name);
      },
    );

    await demoAccountFileTest.step(
      `Apply "${spacingToken.name}" token and verify gap values`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(spacingToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(spacingToken.name);
        await designPanelPage.checkRowGap(spacingToken.value);
        await designPanelPage.checkColumnGap(spacingToken.value);
      },
    );

    await demoAccountFileTest.step(
      'Verify screenshot and Gaps menu items are selected',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot('board-spacing-20.png', {
          mask: mainPage.maskViewport(),
        });
        await tokensPage.tokensComp.isAllMenuItemWithSectionNameSelected(
          spacingToken.name,
          'Gaps',
        );
      },
    );
  },
);
