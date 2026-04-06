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

let mainPage: MainPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let tokensPage: TokensPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);

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
  mainTest(
    qase([2728], 'Display token pill for single-segment token name'),
    async () => {
      const singleSegmentToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: 'big',
        value: '10',
      };

      await mainTest.step('Open Tokens panel', async () => {
        await tokensPage.clickTokensTab();
      });

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
          await tokensPage.tokensComp.isTokenSingleSegment(singleSegmentToken.name);
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

  mainTest(
    qase(
      [2730],
      'Tokens with the same path are displayed under the same nested group path',
    ),
    async () => {
      const primarySmallToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: 'primary.small',
        value: '4',
        parent: { name: 'primary' },
      };
      const primaryBigToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: `${primarySmallToken.parent!.name}.big`,
        value: '16',
        parent: primarySmallToken.parent,
      };

      await mainTest.step('Open Tokens panel', async () => {
        await tokensPage.clickTokensTab();
      });

      await mainTest.step(
        `Create first token with path name "${primarySmallToken.parent!.name}.small"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            primarySmallToken,
          );
        },
      );

      await mainTest.step(
        `Verify group "${primarySmallToken.parent!.name}" is visible and pill "small" appears under it`,
        async () => {
          await tokensPage.tokensComp.isTokenGroupVisible(primarySmallToken.parent!);
          await tokensPage.tokensComp.isTokenVisibleInGroup(
            primarySmallToken.parent!,
            primarySmallToken.name,
          );
          await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
            primarySmallToken.parent!,
            'small',
          );
        },
      );

      await mainTest.step(
        `Create second token with path name "${primaryBigToken.parent!.name}.big"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            primaryBigToken,
          );
        },
      );

      await mainTest.step(
        `Verify "${primarySmallToken.parent!.name}" group contains both "small" and "big" token pills`,
        async () => {
          await tokensPage.tokensComp.isTokenVisibleInGroup(
            primarySmallToken.parent!,
            primarySmallToken.name,
          );
          await tokensPage.tokensComp.isTokenVisibleInGroup(
            primarySmallToken.parent!,
            primaryBigToken.name,
          );
          await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
            primarySmallToken.parent!,
            'small',
          );
          await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
            primarySmallToken.parent!,
            'big',
          );
        },
      );

      await mainTest.step(
        'Verify only one "primary" group exists in the UI',
        async () => {
          await tokensPage.tokensComp.isTokenGroupCount(
            primarySmallToken.parent!,
            1,
          );
        },
      );

      await mainTest.step(
        'Snapshot of the Border Radius section showing the nested group structure',
        async () => {
          const borderRadiusSection = tokensPage.page
            .locator('[class*="token-section-wrapper"]')
            .filter({
              has: tokensPage.page.locator(
                '[aria-controls="token-tree-border-radius"]',
              ),
            });
          await expect(borderRadiusSection).toHaveScreenshot(
            'token-group-primary-nested.png',
          );
        },
      );
    },
  );

  mainTest(
    qase(
      [2735],
      'Editing token path moves token to an existing group path and unfolds the new path',
    ),
    async () => {
      const foundationBigToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: 'foundation.big',
        value: '16',
        parent: { name: 'foundation' },
      };
      const primarySmallToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: 'primary.small',
        value: '4',
        parent: { name: 'primary' },
      };
      const renamedTokenName = 'foundation.small';

      await mainTest.step('Open Tokens panel', async () => {
        await tokensPage.clickTokensTab();
      });

      await mainTest.step(
        'Create token "foundation.big" to ensure the "foundation" group exists',
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            foundationBigToken,
          );
        },
      );

      await mainTest.step(
        'Verify "foundation" group exists and contains "big" token pill',
        async () => {
          await tokensPage.tokensComp.isTokenGroupVisible(
            foundationBigToken.parent!,
          );
          await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
            foundationBigToken.parent!,
            'big',
          );
        },
      );

      await mainTest.step(
        'Create token "primary.small" under a different path',
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            primarySmallToken,
          );
        },
      );

      await mainTest.step(
        'Collapse the "foundation" group to simulate a previously collapsed destination',
        async () => {
          await tokensPage.tokensComp.clickOnTokenGroup(foundationBigToken.parent!);
          await tokensPage.tokensComp.isTokenGroupExpanded(
            foundationBigToken.parent!,
            false,
          );
        },
      );

      await mainTest.step(
        'Edit "primary.small" and rename it to "foundation.small"',
        async () => {
          await tokensPage.tokensComp.clickEditToken(primarySmallToken);
          await tokensPage.tokensComp.tokenNameInput.fill(renamedTokenName);
          await tokensPage.tokensComp.baseComp.modalSaveButton.click();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify "foundation" group is automatically expanded after saving',
        async () => {
          await tokensPage.tokensComp.isTokenGroupExpanded(
            foundationBigToken.parent!,
          );
        },
      );

      await mainTest.step(
        'Verify "small" token pill is visible under the "foundation" group without manual expansion',
        async () => {
          await tokensPage.tokensComp.isTokenVisibleInGroup(
            foundationBigToken.parent!,
            renamedTokenName,
          );
          await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
            foundationBigToken.parent!,
            'small',
          );
        },
      );

      await mainTest.step(
        'Verify "primary" group is removed from the DOM after moving its only token out',
        async () => {
          await tokensPage.tokensComp.isTokenGroupCount(
            primarySmallToken.parent!,
            0,
          );
        },
      );
    },
  );
});
