import { MainPage } from '../../pages/workspace/main-page';
import { mainTest } from '../../fixtures';
import { random } from '../../helpers/string-generator';
import { TeamPage } from '../../pages/dashboard/team-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { TypographyToken } from '../../pages/workspace/tokens/typography-tokens-component';
import { TokensPage } from '../../pages/workspace/tokens/tokens-page';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page, browserName }) => {
  let mainPage = new MainPage(page);
  let teamPage = new TeamPage(page);
  let dashboardPage = new DashboardPage(page);

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
  let mainPage = new MainPage(page);
  let teamPage = new TeamPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let token: TypographyToken;
  let tokensPage: TokensPage;

  mainTest.beforeEach(async ({ page, browserName }) => {
    tokensPage = new TokensPage(page);
    mainPage = new MainPage(page);

    token = {
      name: 'global.token-component',
      fontFamily: 'Karla',
      fontWeight: '400 Italic',
      fontSize: '12',
      lineHeight: '1px',
      letterSpacing: '1',
      textDecoration: 'uppercase',
      textCase: 'underline',
    };

    await mainPage.createDefaultTextLayerByCoordinates(500, 500, browserName);
    await tokensPage.tokensTab.click();
  });

  mainTest(qase([2585, 2586], 'Create, edit a typography token'), async () => {
    await mainTest.step(
      'PENPOT-2584 Create typography token with complete property set',
      async () => {
        await tokensPage.addToken('Typography', token.name);
        await tokensPage.tokensComp.isTokenVisibleWithName(token.name);
      },
    );
  });
});
