import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const teamName = createTeamName();
const ariaLabel: string = 'Width';

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await tokensPage.toolsComp.clickOnTokenToolsButton();
    await tokensPage.toolsComp.importTokens(
      'documents/tokens-for-each-category.json',
    );
    await tokensPage.setsComp.isSetNameVisible('Global');
  });

  mainTest(
    qase(
      [2905, 2873],
      'Selecting a token via the Token Icon and detaching via the detach button ',
    ),
    async () => {
      const tokenName: string = 'SIZING-2';
      const tokenValue: string = '2';

      await mainTest.step(
        '(2905) Selecting a token via the Token Icon updates the input value applied to a shape',
        async () => {
          await mainTest.step('Create rectangle', async () => {
            await tokensPage.createDefaultRectangleByCoordinates(100, 200);
          });

          await mainTest.step('Hover on Width field in Design tab', async () => {
            await designPanelPage.hoverOnWidthForLayer();
          });

          await mainTest.step('Open token list in Width field', async () => {
            const widthFieldIndex = 1;
            await designPanelPage.openTokenListByIndex(widthFieldIndex);
          });

          await mainTest.step('Select token in token list by name', async () => {
            await designPanelPage.selectTokenInTokenListByName(tokenName);
          });

          await mainTest.step('Check applied token', async () => {
            await designPanelPage.checkSizeWidth(tokenValue);
          });

          await mainTest.step(
            'Hover in token value, check tooltip and detach token button',
            async () => {
              await designPanelPage.hoverOnTokenPill(ariaLabel);
              await designPanelPage.isTokenPillTooltipVisible(tokenName);
              await designPanelPage.isDetachTokenButtonVisible();
            },
          );

          await mainTest.step('Check applied token in Token tab', async () => {
            await tokensPage.tokensComp.expandTokenByName(TokenClass.Sizing);
            await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
          });
        },
      );
      await mainTest.step(
        '(2873) Detaching via detach button removes token and displays raw value in the numeric input',
        async () => {
          await mainTest.step('Detach token', async () => {
            await designPanelPage.clickOnDetachTokenButton();
            await designPanelPage.checkSizeWidth(tokenValue);
          });

          await mainTest.step('Check unapplied token in Token tab', async () => {
            await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);
          });

          await mainTest.step('Edit width', async () => {
            const newWidthValue: string = '10';
            await designPanelPage.changeWidthForLayer(newWidthValue);
            await designPanelPage.checkSizeWidth(newWidthValue);
          });
        },
      );
    },
  );
});

mainTest(
  qase(2865, 'Broken token references are clearly displayed with a red dot'),
  async () => {
    const dimensionTokenA: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'dimension-A',
      value: '550.5',
    };

    const dimensionTokenB: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'dimension-B',
      value: '{dimension-A}',
    };

    await mainTest.step('Create a dimension token', async () => {
      await tokensPage.clickTokensTab();
      await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionTokenA);
      await tokensPage.tokensComp.isTokenVisibleWithName(dimensionTokenA.name);
    });

    await mainTest.step(
      'Create another dimension token referencing the first one',
      async () => {
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionTokenB);
        await tokensPage.tokensComp.isTokenVisibleWithName(dimensionTokenB.name);
      },
    );

    await mainTest.step('Create rectangle', async () => {
      await tokensPage.createDefaultRectangleByCoordinates(100, 200);
    });

    await mainTest.step('Open token list in Width field', async () => {
      const widthFieldIndex = 0;
      await designPanelPage.openTokenListByIndex(widthFieldIndex);
    });

    await mainTest.step(
      'Select the second token in token list by name',
      async () => {
        await designPanelPage.selectTokenInTokenListByName(dimensionTokenB.name);
      },
    );

    await mainTest.step('Check applied token', async () => {
      await designPanelPage.checkSizeWidth(dimensionTokenA.value);
    });

    await mainTest.step('Delete the referenced token', async () => {
      await tokensPage.tokensComp.deleteToken(dimensionTokenA.name);
      await tokensPage.tokensComp.isTokenVisibleWithName(
        dimensionTokenA.name,
        false,
      );
    });

    await mainTest.step('Check value and not valid reference in input', async () => {
      await designPanelPage.checkSizeWidth(dimensionTokenA.value);
      await designPanelPage.isNotValidReferencedButtonVisible();
    });

    await mainTest.step('Hover in token value and check tooltip', async () => {
      const errorMessage: string =
        'Reference is not valid or is not in any active set';
      await designPanelPage.hoverOnTokenPill(ariaLabel);
      await designPanelPage.isTokenPillTooltipVisible(errorMessage);
    });
  },
);
