import { mainTest } from '../../fixtures';
import { random } from '../../helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '../../pages/workspace/main-page';
import { TeamPage } from '../../pages/dashboard/team-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { TokensPage } from '../../pages/workspace/tokens/tokens-base-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page }) => {
  const teamPage: TeamPage = new TeamPage(page);
  const dashboardPage: DashboardPage = new DashboardPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest.afterEach(async ({ page }) => {
  const mainPage: MainPage = new MainPage(page);
  const teamPage: TeamPage = new TeamPage(page);

  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let dashboardPage: DashboardPage;
  let tokensPage: TokensPage;
  let layersPanelPage: LayersPanelPage;

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    dashboardPage = new DashboardPage(page);
    tokensPage = new TokensPage(page);
    layersPanelPage = new LayersPanelPage(page);

    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.toolsComp.clickOnTokenToolsButton();
    await tokensPage.toolsComp.importTokens(
      'documents/tokens-for-each-category.json',
    );
    await tokensPage.setsComp.isSetNameVisible('Global');
    await tokensPage.tokensComp.expandAllTokens();
  });

  mainTest(qase(2374, 'Rectangle: Check active tokens in token list'), async () => {
    await tokensPage.createDefaultRectangleByCoordinates(100, 200);
    await tokensPage.tokensComp.isTokenDisabledWithName('BORDER-RADIUS-1', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', true);
    await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
    await tokensPage.tokensComp.isTokenDisabledWithName('STROKE-WIDTH-10', false);

    await tokensPage.tokensComp.isMenuItemVisible('COLOR-1', 'Fill');
    await layersPanelPage.openLayersTab();
    await mainPage.clickOnLayerOnCanvas();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.isMenuItemVisible('COLOR-1', 'Stroke');
  });

  mainTest(qase(2382, 'Text layer: Check active tokens in token list'), async () => {
    await tokensPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.tokensComp.isTokenDisabledWithName('BORDER-RADIUS-1', true);
    await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
    await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
    await tokensPage.tokensComp.isTokenDisabledWithName('STROKE-WIDTH-10', false);

    await tokensPage.tokensComp.isMenuItemVisible('COLOR-1', 'Fill');
    await mainPage.clickOnLayerOnCanvas();
    await tokensPage.tokensComp.isMenuItemVisible('COLOR-1', 'Stroke');
  });

  mainTest(
    qase(2383, 'Board (in root): Check active tokens in token list'),
    async () => {
      await tokensPage.createDefaultBoardByCoordinates(100, 200);
      await tokensPage.tokensComp.isTokenDisabledWithName('BORDER-RADIUS-1', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', true);
      await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
      await tokensPage.tokensComp.isTokenDisabledWithName('STROKE-WIDTH-10', false);
    },
  );

  mainTest(
    qase(2385, 'Path: Check active tokens in token list'),
    async ({ page }) => {
      const mainPage: MainPage = new MainPage(page);
      const tokensPage: TokensPage = new TokensPage(page);

      await mainPage.createDefaultOpenPath();
      await tokensPage.tokensComp.isTokenDisabledWithName('BORDER-RADIUS-1', true);
      await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', true);
      await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
      await tokensPage.tokensComp.isTokenDisabledWithName('STROKE-WIDTH-10', false);
    },
  );

  mainTest(
    qase(2386, 'Image: Check active tokens in token list'),
    async ({ page }) => {
      const mainPage: MainPage = new MainPage(page);
      const tokensPage: TokensPage = new TokensPage(page);

      await tokensPage.uploadImage('images/images.png');
      await tokensPage.tokensComp.isTokenDisabledWithName('BORDER-RADIUS-1', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('COLOR-1', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('DIMENSIONS-1', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('FONT-SIZE-100', true);
      await tokensPage.tokensComp.isTokenDisabledWithName('OPACITY-20', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('ROTATION-15', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('SIZING-0.5', false);
      await tokensPage.tokensComp.isTokenDisabledWithName('SPACING-10', true);
      await tokensPage.tokensComp.isTokenDisabledWithName('STROKE-WIDTH-10', false);
    },
  );
});
