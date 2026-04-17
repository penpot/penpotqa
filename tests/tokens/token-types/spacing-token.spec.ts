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
  qase(2202, 'Apply default "all gaps" token to a grid board (by left click)'),
  async () => {
    const spacingToken: MainToken<TokenClass> = {
      class: TokenClass.Spacing,
      name: 'spacing',
      value: '-20',
    };

    await mainPage.createDefaultBoardByCoordinates(320, 210);
    await mainPage.addGridLayoutViaRightClick();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(spacingToken);

    await tokensPage.tokensComp.isTokenVisibleWithName(spacingToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(spacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(spacingToken.name);
    await designPanelPage.checkRowGap(spacingToken.value);
    await designPanelPage.checkColumnGap(spacingToken.value);
    await expect(mainPage.viewport).toHaveScreenshot('board-spacing-20.png', {
      mask: mainPage.maskViewport(),
    });
    await tokensPage.tokensComp.isAllMenuItemWithSectionNameSelected(
      spacingToken.name,
      'Gaps',
    );
  },
);
