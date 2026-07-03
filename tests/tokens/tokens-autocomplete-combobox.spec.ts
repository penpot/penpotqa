import { expect } from '@playwright/test';
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

mainTest(qase([3055], 'Select a token from the value input dropdown'), async () => {
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

mainTest(
  qase([3063], 'Entering an out-of-range value triggers validation on blur'),
  async () => {
    const opacityToken: MainToken<TokenClass> = {
      class: TokenClass.Opacity,
      name: 'combobox-opacity',
    };
    const outOfRangeValue = '150';
    const errorMessage =
      'Opacity must be between 0 and 100% or 0 and 1 (e.g. 50% or 0.5).';

    await mainTest.step('Open the Opacity token creation form', async () => {
      await tokensPage.tokensComp.clickOnAddTokenButton(opacityToken);
    });

    await mainTest.step(
      `Type an out-of-range value "${outOfRangeValue}" and blur the field`,
      async () => {
        await tokensPage.tokensComp.fillTokenValue(outOfRangeValue);
        await tokensPage.tokensComp.clickOnTokenNameInput();
      },
    );

    await mainTest.step(
      'Check the validation error is shown, the form stays open, and the field remains editable',
      async () => {
        await tokensPage.tokensComp.isErrorHintMessageVisible(errorMessage);
        await expect(
          tokensPage.tokensComp.createTokenModal,
          'Create token modal is still open',
        ).toBeVisible();
        await expect(
          tokensPage.mainTokensComp.tokenValueInput,
          'Value input remains editable',
        ).toBeEditable();
      },
    );
  },
);

mainTest(
  qase([3064], 'Token dropdown only lists tokens of allowed reference types'),
  async () => {
    const borderRadiusToken: MainToken<TokenClass> = {
      class: TokenClass.BorderRadius,
      name: 'BORDER-RADIUS-1',
    };
    const spacingToken: MainToken<TokenClass> = {
      class: TokenClass.Spacing,
      name: 'SPACING-5',
    };
    const colorTokenName = 'COLOR-1';

    await mainTest.step(
      `Edit "${borderRadiusToken.name}" and open its value dropdown`,
      async () => {
        await tokensPage.tokensComp.expandTokenByName(TokenClass.BorderRadius);
        await tokensPage.tokensComp.clickEditToken(borderRadiusToken);
        await tokensPage.mainTokensComp.openValueDropdown();
      },
    );

    await mainTest.step(
      `Check the dropdown lists Dimension tokens but not the Color token "${colorTokenName}"`,
      async () => {
        await tokensPage.mainTokensComp.checkValueDropdownOptionVisible(
          'DIMENSIONS-1',
        );
        await tokensPage.mainTokensComp.checkValueDropdownOptionVisible(
          colorTokenName,
          false,
        );
      },
    );

    await mainTest.step('Close the Border Radius edit form', async () => {
      await tokensPage.mainTokensComp.closeValueDropdown();
      await tokensPage.tokensComp.clickCancelButton();
    });

    await mainTest.step(
      `Edit "${spacingToken.name}" and open its value dropdown`,
      async () => {
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Spacing);
        await tokensPage.tokensComp.clickEditToken(spacingToken);
        await tokensPage.mainTokensComp.openValueDropdown();
      },
    );

    await mainTest.step(
      `Check the dropdown lists the Dimension token but not the Sizing or Color tokens ("${colorTokenName}")`,
      async () => {
        await tokensPage.mainTokensComp.checkValueDropdownOptionVisible(
          'DIMENSIONS-1',
        );
        await tokensPage.mainTokensComp.checkValueDropdownOptionVisible(
          'SIZING-2',
          false,
        );
        await tokensPage.mainTokensComp.checkValueDropdownOptionVisible(
          colorTokenName,
          false,
        );
      },
    );
  },
);
