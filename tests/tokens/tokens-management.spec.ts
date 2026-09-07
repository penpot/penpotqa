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
  qase(
    [2224],
    'Apply 2 different kind of tokens overriding the same shape property',
  ),
  async ({ mainPage }) => {
    const sizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'sizing',
      value: '200',
    };
    const dimensionToken: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'dimension',
      value: '100',
    };

    await mainAccountFileTest.step(
      `Create ellipse, "${dimensionToken.name}" and "${sizingToken.name}" tokens`,
      async () => {
        await mainPage.createDefaultEllipseByCoordinates(100, 200);
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(dimensionToken.name);
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(sizingToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(sizingToken.name);
      },
    );

    await mainAccountFileTest.step(
      `Apply "${sizingToken.name}" token and verify SizeAll menu is selected`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(sizingToken.name);
        await designPanelPage.checkSizeWidth(sizingToken.value);
        await designPanelPage.checkSizeHeight(sizingToken.value);
        await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name);
        await tokensPage.tokensComp.isTokenAppliedWithName(
          dimensionToken.name,
          false,
        );
        await tokensPage.tokensComp.isAllMenuItemWithSectionNameSelected(
          sizingToken.name,
          'Size',
        );
        await mainPage.clickBoardOnCanvas();
      },
    );

    await mainAccountFileTest.step(
      `Apply "${dimensionToken.name}" token and verify all Sizing submenu items are selected`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(dimensionToken.name);
        await designPanelPage.checkSizeWidth(dimensionToken.value);
        await designPanelPage.checkSizeHeight(dimensionToken.value);
        await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name);
        await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name, false);
        await tokensPage.tokensComp.isAllSubMenuItemWithSectionNameSelected(
          dimensionToken.name,
          'Sizing',
          'Size',
        );
        await mainPage.clickBoardOnCanvas();
      },
    );

    await mainAccountFileTest.step(
      `Apply "${sizingToken.name}" to Height only and verify both tokens are applied with correct values`,
      async () => {
        await tokensPage.tokensComp.selectMenuItem(sizingToken.name, 'Height');
        await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name);
        await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name);
        await designPanelPage.checkSizeWidth(dimensionToken.value);
        await designPanelPage.checkSizeHeight(sizingToken.value);
        await tokensPage.tokensComp.isMenuItemWithNameSelected(
          sizingToken.name,
          'Height',
        );
        await mainPage.clickBoardOnCanvas();
        await tokensPage.tokensComp.isSubMenuItemWithNameSelected(
          dimensionToken.name,
          'Sizing',
          'Width',
        );
        await mainPage.clickBoardOnCanvas();
      },
    );
  },
);
