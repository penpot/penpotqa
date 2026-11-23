import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { TypographyToken } from '@pages/workspace/tokens/token-components/typography-tokens-component';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

demoAccountFileTest.beforeEach(async ({ mainPage }) => {
  await mainPage.clickMoveButton();
});

demoAccountFileTest.describe(() => {
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let assetsPanelPage: AssetsPanelPage;
  let layersPanelPage: LayersPanelPage;

  demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    assetsPanelPage = new AssetsPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);

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

  demoAccountFileTest(
    qase(
      [2584, 2586, 2592, 2604],
      'Create and edit a typography token (validating values and units)',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        '2584 Create typography token with complete property set',
        async () => {
          await tokensPage.tokensComp.clickOnAddTokenAndFillData(TYPO_TOKEN);
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenVisibleWithName(TYPO_TOKEN.name);
          await tokensPage.tokensComp.applyTokenToSelectedShape(TYPO_TOKEN.name);
        },
      );

      await demoAccountFileTest.step('2586 Edit a typography token', async () => {
        const UPDATED_TOKEN: TypographyToken<TokenClass> = {
          class: TokenClass.Typography,
          name: TYPO_TOKEN.name,
          fontWeight: 'Medium',
          fontSize: '16',
          textDecoration: 'underline',
          lineHeight: '24',
        };

        await tokensPage.tokensComp.editTokenViaRightClickAndSave(UPDATED_TOKEN);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(UPDATED_TOKEN.name);
        await designPanelPage.hoverAndAssertTypographyTokenValues(TYPO_TOKEN.name, {
          fontFamily: TYPO_TOKEN.fontFamily,
          fontSize: UPDATED_TOKEN.fontSize,
          fontWeight: UPDATED_TOKEN.fontWeight,
          letterSpacing: TYPO_TOKEN.letterSpacing,
          textCase: TYPO_TOKEN.textCase,
          textDecoration: UPDATED_TOKEN.textDecoration,
          lineHeight: UPDATED_TOKEN.lineHeight,
        });

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
      const RESOLVED_LINE_HEIGHT_3 = '0.9444444444444444';

      const TOKEN_4: TypographyToken<TokenClass> = {
        class: TokenClass.Typography,
        name: TYPO_TOKEN.name,
        fontSize: '16px',
        lineHeight: '1.1',
      };
      const RESOLVED_LINE_HEIGHT_4 = '1.1';

      await demoAccountFileTest.step(
        '2592 Validate Typography Token Units',
        async () => {
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(TOKEN_1);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.hoverAndAssertTypographyTokenValues(
            TYPO_TOKEN.name,
            {
              fontSize: RESOLVED_FONT_SIZE_1,
              lineHeight: RESOLVED_LINE_HEIGHT_1,
            },
          );
        },
      );

      await demoAccountFileTest.step(
        '2604 Apply Typography Tokens with Line Height Calculation and with Different Units',
        async () => {
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(TOKEN_2);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.hoverAndAssertTypographyTokenValues(
            TYPO_TOKEN.name,
            {
              lineHeight: RESOLVED_LINE_HEIGHT_2,
            },
          );

          await tokensPage.tokensComp.editTokenViaRightClickAndSave(TOKEN_3);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.hoverAndAssertTypographyTokenValues(
            TYPO_TOKEN.name,
            {
              lineHeight: RESOLVED_LINE_HEIGHT_3,
            },
          );

          await tokensPage.tokensComp.editTokenViaRightClickAndSave(TOKEN_4);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.hoverAndAssertTypographyTokenValues(
            TYPO_TOKEN.name,
            {
              lineHeight: RESOLVED_LINE_HEIGHT_4,
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([2606, 2607], 'Switch between token forms and validate invalid references'),
    async () => {
      const BAD_TOKEN_ALIAS = '{non-existent-token}';

      await demoAccountFileTest.step(
        'Add a typography token and fill data',
        async () => {
          await tokensPage.tokensComp.clickOnAddTokenAndFillData(TYPO_TOKEN);
        },
      );

      await demoAccountFileTest.step(
        '2606 Switch Between Individual and Reference Token Forms',
        async () => {
          await tokensPage.typoTokensComp.valueOptions.clickOnUseReferenceButton();
          await tokensPage.typoTokensComp.valueOptions.clickOnUseCompositeButton();
          // Fields should retain their values after switching modes
          await tokensPage.typoTokensComp.checkTokenFieldHasExpectedValue(
            TYPO_TOKEN,
          );
        },
      );

      await demoAccountFileTest.step(
        '2607 Validate Reference Token Form with Invalid References',
        async () => {
          await tokensPage.typoTokensComp.valueOptions.clickOnUseReferenceButton();
          await tokensPage.typoTokensComp.referenceField.fillAliasInput(
            BAD_TOKEN_ALIAS,
          );
          await tokensPage.typoTokensComp.referenceField.checkAliasInputErrorIsVisible();
          await tokensPage.tokensComp.baseComp.clickOnCancelButton();
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [2609, 2610],
      'Check Typography Token detaches Typography Style Assets and Atomic Typography Tokens',
    ),
    async ({ mainPage }) => {
      const FONT_FAMILY_STYLE = 'Rasa';
      const LETTER_SPACING_STYLE = '3';

      await demoAccountFileTest.step(
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
          await designPanelPage.hoverAndAssertTypographyTokenValues(
            TYPO_TOKEN.name,
            {
              fontFamily: TYPO_TOKEN.fontFamily,
              letterSpacing: TYPO_TOKEN.letterSpacing,
            },
          );
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

      await demoAccountFileTest.step(
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
              await layersPanelPage.openLayersTab();
              await mainPage.clickOnLayerOnCanvas();
              await tokensPage.clickTokensTab();

              await tokensPage.tokensComp.clickOnTokenWithName(styleToken.name);
              await tokensPage.tokensComp.isTokenAppliedWithName(styleToken.name);
            }

            // Select text layer and then apply the typography token type
            await mainPage.clickViewportOnce();
            await layersPanelPage.openLayersTab();
            await mainPage.clickOnLayerOnCanvas();
            await tokensPage.clickTokensTab();

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

demoAccountFileTest.describe(() => {
  let tokensPage: TokensPage;

  demoAccountFileTest.use({ penpotFile: 'documents/tokens/detach-tokens.penpot' });

  demoAccountFileTest.beforeEach(async ({ page }) => {
    tokensPage = new TokensPage(page);
    await tokensPage.tokensTab.click();
    await tokensPage.tokensComp.expandTokenByName(TokenClass.Typography);
  });

  demoAccountFileTest(
    qase([3989], 'Detach a typography token reference and save the copied values'),
    async ({ mainPage }) => {
      // Tokens of the imported file
      const BASE_TOKEN: TypographyToken<TokenClass> = {
        class: TokenClass.Typography,
        name: 'typography.base',
        fontFamily: 'Roboto',
        fontSize: '18',
        fontWeight: 'Bold Italic',
        lineHeight: '1.4',
        letterSpacing: '0',
        textCase: 'none',
        textDecoration: 'none',
      };
      const ALIAS_TOKEN: TypographyToken<TokenClass> = {
        class: TokenClass.Typography,
        name: 'typography.alias',
      };
      const ALIAS_DESCRIPTION = 'Alias of the base typography';
      const DETACHED_TOKEN: TypographyToken<TokenClass> = {
        ...BASE_TOKEN,
        name: ALIAS_TOKEN.name,
        fontSize: '24',
      };
      const referenceField = tokensPage.typoTokensComp.referenceField;

      await demoAccountFileTest.step(
        'Open the alias token and check the detach button shows on hover',
        async () => {
          await tokensPage.tokensComp.clickEditToken(ALIAS_TOKEN);
          await referenceField.checkReferenceInputHasValue(`{${BASE_TOKEN.name}}`);
          await referenceField.checkDetachReferenceButtonIsVisible(false);
          await referenceField.hoverReferenceInput();
          await referenceField.checkDetachReferenceButtonIsVisible();
          await referenceField.checkDetachReferenceButtonTooltip();
        },
      );

      await demoAccountFileTest.step(
        'Detach the reference and check the copied values',
        async () => {
          await referenceField.clickOnDetachReferenceButton();
          await tokensPage.typoTokensComp.valueOptions.checkUseCompositeOptionIsSelected();
          await tokensPage.typoTokensComp.checkTokenFieldHasExpectedValue(
            BASE_TOKEN,
          );
          await tokensPage.tokensComp.checkTokenDescriptionHasValue(
            ALIAS_DESCRIPTION,
          );
        },
      );

      await demoAccountFileTest.step(
        'Switch to the reference option and back to individual tokens',
        async () => {
          await tokensPage.typoTokensComp.valueOptions.clickOnUseReferenceButton();
          await referenceField.checkReferenceInputHasValue('');
          await tokensPage.typoTokensComp.valueOptions.clickOnUseCompositeButton();
          await tokensPage.typoTokensComp.checkTokenFieldHasExpectedValue(
            BASE_TOKEN,
          );
        },
      );

      await demoAccountFileTest.step(
        'Change the font size and save the detached token',
        async () => {
          await tokensPage.typoTokensComp.fillTokenData({
            class: TokenClass.Typography,
            name: ALIAS_TOKEN.name,
            fontSize: DETACHED_TOKEN.fontSize,
          });
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();
          await tokensPage.tokensComp.isCreateTokenModalClosed();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Check the alias keeps its own values and the base is unchanged',
        async () => {
          await tokensPage.tokensComp.clickEditToken(ALIAS_TOKEN);
          await tokensPage.typoTokensComp.valueOptions.checkUseCompositeOptionIsSelected();
          await tokensPage.typoTokensComp.checkTokenFieldHasExpectedValue(
            DETACHED_TOKEN,
          );
          await tokensPage.tokensComp.baseComp.clickOnCancelButton();
          await tokensPage.tokensComp.clickEditToken(BASE_TOKEN);
          await tokensPage.typoTokensComp.checkTokenFieldHasExpectedValue(
            BASE_TOKEN,
          );
        },
      );
    },
  );
});
