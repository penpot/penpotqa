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
  qase(2215, 'Apply default "stroke width" token to a path (by left click)'),
  async () => {
    const strokeToken: MainToken<TokenClass> = {
      class: TokenClass.StrokeWidth,
      name: 'stroke-width',
      value: '5.5',
    };

    await mainTest.step('Create path and stroke width token', async () => {
      await mainPage.createDefaultOpenPath();
      await tokensPage.clickTokensTab();
      await tokensPage.tokensComp.createTokenViaAddButtonAndSave(strokeToken);
      await tokensPage.tokensComp.isTokenVisibleWithName(strokeToken.name);
    });

    await mainTest.step(
      `Apply "${strokeToken.name}" token and verify stroke width`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(strokeToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(strokeToken.name);
        await designPanelPage.checkStrokeWidth(strokeToken.value);
      },
    );

    await mainTest.step(
      'Verify screenshot and Stroke Width menu item is selected',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-stroke-width-5-5.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await tokensPage.tokensComp.isMenuItemWithNameSelected(
          strokeToken.name,
          'Stroke Width',
        );
      },
    );
  },
);
