import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page, browserName }) => {
  let teamPage: TeamPage = new TeamPage(page);
  let dashboardPage: DashboardPage = new DashboardPage(page);
  let mainPage: MainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async ({ page }) => {
  const teamPage: TeamPage = new TeamPage(page);
  const mainPage: MainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let layersPanelPage: LayersPanelPage;

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await designPanelPage.changeTextFont('Source Sans Pro');
    await designPanelPage.changeTextFontStyle('400');
    await designPanelPage.changeTextFontSize('9');
    await tokensPage.clickTokensTab();
  });

  mainTest(
    qase(
      2558,
      'Apply a Font Weight token to a text not matching a family font style, but with a fallback value',
    ),
    async () => {
      const fontWeightToken1: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: 'extra-black-font-weight',
        value: 'extra-black',
      };

      const fontWeightToken2: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: '500-italic-font-weight',
        value: '500 italic',
      };

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken1);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken1.name);
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken2);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken2.name);

      await mainPage.clickViewportOnce();
      await layersPanelPage.openLayersTab();
      await mainPage.clickOnLayerOnCanvas();
      await tokensPage.clickTokensTab();

      await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken1.name);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.closeModalWindow();
      await mainPage.isImportErrorMessageVisible(false);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken1.name);
      await designPanelPage.checkFontStyle('900');

      await mainPage.clickViewportOnce();
      await layersPanelPage.openLayersTab();
      await mainPage.clickOnLayerOnCanvas();
      await tokensPage.clickTokensTab();

      await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken2.name);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken2.name);
      await designPanelPage.checkFontStyle('400 Italic');
    },
  );

  mainTest(
    qase(
      2559,
      'Apply a Font Weight token to a text not matching a family font style, with no fallback value',
    ),
    async () => {
      const fontWeightToken: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: 'extra-black-font-weight',
        value: '500',
      };

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken.name);

      await designPanelPage.changeTextFont('Splash');
      await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken.name);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken.name);
      await designPanelPage.checkFontStyle('400');
    },
  );

  mainTest(
    qase(
      2562,
      'Edit the value of a Font Weight token already applied to a component text with duplicated copies',
    ),
    async ({ browserName }) => {
      const fontWeightToken: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: '700-italic-font-weight',
        value: '700 Italic',
      };

      const updatedTokenData: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: fontWeightToken.name,
        value: '200',
      };

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken.name);
      await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken.name);
      await designPanelPage.checkFontStyle('700 Italic');

      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.copyLayerViaRightClick();
      await mainPage.pressPasteShortcut(browserName);
      await mainPage.waitForChangeIsSaved();

      await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.openLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();
      await designPanelPage.checkFontStyle(updatedTokenData.value);
      await mainPage.clickViewportOnce();
      await layersPanelPage.selectCopyComponentChildLayer();
      await designPanelPage.checkFontStyle(updatedTokenData.value);
    },
  );
});
