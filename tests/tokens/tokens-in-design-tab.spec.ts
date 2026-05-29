import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.toolsComp.clickOnTokenToolsButton();
    await tokensPage.toolsComp.importTokens(
      'documents/tokens-for-each-category.json',
    );
    await tokensPage.setsComp.isSetNameVisible('Global');
  });

  mainTest(
    qase(
      2905,
      'Selecting a token via the Token Icon updates the input value applied to a shape',
    ),
    async () => {
      await mainTest.step('Create rectangle', async () => {
        await tokensPage.createDefaultRectangleByCoordinates(100, 200);
      });
      await mainTest.step('Open Layers tab', async () => {
        await layersPanelPage.openLayersTab();
      });
      await mainTest.step('Hover on Width field in Design tab', async () => {
        await designPanelPage.hoverOnWidthForLayer();
      });
      await mainTest.step('Open token list in Width field', async () => {
        const widthFieldIndex = 1;
        await designPanelPage.openTokenListByIndex(widthFieldIndex);
      });
    },
  );
});
