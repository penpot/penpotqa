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
    async ({ page }) => {
      tokensPage = new TokensPage(page);

      await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
      await designPanelPage.checkGeneralCornerRadius(radiusToken.value);
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

  mainTest(
    qase(
      2166,
      'Edit a border radius token, already applied to a shape (with warning renaming message)',
    ),
    async ({ page }) => {
      tokensPage = new TokensPage(page);

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

      await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
      await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkGeneralCornerRadius(updatedTokenData.value);
      await tokensPage.tokensComp.isTokenAppliedWithName(updatedTokenData.name);
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-border-radius-20.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await tokensPage.tokensComp.checkAppliedTokenTitle(
        'Token: border-radius\n' + 'Original value: 20\n' + 'Resolved value: 20',
      );
    },
  );

  mainTest(
    qase(2136, 'Delete a token and redo deletion'),
    async ({ page, browserName }) => {
      tokensPage = new TokensPage(page);
      await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
      await tokensPage.tokensComp.deleteToken(radiusToken.name);
      await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name, false);
      await mainPage.clickShortcutCtrlZ(browserName);
      await tokensPage.tokensComp.expandTokenByName(TokenClass.BorderRadius);
      await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name, true);
    },
  );
});
