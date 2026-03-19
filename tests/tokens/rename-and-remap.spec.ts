import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';

const teamName = random().concat('autotest');

let mainPage: MainPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let tokensPage: TokensPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
  });

  mainTest(
    qase([2719], 'should update references in expressions when a token is renamed'),
    async () => {
      const borderRadiusToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: 'border-radius',
        value: '10',
      };
      const fontSizeToken: MainToken<TokenClass> = {
        class: TokenClass.FontSize,
        name: 'font-size',
        value: '{border-radius}*2',
      };
      const renamedBorderRadiusToken: MainToken<TokenClass> = {
        ...borderRadiusToken,
        name: 'border-radius-new',
      };

      await mainTest.step('Open Tokens panel', async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.toolsComp.clickOnTokenToolsButton();
      });

      await mainTest.step(
        'Create board with text layer and define tokens',
        async () => {
          await mainPage.createDefaultBoardByCoordinates(320, 210);
          await mainPage.doubleClickCreatedBoardTitleOnCanvas();
          await mainPage.createDefaultTextLayerByCoordinates(350, 250);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            borderRadiusToken,
          );
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontSizeToken);
        },
      );

      await mainTest.step('Apply font-size token to the text layer', async () => {
        await mainPage.clickViewportByCoordinates(350, 250);
        await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
        await mainPage.waitForChangeIsSaved();
      });

      await tokensPage.renameTokenAndConfirmRemap(
        borderRadiusToken,
        renamedBorderRadiusToken.name,
      );

      await mainTest.step(
        `Check "${fontSizeToken.name}" token is still applied with the updated reference`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
        },
      );

      await mainTest.step(
        'Check applied token title reflects new name and correct reference',
        async () => {
          const expectedTitle = [
            `Token: ${fontSizeToken.name}`,
            `Original value: {${renamedBorderRadiusToken.name}}*2`,
            `Resolved value: 20`,
          ].join('\n');
          await tokensPage.tokensComp.checkAppliedTokenTitle(expectedTitle);
        },
      );
    },
  );

  mainTest(
    qase(
      [2723],
      'should update token references across pages and component copies when renamed',
    ),
    async ({ page }) => {
      const tokenA: MainToken<TokenClass> = {
        class: TokenClass.Color,
        name: 'base-color',
        value: '#111111',
      };
      const renamedTokenA: MainToken<TokenClass> = {
        ...tokenA,
        name: 'base-color-new',
      };
      const tokenB: MainToken<TokenClass> = {
        class: TokenClass.Color,
        name: 'semantic-color',
        value: '{base-color}',
      };
      const newTokenAValue = '#222222';

      layersPanelPage = new LayersPanelPage(page);
      designPanelPage = new DesignPanelPage(page);

      await mainTest.step('Create board and named rectangle', async () => {
        await mainPage.createDefaultBoardByCoordinates(320, 210);
        await mainPage.doubleClickCreatedBoardTitleOnCanvas();
        await mainPage.createDefaultRectangleByCoordinates(350, 250);
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.openLayersTab();
        await layersPanelPage.renameLayerViaRightClick(
          'Rectangle',
          'main-rectangle',
        );
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Create tokens and apply Token B to the rectangle',
        async () => {
          await tokensPage.clickTokensTab();
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(tokenA);
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(tokenB);
          await layersPanelPage.openLayersTab();
          await layersPanelPage.clickLayerOnLayersTab('main-rectangle');
          await tokensPage.clickTokensTab();
          await tokensPage.tokensComp.clickOnTokenWithName(tokenB.name);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Create main component from the rectangle', async () => {
        await mainPage.createComponentsMultipleShapesRightClick(true);
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Copy the component twice (3 total)', async () => {
        await mainPage.duplicateLayerViaRightClick();
        await layersPanelPage.openLayersTab();
        await layersPanelPage.renameSelectedLayerViaDoubleClick('copy-rectangle-1');
        await mainPage.waitForChangeIsSaved();
        await mainPage.duplicateLayerViaRightClick();
        await layersPanelPage.openLayersTab();
        await layersPanelPage.renameSelectedLayerViaDoubleClick('copy-rectangle-2');
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Copy the component to a new Page 2', async () => {
        await layersPanelPage.openLayersTab();
        await layersPanelPage.clickLayerOnLayersTab('main-rectangle');
        await mainPage.copyLayerViaRightClick();
        await mainPage.clickAddPageButton();
        await mainPage.clickOnPageOnLayersPanel(2);
        await mainPage.clickViewportTwice();
        await mainPage.pasteLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickOnPageOnLayersPanel(1);
        await tokensPage.clickTokensTab();
      });

      await tokensPage.renameTokenAndConfirmRemap(tokenA, renamedTokenA.name);

      await mainTest.step(
        'Check Token B is still applied and references new Token A name',
        async () => {
          await layersPanelPage.openLayersTab();
          await layersPanelPage.clickLayerOnLayersTab('main-rectangle');
          await tokensPage.clickTokensTab();
          await designPanelPage.isFillTokenColorSetComponent(tokenB.name);
        },
      );

      await mainTest.step(
        `Change renamed Token A value to "${newTokenAValue}"`,
        async () => {
          await tokensPage.tokensComp.clickEditToken(renamedTokenA);
          await tokensPage.tokensComp.mainTokensComp.enterTokenValue(newTokenAValue);
          await tokensPage.tokensComp.baseComp.modalSaveButton.click();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Check Token B still applied on Page 1', async () => {
        await layersPanelPage.openLayersTab();
        await mainPage.clickOnPageOnLayersPanel(1);
        await layersPanelPage.clickLayerOnLayersTab('main-rectangle');
        await tokensPage.clickTokensTab();
        await designPanelPage.isFillTokenColorSetComponent(tokenB.name);
      });

      await mainTest.step(
        'Navigate to Page 2 and check Token B still applied',
        async () => {
          await layersPanelPage.openLayersTab();
          await mainPage.clickOnPageOnLayersPanel(2);
          await layersPanelPage.clickLayerOnLayersTab('main-rectangle');
          await tokensPage.clickTokensTab();
          await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
          await designPanelPage.isFillTokenColorSetComponent(tokenB.name);
        },
      );
    },
  );
});

mainTest(
  qase([2721], 'should remap applied token references when a token is renamed'),
  async () => {
    const originalTokenName = 'blue-500';
    const renamedTokenName = 'blue-600';
    const newColorValue = '#0080ff';
    const importedFileName = '2721';
    const originalToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: originalTokenName,
    };
    const renamedToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: renamedTokenName,
    };

    await mainTest.step('Import penpot file and open Tokens panel', async () => {
      await dashboardPage.openSidebarItem('Drafts');
      await dashboardPage.importFileFromProjectPage('documents/2721.penpot');
      await dashboardPage.isFilePresent(importedFileName);
      await dashboardPage.openFileWithName(importedFileName);
      await tokensPage.clickTokensTab();
    });

    await tokensPage.renameTokenAndConfirmRemap(originalToken, renamedTokenName);

    await mainTest.step(
      `Change the color of "${renamedTokenName}" to "${newColorValue}"`,
      async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave({
          ...renamedToken,
          value: newColorValue,
        });
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Select the "LIGHT COMPACT" set', async () => {
      await tokensPage.setsComp.setName.filter({ hasText: 'LIGHT COMPACT' }).click();
    });

    await mainTest.step(
      'Hover "color-primary" — verify updated reference and resolved color',
      async () => {
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        const expectedTitle = [
          'Token: color-primary',
          `Original value: {${renamedTokenName}}`,
          `Resolved value: ${newColorValue}`,
        ].join('\n');
        await tokensPage.tokensComp.checkTokenTitle('color-primary', expectedTitle);
      },
    );

    await mainTest.step('Select and enable the "DARK" set', async () => {
      await tokensPage.setsComp.setName.filter({ hasText: 'DARK' }).click();
      await tokensPage.setsComp.clickOnSetCheckboxByName('DARK');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Hover "color-primary" — verify DARK set value ({red-500} → #d8274e)',
      async () => {
        await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
        const expectedTitle = [
          'Token: color-primary',
          'Original value: {red-500}',
          'Resolved value: #d8274e',
        ].join('\n');
        await tokensPage.tokensComp.checkTokenTitle('color-primary', expectedTitle);
      },
    );
  },
);
