import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const sampleData = new SampleData();

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

demoAccountFileTest.beforeEach(
  'Create a team and a new file',
  async ({ page, mainPage }) => {
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    await mainPage.clickMoveButton();
  },
);

demoAccountFileTest.describe(() => {
  const colorToken: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'color',
    value: sampleData.color.redHexCode,
  };

  demoAccountFileTest.beforeEach(
    `Create a default board and a color token: "${colorToken.name}"`,
    async ({ page, mainPage }) => {
      await mainPage.createDefaultBoardByCoordinates(320, 210);
      await tokensPage.clickTokensTab();
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken);
      await tokensPage.tokensComp.isTokenVisibleWithName(colorToken.name);
    },
  );

  demoAccountFileTest(
    qase([2142], 'Apply default "color fill" token to a board (by left click)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        `Apply "${colorToken.name}" token to board fill and verify it is applied`,
        async () => {
          await tokensPage.tokensComp.clickOnTokenWithName(colorToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(colorToken.name);
          await designPanelPage.isFillTokenColorSetComponent(colorToken.name);
        },
      );

      await demoAccountFileTest.step(
        'Verify screenshot and ColorFill menu item is selected',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot('board-color-red.png', {
            mask: mainPage.maskViewport(),
          });
          await tokensPage.tokensComp.isMenuItemWithNameSelected(
            colorToken.name,
            'Fill',
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([2147], 'Apply "color stroke" token to a board (by right click)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        `Add stroke to board and apply "${colorToken.name}" token via right click`,
        async () => {
          await designPanelPage.clickAddStrokeButton();
          await designPanelPage.setStrokeWidth('10');
          await tokensPage.tokensComp.selectMenuItem(colorToken.name, 'Stroke');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await tokensPage.tokensComp.isTokenAppliedWithName(colorToken.name);
        },
      );

      await demoAccountFileTest.step(
        'Verify screenshot and Stroke menu item is selected',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot('board-red-stroke.png', {
            mask: mainPage.maskViewport(),
          });
          await tokensPage.tokensComp.isMenuItemWithNameSelected(
            colorToken.name,
            'Stroke',
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [2669, 2670],
      'Search and apply color token (filter list and change input color)',
    ),
    async ({ mainPage }) => {
      const secondColorToken: MainToken<TokenClass> = {
        class: TokenClass.Color,
        name: 'color-secondary',
        value: sampleData.color.blueHexCode,
      };

      await demoAccountFileTest.step(
        `Create a second color token: "${secondColorToken.name}"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            secondColorToken,
          );
          await tokensPage.tokensComp.isTokenVisibleWithName(secondColorToken.name);
        },
      );

      await demoAccountFileTest.step(
        '(2669) Open color picker for board with raw fill and verify Colors/Tokens switch is visible with Colors mode selected by default',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await designPanelPage.isColorPickerTokensButtonVisible();
          await designPanelPage.isSearchByTokenNameInputNotVisible();
        },
      );

      await demoAccountFileTest.step(
        `(2669) Switch to Tokens mode in color picker and verify "${colorToken.name}" token is visible`,
        async () => {
          await designPanelPage.clickColorPickerTokensButton();
          await designPanelPage.isSearchByTokenNameInputVisible();
          await designPanelPage.isColorTokenButtonVisible(colorToken.name);
        },
      );

      await demoAccountFileTest.step(
        `Apply first token:"${colorToken.name}" to board`,
        async () => {
          await tokensPage.tokensComp.clickOnTokenWithName(colorToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(colorToken.name);
          await designPanelPage.isFillTokenColorSetComponent(colorToken.name);
        },
      );

      await demoAccountFileTest.step(
        `Click on color picker and search color token by name: "${secondColorToken.name}"`,
        async () => {
          await designPanelPage.clickFillColorIcon();
          await designPanelPage.isSearchByTokenNameInputVisible();
          await designPanelPage.fillSearchByTokenNameInput('secondary');
        },
      );

      await demoAccountFileTest.step(
        `Assert "${secondColorToken.name}" is visible and "${colorToken.name}" is not visible in the filtered list`,
        async () => {
          await designPanelPage.isColorTokenButtonVisible(secondColorToken.name);
          await designPanelPage.isColorTokenButtonNotVisible(colorToken.name);
        },
      );

      await demoAccountFileTest.step(
        `Apply "${secondColorToken.name}" and assert that color token is applied to the board`,
        async () => {
          await designPanelPage.clickColorTokenButton(secondColorToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(secondColorToken.name);
        },
      );
    },
  );
});

demoAccountFileTest.describe(() => {
  const globalColorSetName = 'global (color)';
  const aliasColorDarkSetName = 'alias (color-dark)';

  demoAccountFileTest(
    qase([3547], 'Color tokens are displayed only from the active sets'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create a default rectangle with default fill color',
        async () => {
          await mainPage.clickCreateRectangleButton();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step('Import the token test file', async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.toolsComp.clickOnTokenToolsButton();
        await tokensPage.toolsComp.importTokens('documents/tokens-example.json');
      });

      await demoAccountFileTest.step(
        'Open color picker for rectangle and assert token sets are listed in reverse order',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await designPanelPage.clickColorPickerTokensButton();
          await designPanelPage.isTogglePanelSetButtonsCount(2);
          await designPanelPage.isTogglePanelSetButtonTextByIndex(
            0,
            aliasColorDarkSetName,
          );
          await designPanelPage.isTogglePanelSetButtonTextByIndex(
            1,
            globalColorSetName,
          );
        },
      );
    },
  );
});
