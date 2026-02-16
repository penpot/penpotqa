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
      await tokensPage.clickTokensTab();
    },
  );

  mainTest(
    qase(
      [2673, 2682],
      'Create shadow token with default values and inner shadow, assert expected values and edit',
    ),
    async () => {
      const SHADOW_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: 'shadow',
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

          await mainTest.step(
            'Assert shadow token values are applied in Design tab',
            async () => {
              await designPanelPage.isExpectedShadowTypeOption(
                SHADOW_TOKEN.shadows[0].shadowType!,
              );
              await designPanelPage.clickShadowActionsButton();
              await designPanelPage.hasShadowXOffsetExpectedValue('4');
              await designPanelPage.hasShadowYOffsetExpectedValue('4');
              await designPanelPage.hasShadowBlurExpectedValue('4');
              await designPanelPage.hasShadowSpreadExpectedValue('0');
              await designPanelPage.isExpectedShadowColorVisible(
                SHADOW_TOKEN.shadows[0].color,
              );
            },
          );
        },
      );

      await mainTest.step('(2682) Edit a shadow token', async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(UPDATED_TOKEN);
        await tokensPage.tokensComp.isTokenVisibleWithName(UPDATED_TOKEN.name);
        await tokensPage.tokensComp.clickOnTokenWithName(UPDATED_TOKEN.name);

        await mainTest.step(
          'Assert shadow token values are applied in Design tab',
          async () => {
            await designPanelPage.isExpectedShadowTypeOption(
              SHADOW_TOKEN.shadows[0].shadowType!,
            );
            await designPanelPage.clickShadowActionsButton();
            await designPanelPage.hasShadowXOffsetExpectedValue(
              UPDATED_TOKEN.shadows[0].xOffset!,
            );
            await designPanelPage.hasShadowYOffsetExpectedValue(
              UPDATED_TOKEN.shadows[0].yOffset!,
            );
            await designPanelPage.hasShadowBlurExpectedValue(
              UPDATED_TOKEN.shadows[0].blurRadius!,
            );
            await designPanelPage.hasShadowSpreadExpectedValue(
              UPDATED_TOKEN.shadows[0].spreadRadius!,
            );
            await designPanelPage.isExpectedShadowColorVisible(
              UPDATED_TOKEN.shadows[0].color,
            );
          },
        );
      });
    },
  );

  mainTest(
    qase(
      [2680, 2678, 2681],
      'Add multiple shadows to a single token (with units shadow values) and remove multiple shadows',
    ),
    async () => {
      const MULTI_SHADOW_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: 'multi-shadow',
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

      await mainTest.step(
        '(2680, 2678) Add multiple shadows to a single token, Create token with units shadow values',
        async () => {
          await tokensPage.tokensComp.clickOnAddTokenAndFillData(MULTI_SHADOW_TOKEN);
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();
          await tokensPage.tokensComp.isTokenVisibleWithName(
            MULTI_SHADOW_TOKEN.name,
          );
          await tokensPage.tokensComp.clickOnTokenWithName(MULTI_SHADOW_TOKEN.name);

          await mainTest.step(
            'Assert first shadow token values are applied in Design tab',
            async () => {
              await designPanelPage.isExpectedShadowTypeOption(
                MULTI_SHADOW_TOKEN.shadows[0].shadowType!,
              );

              // Open more options button
              await designPanelPage.clickShadowActionsButton();

              // Assert expected values
              await designPanelPage.hasShadowXOffsetExpectedValue(
                MULTI_SHADOW_TOKEN.shadows[0].xOffset!,
              );
              await designPanelPage.hasShadowYOffsetExpectedValue(
                MULTI_SHADOW_TOKEN.shadows[0].yOffset!,
              );
              await designPanelPage.hasShadowBlurExpectedValue(
                MULTI_SHADOW_TOKEN.shadows[0].blurRadius!,
              );
              await designPanelPage.hasShadowSpreadExpectedValue(
                MULTI_SHADOW_TOKEN.shadows[0].spreadRadius!,
              );
              await designPanelPage.isExpectedShadowColorVisible(
                MULTI_SHADOW_TOKEN.shadows[0].color,
              );
            },
          );

          await mainTest.step(
            'Assert second shadow token values are applied in Design tab',
            async () => {
              await designPanelPage.isExpectedShadowTypeOption(
                MULTI_SHADOW_TOKEN.shadows[0].shadowType!,
                1,
              );
              // Open more options button
              await designPanelPage.clickShadowActionsButton(1);

              // Assert expected values
              await designPanelPage.hasShadowXOffsetExpectedValue('40', 1);
              await designPanelPage.hasShadowYOffsetExpectedValue('50', 1);
              await designPanelPage.hasShadowBlurExpectedValue('50', 1);
              await designPanelPage.hasShadowSpreadExpectedValue('10', 1);
              await designPanelPage.isExpectedShadowColorVisible(
                MULTI_SHADOW_TOKEN.shadows[1].color,
              );
            },
          );
        },
      );

      await mainTest.step(
        '(2681) Remove multiple shadows to a single token',
        async () => {
          await tokensPage.tokensComp.clickEditToken(MULTI_SHADOW_TOKEN);
          await tokensPage.tokensComp.shadowTokensComp.removeShadow(1);
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();

          await mainTest.step(
            'Assert first shadow is visible and second is not in Design tab',
            async () => {
              await designPanelPage.isExpectedShadowTypeOption(
                MULTI_SHADOW_TOKEN.shadows[0].shadowType!,
              );
              await designPanelPage.isShadowTypeOptionNotVisible(
                MULTI_SHADOW_TOKEN.shadows[0].shadowType!,
                1,
              );
            },
          );
        },
      );
    },
  );

  mainTest(
    qase(2685, 'Create token with Single reference shadow values'),
    async () => {
      const SHADOW_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: 'shadow-first',
        shadows: [
          {
            color: sampleData.color.redHexCode,
            shadowType: 'Inner shadow',
          },
        ],
      };

      const SECOND_SHADOW_TOKEN: ShadowToken<TokenClass> = {
        class: TokenClass.Shadow,
        name: 'shadow-second',
        shadows: [
          {
            color: sampleData.color.redHexCode,
            shadowType: 'Inner shadow',
          },
        ],
      };

      await mainTest.step('Create a shadow token', async () => {
        await tokensPage.tokensComp.clickOnAddTokenAndFillData(SHADOW_TOKEN);
        await tokensPage.tokensComp.baseComp.clickOnSaveButton();
        await tokensPage.tokensComp.isTokenVisibleWithName(SHADOW_TOKEN.name);
        await tokensPage.tokensComp.clickOnTokenWithName(SHADOW_TOKEN.name);
      });

      await mainTest.step(
        'Create a second shadow token and use single reference to the first one',
        async () => {
          await tokensPage.tokensComp.clickOnAddTokenAndFillData(
            SECOND_SHADOW_TOKEN,
          );
          await tokensPage.tokensComp.shadowTokensComp.clickOnUseReferenceButton();
          await tokensPage.tokensComp.shadowTokensComp.fillAliasInput(
            `{${SHADOW_TOKEN.name}}`,
          );
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();
          await tokensPage.tokensComp.isTokenVisibleWithName(
            SECOND_SHADOW_TOKEN.name,
          );
          await tokensPage.tokensComp.clickOnTokenWithName(SECOND_SHADOW_TOKEN.name);

          await mainTest.step(
            'Assert values of the referenced shadow token are applied in Design tab',
            async () => {
              await designPanelPage.isExpectedShadowTypeOption(
                SHADOW_TOKEN.shadows[0].shadowType!,
              );

              // Open more options button
              await designPanelPage.clickShadowActionsButton();

              // Assert expected values
              await designPanelPage.isExpectedShadowColorVisible(
                SHADOW_TOKEN.shadows[0].color,
              );
            },
          );
        },
      );
    },
  );
});
