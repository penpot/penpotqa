import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
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

mainTest(
  qase(2218, 'Apply "X/Y axis" dimension token to a text (by right click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const dimensionToken: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'dimension',
      value: '550.5',
    };

    const defaultX = '100';
    const defaultY = '200';

    await mainPage.createDefaultTextLayerByCoordinates(
      parseInt(defaultX),
      parseInt(defaultY),
    );
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(dimensionToken.name);
    await designPanelPage.checkXAxis(defaultX);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.tokensComp.selectMenuItem(dimensionToken.name, 'AxisX');
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name);
    await designPanelPage.checkXAxis(dimensionToken.value);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.tokensComp.selectMenuItem(dimensionToken.name, 'Y');
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name);
    await designPanelPage.checkXAxis(dimensionToken.value);
    await designPanelPage.checkYAxis(dimensionToken.value);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      dimensionToken.name,
      'AxisX',
    );
    await tokensPage.tokensComp.isMenuItemWithNameSelected(dimensionToken.name, 'Y');
  },
);
