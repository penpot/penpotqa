import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await tokensPage.clickTokensTab();
  await tokensPage.toolsComp.clickOnTokenToolsButton();
  await tokensPage.toolsComp.importTokens('documents/tokens-for-each-category.json');
  await tokensPage.setsComp.isSetNameVisible('Global');
});

mainTest(qase(3055, 'Select a token from the value input dropdown'), async () => {
  const spacingToken: MainToken<TokenClass> = {
    class: TokenClass.Spacing,
    name: 'combobox-spacing',
  };
  const referencedTokenName = 'SPACING-10';

  await mainTest.step('Open the Spacing token creation form', async () => {
    await tokensPage.tokensComp.clickOnAddTokenButton(spacingToken);
  });

  await mainTest.step('Click the dropdown arrow on the value input', async () => {
    await tokensPage.mainTokensComp.openValueDropdown();
    await tokensPage.mainTokensComp.checkValueDropdownListVisible();
    await tokensPage.mainTokensComp.checkValueDropdownOptionVisible(
      referencedTokenName,
    );
  });

  await mainTest.step(
    `Select "${referencedTokenName}" token from the list`,
    async () => {
      await tokensPage.mainTokensComp
        .getValueDropdownOption(referencedTokenName)
        .click();
      await tokensPage.mainTokensComp.checkTokenValueInputText(
        `{${referencedTokenName}}`,
      );
      await tokensPage.mainTokensComp.checkResolvedValueText('Resolved value: 10');
    },
  );
});
