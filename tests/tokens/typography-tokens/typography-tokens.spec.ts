import { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

import { MainPage } from '../../../pages/workspace/main-page';
import { TokensPanelPage } from '../../../pages/workspace/tokens-panel-page';
import { mainTest } from '../../../fixtures';
import { random } from '../../../helpers/string-generator';
import { TeamPage } from '../../../pages/dashboard/team-page';
import { DashboardPage } from '../../../pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { TypographyTokensComponent } from '../../../pages/workspace/typography-tokens-component';
import { DesignPanelPage } from '../../../pages/workspace/design-panel-page';
import { LayersPanelPage } from '../../../pages/workspace/layers-panel-page';
import { ColorPalettePage } from '../../../pages/workspace/color-palette-page';
import { AssetsPanelPage } from '../../../pages/workspace/assets-panel-page';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page, browserName }) => {
  let mainPage = new MainPage(page);
  let teamPage = new TeamPage(page);
  let dashboardPage = new DashboardPage(page);
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
  let mainPage = new MainPage(page);
  let teamPage = new TeamPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  const tokenName = 'global.token-component';
  const tokenFamily = 'Aboreto';
  const tokenDescription = 'Description';

  mainTest.beforeEach(async ({ page, browserName }) => {
    let tokensPage = new TokensPanelPage(page);
    await tokensPage.createDefaultTextLayerByCoordinates(500, 500, browserName);
    await tokensPage.clickTokensTab();
  });

  mainTest(
    qase([2586], 'Create, edit a typography token'),
    async ({ page, browserName }) => {
      let typographyTokensComponent = new TypographyTokensComponent(page);
      let tokensPage = new TokensPanelPage(page);
      let designPanelPage = new DesignPanelPage(page);

      await typographyTokensComponent.addNewTypoToken(tokenName, 'Arboreto');
      await tokensPage.isTokenVisibleWithName(tokenName);
      // await tokensPage.clickOnTokenWithName(tokenName);
      // await tokensPage.waitForChangeIsSaved();
      // await tokensPage.isTokenAppliedWithName(tokenName);
      // await designPanelPage.checkGeneralCornerRadius(tokenValue);
      // await expect(tokensPage.createdLayer).toHaveScreenshot(
      //   'rectangle-border-radius-1.png',
      // );
      // await tokensPage.isMenuItemWithNameSelected(tokenName, 'RadiusAll');
    },
  );
});
