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

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
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

mainTest(
  qase(2224, 'Apply 2 different kind of tokens overriding the same shape property'),
  async () => {
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

    await mainPage.createDefaultEllipseByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(dimensionToken.name);
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(sizingToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(sizingToken.name);

    await tokensPage.tokensComp.clickOnTokenWithName(sizingToken.name);
    await designPanelPage.checkSizeWidth(sizingToken.value);
    await designPanelPage.checkSizeHeight(sizingToken.value);
    await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name);
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name, false);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'SizeAll',
    );
    await mainPage.clickBoardOnCanvas();

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
