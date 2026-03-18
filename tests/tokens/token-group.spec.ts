import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const teamName = random().concat('autotest');

mainTest.beforeEach(
  'Create a team and a new file',
  async ({ page, browserName }) => {
    const teamPage = new TeamPage(page);
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);

    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await dashboardPage.createFileViaPlaceholder();
    browserName === 'webkit' && !(await mainPage.isMainPageVisible())
      ? await dashboardPage.createFileViaPlaceholder()
      : null;
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
  },
);

mainTest.afterEach(async ({ page }) => {
  const mainPage = new MainPage(page);
  const teamPage = new TeamPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  let tokensPage: TokensPage;

  const singleSegmentToken: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'big',
    value: '10',
  };

  mainTest.beforeEach('Navigate to Tokens tab', async ({ page }) => {
    tokensPage = new TokensPage(page);
    await tokensPage.clickTokensTab();
  });

  mainTest(
    qase([2728], 'Display token pill for single-segment token name'),
    async () => {
      await mainTest.step(
        `Create a token with single-segment name "${singleSegmentToken.name}"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            singleSegmentToken,
          );
        },
      );

      await mainTest.step(
        `Verify token pill "${singleSegmentToken.name}" is visible with no nested group segments`,
        async () => {
          await tokensPage.tokensComp.isTokenVisibleWithName(
            singleSegmentToken.name,
          );
          const nameWrapper = tokensPage.page.locator(
            `span[aria-label="${singleSegmentToken.name}"][class*="name-wrapper"]`,
          );
          await expect(nameWrapper).toHaveText(singleSegmentToken.name);
          await expect(nameWrapper.locator('span')).toHaveCount(0);
        },
      );

      await mainTest.step(
        'Open context menu and verify Edit, Duplicate, Delete actions are visible',
        async () => {
          await tokensPage.tokensComp.rightClickOnTokenWithName(
            singleSegmentToken.name,
          );
          await expect(tokensPage.tokensComp.editTokenMenuItem).toBeVisible();
          await expect(tokensPage.tokensComp.duplicateTokenMenuItem).toBeVisible();
          await expect(tokensPage.tokensComp.deleteTokenMenuItem).toBeVisible();
        },
      );
    },
  );
});
