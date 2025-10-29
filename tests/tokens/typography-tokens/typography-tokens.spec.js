const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { random } = require('../../../helpers/string-generator');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { TokensPanelPage } = require('../../../pages/workspace/tokens-panel-page');
const {
  TypographyTokensComponent,
} = require('../../../pages/workspace/typography-tokens-component');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');

let mainPage,
  teamPage,
  dashboardPage,
  tokensPage,
  typographyTokensComponent,
  designPanelPage,
  layersPanelPage,
  colorPalettePage,
  assetsPanelPage;

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPanelPage(page);
  typographyTokensComponent = new TypographyTokensComponent(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
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
  const tokenName = 'global.token-component';
  const tokenFamily = 'Aboreto';
  const tokenDescription = 'Description';

  mainTest.beforeEach(async () => {
    // await tokensPage.createDefaultTextLayerByCoordinates(500, 500, browserName);
    await tokensPage.clickTokensTab();
  });

  mainTest(qase([2586], 'Create, edit a typography token'), async () => {
    await typographyTokensComponent.addNewTypoToken(tokenName, 'Arboreto');
    await tokensPage.isTokenVisibleWithName(tokenName);
    // await tokensPage.clickOnTokenWithName(tokenName);
    // await tokensPage.waitForChangeIsSaved();
    // await tokensPage.isTokenAppliedWithName(tokenName);
    // await designPanelPage.checkGeneralCornerRadius(tokenValue);
    // await expect(tokensPage.createdLayer).toHaveScreenshot(
    //   'rectangle-border-radius-1.png',
    // );
    // await tokensPage.isMenuItemWithNameSelected(tokenName, 'RadiusAll');
  });
});
