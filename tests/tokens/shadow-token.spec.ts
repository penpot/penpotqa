import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { ShadowToken } from '@pages/workspace/tokens/token-components/shadow-tokens-component';

const teamName = random().concat('autotest');
const sampleData = new SampleData();

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
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let assetsPanelPage: AssetsPanelPage;

  mainTest.beforeEach(async ({ page }) => {
    tokensPage = new TokensPage(page);
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);
    assetsPanelPage = new AssetsPanelPage(page);

    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.tokensTab.click();
  });

  mainTest(
    qase([2673, 2675, 2682, 2678, 2680], 'Create and edit a shadow token'),
    async () => {
      const SHADOW_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: 'global.shadow',
        shadows: [
          {
            xOffset: '4',
            yOffset: '4',
            blurRadius: '10',
            spreadRadius: '0',
            color: 'rgba(0, 0, 0, 0.25)',
            shadowType: 'Inner shadow',
          },
        ],
      };

      const UPDATED_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: SHADOW_TOKEN.name,
        shadows: [
          {
            xOffset: '40',
            yOffset: '50',
            blurRadius: '30',
            spreadRadius: '10',
            color: 'rgba(0, 0, 0, 0.25)',
            shadowType: 'Inner shadow',
          },
        ],
      };

      const BAD_TOKEN_ALIAS = '{non.existent.token}';

      await mainTest.step(
        '(2673, 2675)  Create token with inner shadow, invididual shadow values',
        async () => {
          await tokensPage.tokensComp.clickOnAddTokenAndFillData(SHADOW_TOKEN);
        },
      );

      await mainTest.step('(2683)  Box shadow token dropdown', async () => {});

      await mainTest.step(
        '(2678) Create token with unit shadow values',
        async () => {},
      );

      await mainTest.step('2586 Edit a typography token', async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(UPDATED_TOKEN);
        await mainPage.waitForChangeIsSaved();
      });
    },
  );

  mainTest(
    qase(
      [2678, 2680, 2681, 2682],
      'Create a shadow token with multiple shadows, add a shadow with unit shadow values, edit, remove multiple shadows',
    ),
    async () => {
      const MULTI_SHADOW_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: 'global.multi.shadow',
        shadows: [
          {
            xOffset: '-40',
            yOffset: '-50',
            blurRadius: '30',
            spreadRadius: '10',
            color: sampleData.color.redHexCode,
            shadowType: 'Drop shadow',
          },
          {
            xOffset: '40px',
            yOffset: '50px',
            blurRadius: '50px',
            spreadRadius: '10px',
            color: sampleData.color.blueHexCode,
          },
        ],
      };

      const UPDATED_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: MULTI_SHADOW_TOKEN.name,
        shadows: [
          {
            xOffset: '-40',
            yOffset: '-50',
            blurRadius: '30',
            spreadRadius: '10',
            color: sampleData.color.greenHexCode,
            shadowType: 'Inner shadow',
          },
        ],
      };

      await mainTest.step(
        '(2680, 2678) Add multiple shadows to a single token, (2678) Create token with units shadow values',
        async () => {
          await tokensPage.tokensComp.clickOnAddTokenAndFillData(MULTI_SHADOW_TOKEN);
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();
          await tokensPage.tokensComp.isTokenVisibleWithName(
            MULTI_SHADOW_TOKEN.name,
          );
          await tokensPage.tokensComp.clickOnTokenWithName(MULTI_SHADOW_TOKEN.name);
        },
      );

      await mainTest.step(
        '(2681) Remove multiple shadows to a single token',
        async () => {
          await tokensPage.tokensComp.clickEditToken(MULTI_SHADOW_TOKEN);
          await tokensPage.tokensComp.shadowTokensComp.removeShadow(1);
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();
        },
      );

      await mainTest.step('(2682) Edit shadow token', async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(UPDATED_TOKEN);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(UPDATED_TOKEN.name);
      });
    },
  );
});
