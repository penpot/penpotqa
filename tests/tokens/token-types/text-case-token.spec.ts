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

mainTest(
  qase(2522, 'Apply a capitalize text case token to a uppercase text layer'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const textCaseToken: MainToken<TokenClass> = {
      class: TokenClass.TextCase,
      name: 'text-case-capitalize',
      value: 'Capitalize',
    };
    const text = 'EXAMPLE TEXT';

    await mainPage.createTextLayerByCoordinates(100, 200, text);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(textCaseToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(textCaseToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(textCaseToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name);
    await designPanelPage.checkTextCase(textCaseToken.value);
  },
);

mainTest(qase(2520, 'Override and re-apply a text case token'), async ({ page }) => {
  const mainPage: MainPage = new MainPage(page);
  const tokensPage: TokensPage = new TokensPage(page);
  const designPanelPage: DesignPanelPage = new DesignPanelPage(page);
  const assetsPanelPage: AssetsPanelPage = new AssetsPanelPage(page);

  const textCaseToken: MainToken<TokenClass> = {
    class: TokenClass.TextCase,
    name: 'text-case-capitalize',
    value: 'Capitalize',
  };
  const text = 'EXAMPLE TEXT';

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickAddFileLibraryTypographyButton();
  await assetsPanelPage.selectTextCase('Upper');
  await assetsPanelPage.minimizeFileLibraryTypography();
  await assetsPanelPage.waitForChangeIsSaved();

  await tokensPage.clickTokensTab();
  await mainPage.createTextLayerByCoordinates(100, 200, text);
  await tokensPage.tokensComp.createTokenViaAddButtonAndSave(textCaseToken);
  await tokensPage.tokensComp.isTokenVisibleWithName(textCaseToken.name);
  await tokensPage.tokensComp.clickOnTokenWithName(textCaseToken.name);
  await mainPage.waitForChangeIsSaved();

  await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name);
  await designPanelPage.checkTextCase(textCaseToken.value);

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickOnTypographyMenuButton();
  await designPanelPage.checkTextCase('Upper');

  await tokensPage.clickTokensTab();
  await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name, false);

  await tokensPage.tokensComp.clickOnTokenWithName(textCaseToken.name);
  await mainPage.waitForChangeIsSaved();
  await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name);
  await designPanelPage.checkTextCase(textCaseToken.value);

  await designPanelPage.changeTextCase('Lower');
  await mainPage.waitForChangeIsSaved();
  await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name, false);
  await designPanelPage.checkTextCase('Lower');
});
