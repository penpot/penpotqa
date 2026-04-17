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

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
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
  let designPanelPage: DesignPanelPage;
  let layersPanelPage: LayersPanelPage;

  const fontFamilyToken: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: 'font-family',
    value: 'Actor',
  };

  const fontFamilyTokenRef: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: 'font-family2',
    value: `{${fontFamilyToken.name}}`,
  };
  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: fontFamilyToken.name,
    value: 'Inter',
  };

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(fontFamilyToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(fontFamilyToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(fontFamilyToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(2472, 'Apply a font family token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await designPanelPage.checkFontName(fontFamilyToken.value);
  });

  mainTest(qase(2475, 'Edit a font family token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(updatedTokenData.value);
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await tokensPage.tokensComp.checkAppliedTokenTitle(
      'Token: font-family\n' + 'Original value: Inter\n' + 'Resolved value: Inter',
    );
  });

  mainTest(qase(2506, 'Reference a font family token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await designPanelPage.checkFontName(fontFamilyToken.value);

    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontFamilyTokenRef);
    await tokensPage.tokensComp.isTokenVisibleWithName(fontFamilyTokenRef.name);
    await mainPage.clickViewportOnce();

    await layersPanelPage.openLayersTab();
    await mainPage.clickOnLayerOnCanvas();
    await tokensPage.clickTokensTab();

    await tokensPage.tokensComp.clickOnTokenWithName(fontFamilyTokenRef.name);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(updatedTokenData.value);
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyTokenRef.name);
  });
});
