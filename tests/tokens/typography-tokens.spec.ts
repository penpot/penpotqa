import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { TypographyToken } from '@pages/workspace/tokens/token-components/typography-tokens-component';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';

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
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let assetsPanelPage: AssetsPanelPage;

  mainTest.beforeEach(async ({ page }) => {
    tokensPage = new TokensPage(page);
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);
    assetsPanelPage = new AssetsPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(500, 500);
    await tokensPage.tokensTab.click();
  });

  const TYPO_TOKEN: TypographyToken<TokenClass> = {
    class: TokenClass.Typography,
    name: 'typography',
    fontFamily: 'Karla',
    fontWeight: '400 Italic',
    fontSize: '18px',
    lineHeight: '1.5px',
    letterSpacing: '0.5',
    textDecoration: 'strike-through',
    textCase: 'uppercase',
    description: 'Autotest typography token',
  };

  mainTest(
    qase(
      [2584, 2586, 2592, 2604],
      'Create and edit a typography token (validating values and units)',
    ),
    async () => {
      await mainTest.step(
        '2584 Create typography token with complete property set',
        async () => {
          await tokensPage.tokensComp.clickOnAddTokenAndFillData(TYPO_TOKEN);
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenVisibleWithName(TYPO_TOKEN.name);
          await tokensPage.tokensComp.clickOnTokenWithName(TYPO_TOKEN.name);
        },
      );

      const UPDATED_TOKEN: TypographyToken<TokenClass> = {
        class: TokenClass.Typography,
        name: TYPO_TOKEN.name,
        fontWeight: 'thin',
        fontSize: '16',
        textDecoration: 'underline',
        lineHeight: '24',
      };
      const THIN_FONT_WEIGHT_VALUE = '200';

      await mainTest.step('2586 Edit a typography token', async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(UPDATED_TOKEN);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(UPDATED_TOKEN.name);

        await designPanelPage.checkTextCase(TYPO_TOKEN.textCase);
        await designPanelPage.checkLetterSpacing(TYPO_TOKEN.letterSpacing);
        await designPanelPage.checkFontName(TYPO_TOKEN.fontFamily);

        await designPanelPage.checkFontSize(UPDATED_TOKEN.fontSize);
        await designPanelPage.checkTextLineHeight(UPDATED_TOKEN.lineHeight);
        await designPanelPage.checkFontStyle(THIN_FONT_WEIGHT_VALUE);
        await designPanelPage.clickOnTextAlignOptionsButton();
        await designPanelPage.isTextUnderlineChecked();
      });

      const TOKEN_1: TypographyToken<TokenClass> = {
        class: TokenClass.Typography,
        name: TYPO_TOKEN.name,
        fontSize: '120%',
        lineHeight: '150%',
      };
      const RESOLVED_FONT_SIZE_1 = '120';
      const RESOLVED_LINE_HEIGHT_1 = '1.5';
      const TOKEN_2: TypographyToken<TokenClass> = {
        class: TokenClass.Typography,
        name: TYPO_TOKEN.name,
        fontSize: '16px',
        lineHeight: '103px%',
      };
      const RESOLVED_LINE_HEIGHT_2 = '1.03';
      const TOKEN_3: TypographyToken<TokenClass> = {
        class: TokenClass.Typography,
        name: TYPO_TOKEN.name,
        fontSize: '18px',
        lineHeight: '17px',
      };
      const RESOLVED_LINE_HEIGHT_3 = '0.94';
      const TOKEN_4: TypographyToken<TokenClass> = {
        class: TokenClass.Typography,
        name: TYPO_TOKEN.name,
        fontSize: '16px',
        lineHeight: '1.1',
      };
      const RESOLVED_LINE_HEIGHT_4 = '1.1';

      await mainTest.step('2592 Validate Typography Token Units', async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(TOKEN_1);
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkFontSize(RESOLVED_FONT_SIZE_1);
        await designPanelPage.checkTextLineHeight(RESOLVED_LINE_HEIGHT_1);
      });

      await mainTest.step(
        '2604 Apply Typography Tokens with Line Height Calculation and with Different Units',
        async () => {
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(TOKEN_2);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkTextLineHeight(RESOLVED_LINE_HEIGHT_2);
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(TOKEN_3);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkTextLineHeight(RESOLVED_LINE_HEIGHT_3);
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(TOKEN_4);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkTextLineHeight(RESOLVED_LINE_HEIGHT_4);
        },
      );
    },
  );

  mainTest(
    qase([2606, 2607], 'Switch between token forms and validate invalid references'),
    async () => {
      const BAD_TOKEN_ALIAS = '{non-existent-token}';

      await mainTest.step('Add a typography token and fill data', async () => {
        await tokensPage.tokensComp.clickOnAddTokenAndFillData(TYPO_TOKEN);
      });

      await mainTest.step(
        '2606 Switch Between Individual and Reference Token Forms',
        async () => {
          await tokensPage.typoTokensComp.clickOnUseReferenceButton();
          await tokensPage.typoTokensComp.clickOnUseCompositeButton();
          // Fields should retain their values after switching modes
          await tokensPage.typoTokensComp.checkTokenFieldHasExpectedValue(
            TYPO_TOKEN,
          );
        },
      );

      await mainTest.step(
        '2607 Validate Reference Token Form with Invalid References',
        async () => {
          await tokensPage.typoTokensComp.clickOnUseReferenceButton();
          await tokensPage.typoTokensComp.fillAliasInput(BAD_TOKEN_ALIAS);
          await tokensPage.typoTokensComp.isAliasInputErrorVisible();
          await tokensPage.tokensComp.baseComp.clickOnCancelButton();
        },
      );
    },
  );

  mainTest(
    qase(
      [2609, 2610],
      'Check Typography Token detaches Typography Style Assets and Atomic Typography Tokens',
    ),
    async () => {
      const FONT_FAMILY_STYLE = 'Rasa';
      const LETTER_SPACING_STYLE = '3';

      await mainTest.step(
        '2609 Check Typography Token Detaches Applied Typography Style (Asset)',
        async () => {
          // Set some typography styles to the text from the design panel
          await assetsPanelPage.selectFont(FONT_FAMILY_STYLE);
          await designPanelPage.changeTextLetterSpacing(LETTER_SPACING_STYLE);
          // Create a typography asset with these styles
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.clickAddFileLibraryTypographyButton();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isTypographyAssetAgVisible(true);
          // Create and apply typography token
          await tokensPage.tokensTab.click();
          await tokensPage.tokensComp.createTokenViaAddButtonAndSave(TYPO_TOKEN);
          await tokensPage.tokensComp.isTokenVisibleWithName(TYPO_TOKEN.name);
          await tokensPage.tokensComp.clickOnTokenWithName(TYPO_TOKEN.name);
          // Validates assets are detached after applying the typography token
          await designPanelPage.isTypographyAssetAgVisible(false);
          await designPanelPage.checkFontName(TYPO_TOKEN.fontFamily);
          await designPanelPage.checkLetterSpacing(TYPO_TOKEN.letterSpacing);
        },
      );

      const FF_TOKEN: MainToken<TokenClass> = {
        class: TokenClass.FontFamily,
        name: 'fontFamily',
        value: 'Source Sans Pro',
      };
      const FS_TOKEN: MainToken<TokenClass> = {
        class: TokenClass.FontSize,
        name: 'fontSize',
        value: '20',
      };
      const FW_TOKEN: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: 'black-font-weight',
        value: 'black',
      };
      const LS_TOKEN: MainToken<TokenClass> = {
        class: TokenClass.LetterSpacing,
        name: 'letter-spacing',
        value: '10',
      };
      const CLEAN_TYPO_TOKEN: TypographyToken<TokenClass> = {
        class: TokenClass.Typography,
        name: 'clean-typography',
        description: 'Autotest typography token',
        textDecoration: 'none',
      };
      const STYLE_TOKENS = [FF_TOKEN, FS_TOKEN, FW_TOKEN, LS_TOKEN];
      const TYPO_TOKENS = [TYPO_TOKEN, CLEAN_TYPO_TOKEN];

      await mainTest.step(
        '2610 Check Typography Token Unapplied Atomic Typography Tokens',
        async () => {
          // Create the typography and style tokens
          await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
            CLEAN_TYPO_TOKEN,
          );
          for (const styleToken of STYLE_TOKENS) {
            await tokensPage.tokensComp.createTokenViaAddButtonAndSave(styleToken);
          }

          for (const typoToken of TYPO_TOKENS) {
            // Apply all atomic typography tokens first
            for (const styleToken of STYLE_TOKENS) {
              await mainPage.clickViewportOnce();
              // await layersPanelPage.openLayersTab(); -- to navigate to Layers tab in new render
              await mainPage.clickOnLayerOnCanvas();
              // await tokensPage.clickTokensTab(); -- to navigate back to Tokens tab in new render

              await tokensPage.tokensComp.clickOnTokenWithName(styleToken.name);
              await tokensPage.tokensComp.isTokenAppliedWithName(styleToken.name);
            }

            // Select text layer and then apply the typography token type
            await mainPage.clickViewportOnce();
            // await layersPanelPage.openLayersTab(); -- to navigate to Layers tab in new render
            await mainPage.clickOnLayerOnCanvas();
            // await tokensPage.clickTokensTab(); -- to navigate back to Tokens tab in new render

            await tokensPage.tokensComp.clickOnTokenWithName(typoToken.name);
            await tokensPage.tokensComp.isTokenAppliedWithName(typoToken.name);

            // All atomic typography tokens should be unapplied
            for (const styleToken of STYLE_TOKENS) {
              await tokensPage.tokensComp.isTokenAppliedWithName(
                styleToken.name,
                false,
              );
            }
          }
        },
      );
    },
  );
});
