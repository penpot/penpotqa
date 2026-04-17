import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
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

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
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
  let tokensPage: TokensPage;
  let mainPage: MainPage;
  let designPanelPage: DesignPanelPage;

  const radiusToken: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'border-radius',
    value: '10',
    description: 'Description',
  };
  const newTokenValue = '20';

  mainTest.beforeEach(async ({ page }) => {
    tokensPage = new TokensPage(page);
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(radiusToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(radiusToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2125, 'Apply default "all radius" token to a rectangle (by left click)'),
    async () => {
      await mainTest.step(
        `Verify "${radiusToken.name}" token is applied and corner radius matches`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await designPanelPage.checkGeneralCornerRadius(radiusToken.value);
        },
      );

      await mainTest.step(
        'Verify screenshot and RadiusAll menu item is selected',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'rectangle-border-radius-1.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await tokensPage.tokensComp.isMenuItemWithNameSelected(
            radiusToken.name,
            'RadiusAll',
          );
        },
      );
    },
  );

  mainTest(
    qase(
      2166,
      'Edit a border radius token, already applied to a shape (with warning renaming message)',
    ),
    async () => {
      const radiusToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: 'border-radius',
        value: '-1',
        description: 'Description',
      };

      const updatedTokenData: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: radiusToken.name,
        value: newTokenValue,
      };

      await mainTest.step(
        `Edit "${radiusToken.name}" token to value "${updatedTokenData.value}" and verify it is applied`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(
            updatedTokenData,
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGeneralCornerRadius(updatedTokenData.value);
          await tokensPage.tokensComp.isTokenAppliedWithName(updatedTokenData.name);
        },
      );

      await mainTest.step('Verify screenshot and applied token title', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-border-radius-20.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await tokensPage.tokensComp.checkAppliedTokenTitle(
          'Token: border-radius\n' + 'Original value: 20\n' + 'Resolved value: 20',
        );
      });
    },
  );

  mainTest(
    qase(2136, 'Delete a token and redo deletion'),
    async ({ browserName }) => {
      await mainTest.step(
        `Delete "${radiusToken.name}" token and verify it is removed`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await tokensPage.tokensComp.deleteToken(radiusToken.name);
          await tokensPage.tokensComp.isTokenVisibleWithName(
            radiusToken.name,
            false,
          );
        },
      );

      await mainTest.step('Undo deletion and verify token is restored', async () => {
        await mainPage.clickShortcutCtrlZ(browserName);
        await tokensPage.tokensComp.expandTokenByName(TokenClass.BorderRadius);
        await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name, true);
      });
    },
  );
});
