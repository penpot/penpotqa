import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
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

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let assetsPanelPage: AssetsPanelPage;

  const letterSpacingToken: MainToken<TokenClass> = {
    class: TokenClass.LetterSpacing,
    name: 'letter-spacing',
    value: '10',
  };
  const newTokenValue = '5';

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    assetsPanelPage = new AssetsPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(letterSpacingToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2500, 'Apply a Letter Spacing token and override value from Design tab'),
    async () => {
      await tokensPage.tokensComp.isTokenAppliedWithName(letterSpacingToken.name);
      await designPanelPage.checkLetterSpacing(letterSpacingToken.value);
      await designPanelPage.changeTextLetterSpacing(newTokenValue);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(
        letterSpacingToken.name,
        false,
      );
      await designPanelPage.checkLetterSpacing(newTokenValue);
    },
  );

  mainTest(
    qase(
      2501,
      'Letter Spacing token value can be override by Assets > Typography style',
    ),
    async () => {
      await tokensPage.tokensComp.isTokenAppliedWithName(letterSpacingToken.name);
      await designPanelPage.checkLetterSpacing(letterSpacingToken.value);

      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickAddFileLibraryTypographyButton();
      await assetsPanelPage.waitForChangeIsSaved();
      await assetsPanelPage.selectLetterSpacing(newTokenValue);
      await designPanelPage.clickOnEnter();
      await assetsPanelPage.waitForChangeIsSaved();

      await tokensPage.clickTokensTab();
      await designPanelPage.clickOnTypographyMenuButton();
      await tokensPage.tokensComp.isTokenAppliedWithName(
        letterSpacingToken.name,
        false,
      );
      await designPanelPage.checkLetterSpacing(newTokenValue);
    },
  );
});

mainTest(
  qase(
    2536,
    'Reference a dimension-type token as an operand (math operation / Dimensions token)',
  ),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);

    const dimensionToken: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'dimension',
      value: '2',
    };
    const letterSpacingToken: MainToken<TokenClass> = {
      class: TokenClass.LetterSpacing,
      name: 'letter-spacing',
      value: `5px*{${dimensionToken.name}}`,
    };

    const updatedTokenData: MainToken<TokenClass> = {
      class: TokenClass.LetterSpacing,
      name: letterSpacingToken.name,
      value: `5px/{${dimensionToken.name}}`,
    };

    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);

    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(letterSpacingToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${letterSpacingToken.value}\n` +
        'Resolved value: 10',
    );

    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 2.5',
    );

    updatedTokenData.value = `5px+{${dimensionToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 7',
    );

    updatedTokenData.value = `5px-{${dimensionToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 3',
    );
  },
);
