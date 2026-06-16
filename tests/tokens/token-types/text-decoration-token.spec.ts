import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

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
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  const decorationToken: MainToken<TokenClass> = {
    class: TokenClass.TextDecoration,
    name: 'text-decoration',
    value: 'underline',
  };

  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.TextDecoration,
    name: decorationToken.name,
    value: 'strike-through',
  };

  mainTest.beforeEach(async () => {
    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
  });

  mainTest(
    qase(
      [2526, 2531],
      'Apply a Text decoration token to a text layer and Edit a Text decoration token',
    ),
    async () => {
      await mainTest.step(
        `(2526) Apply "${decorationToken.name}" token to a text layer`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
            decorationToken,
          );
          await tokensPage.tokensComp.isTokenVisibleWithName(decorationToken.name);
          await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await designPanelPage.isTextUnderlineChecked();
        },
      );

      await mainTest.step(
        `(2531) Edit "${decorationToken.name}" token to "${updatedTokenData.value}" and verify token is still applied and strikethrough is shown`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(
            updatedTokenData,
          );
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await designPanelPage.isTextStrikethroughChecked();
        },
      );
    },
  );

  mainTest(
    qase(2535, 'Re-Apply the token after change the decorator manually'),
    async () => {
      await mainTest.step(
        `Apply "${decorationToken.name}" token to a text layer`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
            decorationToken,
          );
          await tokensPage.tokensComp.isTokenVisibleWithName(decorationToken.name);
          await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        `Verify "${decorationToken.name}" token is applied with underline`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await designPanelPage.isTextUnderlineChecked();
        },
      );

      await mainTest.step(
        'Manually change to strikethrough and verify token is detached',
        async () => {
          await designPanelPage.clickOnTextStrikethroughButton();
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(
            decorationToken.name,
            false,
          );
          await designPanelPage.isTextStrikethroughChecked();
        },
      );

      await mainTest.step(
        'Re-apply token and verify underline is restored',
        async () => {
          await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
          await designPanelPage.isTextUnderlineChecked();
        },
      );
    },
  );
});
