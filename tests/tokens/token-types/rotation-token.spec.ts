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

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
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

mainTest(
  qase(2175, 'Apply default "rotation" token to a text (by left click)'),
  async ({ browserName }) => {
    const rotationToken: MainToken<TokenClass> = {
      class: TokenClass.Rotation,
      name: 'rotation',
      value: '-(22.5+22.5)',
    };
    const tokenResolvedValue = '315'; // 315 == -45 == -(22.5+22.5)

    await mainPage.createDefaultTextLayerByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(rotationToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(rotationToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(rotationToken.name);
    await tokensPage.tokensComp.isTokenAppliedWithName(rotationToken.name);
    await designPanelPage.checkRotationForLayer(tokenResolvedValue);
    browserName === 'chromium' ? await mainPage.waitForChangeIsUnsaved() : null;
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-rotated-315.png', {
      mask: mainPage.maskViewport(),
    });
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      rotationToken.name,
      'Rotation',
    );
  },
);
