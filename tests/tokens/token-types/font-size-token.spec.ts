import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const teamName = random().concat('autotest');
const sampleData = new SampleData();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let colorPalettePage: ColorPalettePage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
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

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontSizeToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(fontSizeToken.name);
  });

  mainTest(qase(2358, 'Create a font size token'), async () => {
    await mainTest.step(
      `Verify "${fontSizeToken.name}" token is visible`,
      async () => {
        await tokensPage.tokensComp.isTokenVisibleWithName(fontSizeToken.name);
      },
    );
  });

  mainTest(qase(2359, 'Apply a font size token'), async () => {
    await mainTest.step(
      `Apply "${fontSizeToken.name}" token and verify it is applied`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
        await mainPage.waitForResizeHandlerVisible();
      },
    );

    await mainTest.step('Verify screenshot matches', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('text-font-size-60.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase(2360, 'Detachment font size token'), async () => {
    await mainTest.step(
      `Apply "${fontSizeToken.name}" to first text layer and create second text layer`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
        await mainPage.createDefaultTextLayerByCoordinates(100, 600);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
      },
    );

    await mainTest.step(
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

    await mainTest.step(
      `Edit token to "${updatedTokenData.value}" and verify screenshot shows both sizes`,
      async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('texts-size-60-120.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  });
});

mainTest(
  qase(
    2363,
    'Propagation of (style) changes from a (contained) text component to copies (overriding style by using tokens)',
  ),
  async ({ browserName }) => {
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

    await mainTest.step(
      'Create color tokens and apply first token to text layer',
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(colorToken1);
        await tokensPage.tokensComp.isTokenVisibleWithName(colorToken1.name);
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken2);
        await tokensPage.tokensComp.isTokenVisibleWithName(colorToken2.name);
        await mainPage.createDefaultTextLayerByCoordinates(100, 200);
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await tokensPage.tokensComp.clickOnTokenWithName(colorToken1.name);
        await tokensPage.tokensComp.isTokenAppliedWithName(colorToken1.name);
      },
    );

    await mainTest.step(
      'Create main component with flex layout and duplicate it',
      async () => {
        await layersPanelPage.openLayersTab();
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await layersPanelPage.createComponentViaShortcut(browserName, true);
        await mainPage.waitForChangeIsSaved();
        await mainPage.copyLayerViaRightClick();
        await mainPage.pasteLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(
      'Override color token in copy component child layer',
      async () => {
        await layersPanelPage.openLayersTab();
        await layersPanelPage.selectCopyComponentChildLayer();
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.clickOnTokenWithName(colorToken2.name);
        await tokensPage.tokensComp.isTokenAppliedWithName(colorToken2.name);
      },
    );

    await mainTest.step(
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

    await mainTest.step('Verify token states and screenshot', async () => {
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
    });
  },
);
