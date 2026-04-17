import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
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
  qase(2172, 'Apply default "opacity" token to an image (by left click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);

    const opacityToken: MainToken<TokenClass> = {
      class: TokenClass.Opacity,
      name: 'opacity',
      value: '0.7',
    };

    await mainPage.uploadImage('images/sample.jpeg');
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(opacityToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(opacityToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(opacityToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(opacityToken.name);
    await expect(mainPage.viewport).toHaveScreenshot('image-opacity-0-7.png', {
      mask: mainPage.maskViewport(),
    });
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      opacityToken.name,
      'Opacity',
    );
  },
);
