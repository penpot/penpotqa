import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { ShadowToken } from '@pages/workspace/tokens/token-components/shadow-tokens-component';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';

const teamName = random().concat('autotest');
const sampleData = new SampleData();
const BAD_TOKEN_ALIAS = '{non.existent.token}';

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach('Create a team and a file', async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
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

mainTest.afterEach('Back to Dashboard and delete team created', async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(
    'Create a rectangle and click on Tokens tab',
    async ({ page }) => {
      tokensPage = new TokensPage(page);

      await mainPage.createDefaultRectangleByCoordinates(320, 210);
      await tokensPage.tokensTab.click();
    },
  );

  mainTest(
    qase(
      [2673, 2586],
      'Create token with inner shadow, validate dropdown and edit to update',
    ),
    async () => {
      const SHADOW_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: 'global.shadow',
        shadows: [
          {
            color: sampleData.color.redHexCode,
            shadowType: 'Inner shadow',
          },
        ],
      };

      const UPDATED_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: SHADOW_TOKEN.name,
        shadows: [
          {
            color: sampleData.color.blueHexCode,
            xOffset: '-40',
            yOffset: '-50',
            blurRadius: '30',
            spreadRadius: '10',
          },
        ],
      };

      await mainTest.step(
        '(2673)  Create token with inner shadow, apply and assert expected default values in Design Panel shadow type options menu',
        async () => {
          await tokensPage.tokensComp.clickOnAddTokenAndFillData(SHADOW_TOKEN);
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();
          await tokensPage.tokensComp.isTokenVisibleWithName(SHADOW_TOKEN.name);
          await tokensPage.tokensComp.clickOnTokenWithName(SHADOW_TOKEN.name);

          //Assert shadow values in Design Panel REVISARs
          await designPanelPage.isShadowTypeSelectedVisible(
            SHADOW_TOKEN.shadows[0].shadowType,
          );
          await designPanelPage.clickShadowActionsButton();
          await designPanelPage.hasShadowYOffsetExpectedValue('4');
          await designPanelPage.hasShadowXOffsetExpectedValue('4');
          await designPanelPage.hasShadowBlurExpectedValue('4');
          await designPanelPage.hasShadowSpreadExpectedValue('0');
          await designPanelPage.isExpectedShadowColorVisible(
            SHADOW_TOKEN.shadows[0].color,
          );
        },
      );

      await mainTest.step('2586 Edit a typography token', async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(UPDATED_TOKEN);
        await tokensPage.tokensComp.isTokenVisibleWithName(UPDATED_TOKEN.name);
        await tokensPage.tokensComp.clickOnTokenWithName(UPDATED_TOKEN.name);

        //Assert shadow values in Design Panel
        await designPanelPage.isShadowTypeSelectedVisible(
          UPDATED_TOKEN.shadows[0].shadowType,
        );
        await designPanelPage.clickShadowActionsButton();
        await designPanelPage.hasShadowYOffsetExpectedValue(
          UPDATED_TOKEN.shadows[0].yOffset!,
        );
        await designPanelPage.hasShadowXOffsetExpectedValue('4');
        await designPanelPage.hasShadowBlurExpectedValue('4');
        await designPanelPage.hasShadowSpreadExpectedValue('0');
        await designPanelPage.isExpectedShadowColorVisible(
          UPDATED_TOKEN.shadows[0].color,
        );
      });
    },
  );

  mainTest(
    qase(
      [2678, 2680, 2681, 2682],
      'Create a shadow token with units (drop shadow) with multiple shadows, add a shadow with unit shadow values, edit, remove multiple shadows',
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
