import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { MainPage } from '@pages/workspace/main-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const sampleData = new SampleData();

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let colorPalettePage: ColorPalettePage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;

  const fontSizeToken: MainToken<TokenClass> = {
    class: TokenClass.FontSize,
    name: 'fontSize',
    value: '60',
  };

  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.FontSize,
    name: fontSizeToken.name,
    value: '120',
    description: '120',
  };

  mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontSizeToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(fontSizeToken.name);
  });

  mainAccountFileTest(
    qase([2359], 'Apply a font size token'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        `Apply "${fontSizeToken.name}" token and verify it is applied`,
        async () => {
          await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
          await mainPage.waitForResizeHandlerVisible();
        },
      );

      await mainAccountFileTest.step('Verify screenshot matches', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('text-font-size-60.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainAccountFileTest(
    qase([2360], 'Detachment font size token'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        `Apply "${fontSizeToken.name}" to first text layer and create second text layer`,
        async () => {
          await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
          await mainPage.createDefaultTextLayerByCoordinates(100, 600);
          await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
        },
      );

      await mainAccountFileTest.step(
        'Detach token from first layer by re-clicking it',
        async () => {
          await mainPage.clickViewportByCoordinates(120, 220);
          await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(
            fontSizeToken.name,
            false,
          );
        },
      );

      await mainAccountFileTest.step(
        `Edit token to "${updatedTokenData.value}" and verify screenshot shows both sizes`,
        async () => {
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(
            updatedTokenData,
          );
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot('texts-size-60-120.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});

mainAccountFileTest(
  qase(
    [2363],
    'Propagation of (style) changes from a (contained) text component to copies (overriding style by using tokens)',
  ),
  async ({ mainPage }) => {
    const colorToken1: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: 'color1',
      value: sampleData.color.getRandomHexCode(),
    };
    const colorToken2: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: 'color2',
      value: sampleData.color.blueHexCode,
    };
    const colorToken3: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: 'color3',
      value: sampleData.color.greenHexCode,
    };

    await mainAccountFileTest.step(
      'Create color tokens and apply first token to text layer',
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(colorToken1);
        await tokensPage.tokensComp.isTokenVisibleWithName(colorToken1.name);
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken2);
        await tokensPage.tokensComp.isTokenVisibleWithName(colorToken2.name);
        await mainPage.createDefaultTextLayerByCoordinates(100, 200);
        await mainPage.waitForResizeHandlerVisible();
        await tokensPage.tokensComp.clickOnTokenWithName(colorToken1.name);
        await tokensPage.tokensComp.isTokenAppliedWithName(colorToken1.name);
      },
    );

    await mainAccountFileTest.step(
      'Create main component with flex layout and duplicate it',
      async () => {
        await layersPanelPage.openLayersTab();
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await layersPanelPage.createComponentViaShortcut(true);
        await mainPage.waitForChangeIsSaved();
        await mainPage.copyLayerViaRightClick();
        await mainPage.pasteLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Override color token in copy component child layer',
      async () => {
        await layersPanelPage.openLayersTab();
        await layersPanelPage.selectCopyComponentChildLayer();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.clickOnTokenWithName(colorToken2.name);
        await tokensPage.tokensComp.isTokenAppliedWithName(colorToken2.name);
      },
    );

    await mainAccountFileTest.step(
      'Change color manually in main component child layer',
      async () => {
        await layersPanelPage.openLayersTab();
        await layersPanelPage.clickMainComponentOnLayersTab();
        await layersPanelPage.selectMainComponentChildLayer();
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.clickOnColorButton();
        await colorPalettePage.setHex(colorToken3.value);
        await layersPanelPage.selectMainComponentChildLayer();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isFillHexCodeSet(colorToken3.value);
      },
    );

    await mainAccountFileTest.step(
      'Verify token states and screenshot',
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.isTokenAppliedWithName(colorToken1.name, false);
        await layersPanelPage.openLayersTab();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await layersPanelPage.selectCopyComponentChildLayer();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.isTokenAppliedWithName(colorToken2.name, true);
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('2-texts-color.png', {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        });
      },
    );
  },
);
