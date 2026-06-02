import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import {
  TokenClass,
  buildTokenPath,
} from '@pages/workspace/tokens/token-components/tokens-base-component';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

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
  await tokensPage.clickTokensTab();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe('Context menu > Delete', () => {
  mainTest(qase([2742], 'Remove a tokens group'), async () => {
    const tokenValue = '#000000';
    const foundationsGroup = { name: 'foundations' };
    const primaryGroup = { name: 'primary', parent: foundationsGroup };

    const darkToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: buildTokenPath('dark', primaryGroup),
      value: tokenValue,
    };
    const accentToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: buildTokenPath('accent', primaryGroup),
      value: tokenValue,
    };
    const foregroundToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: buildTokenPath('foreground', primaryGroup),
      value: tokenValue,
    };
    const backgroundToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: buildTokenPath('background', primaryGroup),
      value: tokenValue,
    };

    await mainTest.step(
      `Create color tokens "${darkToken.name}", "${accentToken.name}", "${foregroundToken.name}" and "${backgroundToken.name}"`,
      async () => {
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(darkToken);
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(accentToken);
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(foregroundToken);
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(backgroundToken);
      },
    );

    await mainTest.step(
      `Verify "${foundationsGroup.name}" and "${primaryGroup.name}" groups are visible and contain the expected tokens`,
      async () => {
        await tokensPage.tokensComp.isTokenGroupVisible(foundationsGroup);
        await tokensPage.tokensComp.isTokenGroupVisible(primaryGroup);
        await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
          primaryGroup,
          'dark',
        );
        await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
          primaryGroup,
          'accent',
        );
        await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
          primaryGroup,
          'foreground',
        );
        await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
          primaryGroup,
          'background',
        );
      },
    );

    await mainTest.step(
      `Delete "${foundationsGroup.name}" group and verify "${foundationsGroup.name}", "${primaryGroup.name}" groups and tokens "${darkToken.name}", "${accentToken.name}", "${foregroundToken.name}", "${backgroundToken.name}" are removed`,
      async () => {
        await tokensPage.tokensComp.deleteTokenGroup(foundationsGroup);
        await tokensPage.tokensComp.isTokenGroupCount(foundationsGroup, 0);
        await tokensPage.tokensComp.isTokenGroupCount(primaryGroup, 0);
        await tokensPage.tokensComp.isTokenVisibleWithName(darkToken.name, false);
        await tokensPage.tokensComp.isTokenVisibleWithName(accentToken.name, false);
        await tokensPage.tokensComp.isTokenVisibleWithName(
          foregroundToken.name,
          false,
        );
        await tokensPage.tokensComp.isTokenVisibleWithName(
          backgroundToken.name,
          false,
        );
      },
    );
  });

  mainTest(
    qase(
      [2745],
      'Remove a tokens group (with a token referenced in other tokens group)',
    ),
    async () => {
      const primaryGroup = { name: 'primary' };
      const secondaryGroup = { name: 'secondary' };
      const primaryToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: `${primaryGroup.name}.border-radius30`,
        value: '30',
      };
      const secondaryToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: `${secondaryGroup.name}.border-radius60`,
        value: `{${primaryToken.name}}+2`,
      };

      await mainTest.step(
        `Create token "${primaryToken.name}" with value "${primaryToken.value}"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(primaryToken);
        },
      );

      await mainTest.step(
        `Create token "${secondaryToken.name}" with value "${secondaryToken.value}" referencing "${primaryToken.name}"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            secondaryToken,
          );
        },
      );

      await mainTest.step(
        `Verify "${primaryGroup.name}" and "${secondaryGroup.name}" groups are visible`,
        async () => {
          await tokensPage.tokensComp.isTokenGroupVisible(primaryGroup);
          await tokensPage.tokensComp.isTokenGroupVisible(secondaryGroup);
        },
      );

      await mainTest.step(
        `Delete "${primaryGroup.name}" group and verify group and token "${primaryToken.name}" are removed`,
        async () => {
          await tokensPage.tokensComp.deleteTokenGroup(primaryGroup);
          await tokensPage.tokensComp.isTokenGroupCount(primaryGroup, 0);
          await tokensPage.tokensComp.isTokenVisibleWithName(
            primaryToken.name,
            false,
          );
        },
      );

      await mainTest.step(
        `Verify "${secondaryToken.name}" is highlighted as invalid and shows "Reference is not valid or is not in any active set" tooltip`,
        async () => {
          await tokensPage.tokensComp.checkInvalidTokenCount(1);
          await tokensPage.tokensComp.invalidToken.hover();
          await expect(tokensPage.tokensComp.invalidToken).toHaveAttribute(
            'title',
            'Reference is not valid or is not in any active set',
          );
        },
      );
    },
  );

  mainTest(
    qase([2743], 'Remove a token in a tokens group (with only one token)'),
    async () => {
      const tokenValue = '#000000';
      const foundationsGroup = { name: 'foundations' };
      const primaryGroup = { name: 'primary', parent: foundationsGroup };

      const darkToken: MainToken<TokenClass> = {
        class: TokenClass.Color,
        name: buildTokenPath('dark', primaryGroup),
        value: tokenValue,
      };

      await mainTest.step('Open Tokens panel', async () => {
        await tokensPage.clickTokensTab();
      });

      await mainTest.step(`Create color token "${darkToken.name}"`, async () => {
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(darkToken);
      });

      await mainTest.step(
        `Verify "${foundationsGroup.name}" and "${primaryGroup.name}" groups are visible`,
        async () => {
          await tokensPage.tokensComp.isTokenGroupVisible(foundationsGroup);
          await tokensPage.tokensComp.isTokenGroupVisible(primaryGroup);
        },
      );

      await mainTest.step(
        `Delete "${darkToken.name}" token and verify it is removed along with "${foundationsGroup.name}" and "${primaryGroup.name}" groups`,
        async () => {
          await tokensPage.tokensComp.deleteToken(darkToken.name);
          await tokensPage.tokensComp.isTokenVisibleWithName(darkToken.name, false);
          await tokensPage.tokensComp.isTokenGroupCount(foundationsGroup, 0);
          await tokensPage.tokensComp.isTokenGroupCount(primaryGroup, 0);
        },
      );
    },
  );
});
