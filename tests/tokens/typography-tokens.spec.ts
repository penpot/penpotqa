import { MainPage } from '@pages/workspace/main-page';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { TypographyToken } from '@pages/workspace/tokens/token-components/typography-tokens-component';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

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
  let tokensPage: TokensPage;

  const typographyToken: TypographyToken<TokenClass> = {
    class: TokenClass.Typography,
    name: 'global.typography',
    fontFamily: 'Roboto Serif',
    fontWeight: '400 Italic',
    fontSize: '16px',
    lineHeight: '1.5',
    letterSpacing: '0.5px',
    textDecoration: 'underline',
    textCase: 'uppercase',
    description: 'Autotest typography token',
  };

  mainTest.beforeEach(async ({ page, browserName }) => {
    tokensPage = new TokensPage(page);
    mainPage = new MainPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(500, 500, browserName);
    await tokensPage.tokensTab.click();
  });

  mainTest(
    qase(
      [2584, 2586, 2592, 2610, 2606, 2607],
      'Create and edit a typography token, validating invalid values',
    ),
    async () => {
      await mainTest.step(
        'PENPOT-2584 Create typography token with complete property set',
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
            typographyToken,
          );
          await tokensPage.mainTokensComp.isTokenVisibleWithName(
            typographyToken.name,
          );
        },
      );
      await mainTest.step('PENPOT-2586 Edit a typography token', async () => {
        // TODO: implement test case PENPOT-2586
        //  - Trying to reuse code from the `createTokenViaAddButton` method in `tokens-page.ts`
        //  - Value moving the generic Token methods from `tokens-page.ts` to `tokens-component.ts`
      });
      // TODO: implement the rest of the steps (2592, 2610, 2606, 2607)
    },
  );
});
