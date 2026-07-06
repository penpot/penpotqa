import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { TypographyToken } from '@pages/workspace/tokens/token-components/typography-tokens-component';

const teamName = createTeamName();
const ariaLabel: string = 'Width';

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest.describe('Numeric inputs', () => {
  mainTest.describe(() => {
    mainTest.beforeEach(async () => {
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();
    });

    mainTest.describe(() => {
      mainTest.beforeEach(async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.toolsComp.clickOnTokenToolsButton();
        await tokensPage.toolsComp.importTokens(
          'documents/tokens-for-each-category.json',
        );
        await tokensPage.setsComp.isSetNameVisible('Global');
      });

      mainTest(
        qase(
          [2905, 2873],
          'Selecting a token via the Token Icon and detaching via the detach button ',
        ),
        async () => {
          const tokenName: string = 'SIZING-2';
          const tokenValue: string = '2';

          await mainTest.step(
            '(2905) Selecting a token via the Token Icon updates the input value applied to a shape',
            async () => {
              await mainTest.step('Create rectangle', async () => {
                await tokensPage.createDefaultRectangleByCoordinates(100, 200);
              });

              await mainTest.step('Hover on Width field in Design tab', async () => {
                await designPanelPage.hoverOnWidthForLayer();
              });

              await mainTest.step('Open token list in Width field', async () => {
                const widthFieldIndex = 1;
                await designPanelPage.openTokenListByIndex(widthFieldIndex);
              });

              await mainTest.step('Select token in token list by name', async () => {
                await designPanelPage.selectTokenInTokenListByName(tokenName);
              });

              await mainTest.step('Check applied token', async () => {
                await designPanelPage.checkSizeWidth(tokenValue);
              });

              await mainTest.step(
                'Hover in token value, check tooltip and detach token button',
                async () => {
                  await designPanelPage.hoverOnTokenPill(ariaLabel);
                  await designPanelPage.isTokenPillTooltipVisible(tokenName);
                  await designPanelPage.isDetachTokenButtonVisible();
                },
              );

              await mainTest.step('Check applied token in Token tab', async () => {
                await tokensPage.tokensComp.expandTokenByName(TokenClass.Sizing);
                await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
              });
            },
          );

          await mainTest.step(
            '(2873) Detaching via detach button removes token and displays raw value in the numeric input',
            async () => {
              await mainTest.step('Detach token', async () => {
                await designPanelPage.clickOnDetachTokenButton();
                await designPanelPage.checkSizeWidth(tokenValue);
              });

              await mainTest.step('Check unapplied token in Token tab', async () => {
                await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);
              });

              await mainTest.step('Edit width', async () => {
                const newWidthValue: string = '10';
                await designPanelPage.changeWidthForLayer(newWidthValue);
                await designPanelPage.checkSizeWidth(newWidthValue);
              });
            },
          );
        },
      );
    });

    mainTest(
      qase(2865, 'Broken token references are clearly displayed with a red dot'),
      async () => {
        const dimensionTokenA: MainToken<TokenClass> = {
          class: TokenClass.Dimension,
          name: 'dimension-A',
          value: '550.5',
        };

        const dimensionTokenB: MainToken<TokenClass> = {
          class: TokenClass.Dimension,
          name: 'dimension-B',
          value: '{dimension-A}',
        };

        await mainTest.step('Create a dimension token', async () => {
          await tokensPage.clickTokensTab();
          await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
            dimensionTokenA,
          );
          await tokensPage.tokensComp.isTokenVisibleWithName(dimensionTokenA.name);
        });

        await mainTest.step(
          'Create another dimension token referencing the first one',
          async () => {
            await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
              dimensionTokenB,
            );
            await tokensPage.tokensComp.isTokenVisibleWithName(dimensionTokenB.name);
          },
        );

        await mainTest.step('Create rectangle', async () => {
          await tokensPage.createDefaultRectangleByCoordinates(100, 200);
        });

        await mainTest.step('Open token list in Width field', async () => {
          const widthFieldIndex = 0;
          await designPanelPage.openTokenListByIndex(widthFieldIndex);
        });

        await mainTest.step(
          'Select the second token in token list by name',
          async () => {
            await designPanelPage.selectTokenInTokenListByName(dimensionTokenB.name);
          },
        );

        await mainTest.step('Check applied token', async () => {
          await designPanelPage.checkSizeWidth(dimensionTokenA.value);
        });

        await mainTest.step('Delete the referenced token', async () => {
          await tokensPage.tokensComp.deleteToken(dimensionTokenA.name);
          await tokensPage.tokensComp.isTokenVisibleWithName(
            dimensionTokenA.name,
            false,
          );
        });

        await mainTest.step(
          'Check value and not valid reference in input',
          async () => {
            await designPanelPage.checkSizeWidth(dimensionTokenA.value);
            await designPanelPage.isNotTokenValidReferencedButtonVisible(
              dimensionTokenB.name,
            );
          },
        );

        await mainTest.step('Hover in token value and check tooltip', async () => {
          const errorMessage: string = `Reference in {${dimensionTokenB.name}} is not valid or is not in any active set.`;
          await designPanelPage.hoverOnTokenPill(ariaLabel);
          await designPanelPage.isTokenPillTooltipVisible(errorMessage);
        });
      },
    );
  });

  mainTest.describe(() => {
    const hexColor: string = '#ec9090';
    const setName: string = 'Light';

    mainTest.beforeEach(async () => {
      await dashboardPage.openSidebarItem('Drafts');
      await dashboardPage.importFileFromProjectPage(
        'documents/num-inputs-in-set-themes.penpot',
      );
      await dashboardPage.isFilePresent('num inputs in set/themes');
      await dashboardPage.openFileWithName('num inputs in set/themes');
      await mainPage.isMainPageLoaded();
      await layersPanelPage.selectLayerByName('Rectangle');
      await tokensPage.clickTokensTab();
    });

    mainTest(
      qase(
        2891,
        'Token pill updates displayed value after token value change in active token set',
      ),
      async () => {
        const newHexColor: string = '#f1d0d0';

        await mainTest.step(
          'Hover on fill color input and check token value in tootltip message',
          async () => {
            const messageText = `Resolved value: ${hexColor}`;
            await designPanelPage.checkTooltipInFillColorInput(messageText);
          },
        );

        await mainTest.step('Click on the Mode/Light token set', async () => {
          await tokensPage.setsComp.isSetNameVisible(setName);
          await tokensPage.setsComp.clickSetItemButton(setName);
        });

        await mainTest.step('Change color token value', async () => {
          const colorToken: MainToken<TokenClass> = {
            class: TokenClass.Color,
            name: 'red',
            value: newHexColor,
          };
          await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(colorToken);
          await mainPage.waitForChangeIsSaved();
        });

        await mainTest.step(
          'Hover on fill color input and check token value in tootltip message',
          async () => {
            const messageText = `Resolved value: ${newHexColor}`;
            await designPanelPage.checkTooltipInFillColorInput(messageText);
          },
        );
      },
    );

    mainTest(
      qase(
        2893,
        'Token pill shows unresolved state when token set becomes inactive',
      ),
      async () => {
        const tokenName: string = 'red';

        await mainTest.step(
          'Hover on fill color input and check token value in tootltip message',
          async () => {
            const messageText = `Resolved value: ${hexColor}`;
            await designPanelPage.checkTooltipInFillColorInput(messageText);
          },
        );

        await mainTest.step('Deactivate the Mode/Light set', async () => {
          await tokensPage.setsComp.isSetNameVisible(setName);
          await tokensPage.setsComp.clickOnSetCheckboxByName(setName);
        });

        await mainTest.step(
          'Check not in any active set red dot in input',
          async () => {
            await designPanelPage.isNotTokenInAnyActiveSetButtonVisible(tokenName);
          },
        );

        await mainTest.step(
          'Hover on fill color input and check error in tootltip message',
          async () => {
            const messageText: string = `{${tokenName}} token is not in any active set or has an invalid value.`;
            await designPanelPage.checkTooltipInFillColorInput(messageText);
          },
        );
      },
    );
  });
});

mainTest.describe('Typography token', () => {
  mainTest.beforeEach(async ({ page }) => {
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.createDefaultTextLayerByCoordinates(500, 500);
    await tokensPage.tokensTab.click();
  });

  const TYPO_TOKEN: TypographyToken<TokenClass> = {
    class: TokenClass.Typography,
    name: 'typography',
    fontFamily: 'Karla',
    fontWeight: '500 Italic',
    fontSize: '18px',
    lineHeight: '1.5px',
    letterSpacing: '0.5',
    textDecoration: 'strike-through',
    textCase: 'uppercase',
    description: 'Autotest typography token',
  };

  const TYPO_TOKEN_2: TypographyToken<TokenClass> = {
    class: TokenClass.Typography,
    name: 'typography_2',
    fontFamily: 'Karla',
    fontWeight: '400 Italic',
    fontSize: '15',
    lineHeight: '2',
    letterSpacing: '0.5',
    textDecoration: 'underline',
    textCase: 'uppercase',
    description: 'Autotest typography token',
  };

  mainTest(
    qase(3017, 'Unresolved token state displayed when applied token is deleted'),
    async () => {
      await mainTest.step(
        'Create a typography token and apply it to a text layer',
        async () => {
          await tokensPage.tokensComp.clickOnAddTokenAndFillData(TYPO_TOKEN);
          await tokensPage.tokensComp.baseComp.clickOnSaveButton();
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenVisibleWithName(TYPO_TOKEN.name);
          await tokensPage.tokensComp.clickOnTokenWithName(TYPO_TOKEN.name);
        },
      );

      await mainTest.step('Delete token', async () => {
        await tokensPage.tokensComp.deleteToken(TYPO_TOKEN.name);
        await tokensPage.tokensComp.isTokenVisibleWithName(TYPO_TOKEN.name, false);
      });

      await mainTest.step(
        'Reselect layer and assert design tab displays an unresolved token state',
        async () => {
          await designPanelPage.hoverTypographyToken();
          await designPanelPage.isTokenNotExistOrDeletedTooltipVisible(
            TYPO_TOKEN.name,
          );
        },
      );
    },
  );

  mainTest(
    qase(
      [3020, 3021],
      'Applying typography token from filtered search results applies correct token / Detach typography token',
    ),
    async () => {
      await mainTest.step(
        '(3020) Applying typography token from filtered search results applies correct token',
        async () => {
          await mainTest.step(
            'Create two typography tokens and select layer',
            async () => {
              await mainTest.step(
                'Create a FIRST typography token and apply it to a text layer',
                async () => {
                  await tokensPage.tokensComp.clickOnAddTokenAndFillData(TYPO_TOKEN);
                  await tokensPage.tokensComp.baseComp.clickOnSaveButton();
                  await mainPage.waitForChangeIsSaved();
                  await tokensPage.tokensComp.isTokenVisibleWithName(
                    TYPO_TOKEN.name,
                  );
                },
              );

              await mainTest.step(
                'Create a SECOND typography token and apply it to a text layer',
                async () => {
                  await tokensPage.tokensComp.clickOnAddTokenAndFillData(
                    TYPO_TOKEN_2,
                  );
                  await tokensPage.tokensComp.baseComp.clickOnSaveButton();
                  await mainPage.waitForChangeIsSaved();
                  await tokensPage.tokensComp.isTokenVisibleWithName(
                    TYPO_TOKEN_2.name,
                  );
                },
              );

              await mainTest.step('Select text layer', async () => {
                await layersPanelPage.openLayersTab();
                await layersPanelPage.selectLayerByName('Hello world!');
              });
            },
          );

          await mainTest.step(
            `From Design tab, open tokens list, apply ${TYPO_TOKEN_2.name} and assert text options are not visible and underline/strike through are disabled`,
            async () => {
              await designPanelPage.searchAndApplyTypographyTokenFromTokensList(
                TYPO_TOKEN_2.name,
              );
              await designPanelPage.textOptionsAreVisible(false);
              await designPanelPage.openTextMoreOptionsBlock();
              await designPanelPage.isTextUnderlineDisabled();
              await designPanelPage.isTextStrikethroughDisabled();
            },
          );

          await mainTest.step(
            'Assert typography values from typography token modal',
            async () => {
              await designPanelPage.hoverAndAssertTypographyTokenValues(
                TYPO_TOKEN_2.name,
                {
                  fontFamily: TYPO_TOKEN_2.fontFamily,
                  fontSize: TYPO_TOKEN_2.fontSize,
                  fontWeight: TYPO_TOKEN_2.fontWeight,
                  letterSpacing: TYPO_TOKEN_2.letterSpacing,
                  textCase: TYPO_TOKEN_2.textCase,
                  textDecoration: TYPO_TOKEN_2.textDecoration,
                  lineHeight: TYPO_TOKEN_2.lineHeight,
                },
              );
            },
          );
        },
      );

      await mainTest.step('(3021) Detach typography token', async () => {
        await mainTest.step(
          `Hover over typography token and click detach button`,
          async () => {
            await designPanelPage.clickOnDetachTokenButton();
            await designPanelPage.textOptionsAreVisible();
          },
        );

        await mainTest.step(
          `Assert typography values have not changed`,
          async () => {
            await designPanelPage.checkFontName(TYPO_TOKEN_2.fontFamily);
            await designPanelPage.checkFontStyle(TYPO_TOKEN_2.fontWeight);
            await designPanelPage.checkFontSize(TYPO_TOKEN_2.fontSize);
            await designPanelPage.checkLetterSpacing(TYPO_TOKEN_2.letterSpacing);
            await designPanelPage.checkTextCase(TYPO_TOKEN_2.textCase);
            await designPanelPage.checkTextLineHeight(TYPO_TOKEN_2.lineHeight);
            await designPanelPage.isTextUnderlineChecked();
          },
        );
      });
    },
  );
});
