import { expect } from '@playwright/test';
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
  qase(2215, 'Apply default "stroke width" token to a path (by left click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const strokeToken: MainToken<TokenClass> = {
      class: TokenClass.StrokeWidth,
      name: 'stroke-width',
      value: '5.5',
    };

    await mainPage.createDefaultOpenPath();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(strokeToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(strokeToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(strokeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(strokeToken.name);
    await designPanelPage.checkStrokeWidth(strokeToken.value);
    await expect(mainPage.viewport).toHaveScreenshot('path-stroke-width-5-5.png', {
      mask: mainPage.maskViewport(),
    });
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      strokeToken.name,
      'Stroke Width',
    );
  },
);
