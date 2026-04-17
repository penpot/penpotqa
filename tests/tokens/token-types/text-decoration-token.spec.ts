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

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
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

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;

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

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(decorationToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(decorationToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(2531, 'Edit a Text decoration token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
    await designPanelPage.isTextStrikethroughChecked();
  });

  mainTest(
    qase(2535, 'Re-Apply the token after change the decorator manually'),
    async () => {
      await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
      await designPanelPage.isTextUnderlineChecked();
      await designPanelPage.clickOnTextStrikethroughButton();
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(
        decorationToken.name,
        false,
      );
      await designPanelPage.isTextStrikethroughChecked();
      await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
      await designPanelPage.isTextUnderlineChecked();
    },
  );
});
