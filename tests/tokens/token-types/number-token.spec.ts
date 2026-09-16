import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  await mainPage.clickMoveButton();
});

demoAccountFileTest(
  qase(
    [2485],
    'Reference a Number token as an operand (math operation / Number token)',
  ),
  async ({ mainPage }) => {
    const numberToken: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'numberToken',
      value: '2',
    };
    const numberTokenRef: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'number',
      value: `5*{${numberToken.name}}`,
    };

    const updatedTokenData: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: numberTokenRef.name,
      value: `5/{${numberToken.name}}`,
    };

    await demoAccountFileTest.step(
      `Create "${numberToken.name}" and "${numberTokenRef.name}" tokens with multiplication reference`,
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(numberToken);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(numberTokenRef);
        await tokensPage.tokensComp.isTokenVisibleWithName(numberTokenRef.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.checkTokenTitle(
          numberTokenRef.name,
          `Token: ${numberTokenRef.name}\n` +
            `Original value: 5*{${numberToken.name}}\n` +
            'Resolved value: 10\n' +
            'Right click to see options',
        );
      },
    );

    await demoAccountFileTest.step(
      'Edit to division and verify resolved value is 2.5',
      async () => {
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
        await tokensPage.tokensComp.isTokenVisibleWithName(numberTokenRef.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.checkTokenTitle(
          numberTokenRef.name,
          `Token: ${numberTokenRef.name}\n` +
            `Original value: ${updatedTokenData.value}\n` +
            'Resolved value: 2.5\n' +
            'Right click to see options',
        );
      },
    );

    await demoAccountFileTest.step(
      'Edit to addition and verify resolved value is 7',
      async () => {
        updatedTokenData.value = `5+{${numberToken.name}}`;
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
        await tokensPage.tokensComp.isTokenVisibleWithName(numberTokenRef.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.checkTokenTitle(
          numberTokenRef.name,
          `Token: ${numberTokenRef.name}\n` +
            `Original value: ${updatedTokenData.value}\n` +
            'Resolved value: 7\n' +
            'Right click to see options',
        );
      },
    );

    await demoAccountFileTest.step(
      'Edit to subtraction and verify resolved value is 3',
      async () => {
        updatedTokenData.value = `5-{${numberToken.name}}`;
        await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
        await tokensPage.tokensComp.isTokenVisibleWithName(numberTokenRef.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.checkTokenTitle(
          numberTokenRef.name,
          `Token: ${numberTokenRef.name}\n` +
            `Original value: ${updatedTokenData.value}\n` +
            'Resolved value: 3\n' +
            'Right click to see options',
        );
      },
    );
  },
);

demoAccountFileTest(
  qase([2477], 'Apply a Number token (Rotation) and override value from Design tab'),
  async ({ mainPage }) => {
    const numberToken: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'number',
      value: '45',
    };
    const newTokenValue = '0';

    await demoAccountFileTest.step(
      `Create rectangle and apply "${numberToken.name}" token as Rotation`,
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(320, 210);
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(numberToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(numberToken.name);
        await tokensPage.tokensComp.selectMenuItem(numberToken.name, 'Rotation');
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name);
        await tokensPage.tokensComp.isMenuItemWithNameSelected(
          numberToken.name,
          'Rotation',
        );
        await designPanelPage.checkRotationForLayer(numberToken.value);
      },
    );

    await demoAccountFileTest.step(
      `Override rotation to "${newTokenValue}" from Design tab and verify token is detached`,
      async () => {
        await designPanelPage.changeRotationForLayer(newTokenValue);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name, false);
        await designPanelPage.checkRotationForLayer(newTokenValue);
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [2492],
    'Apply a Number token (Line Height) and override value from Design tab',
  ),
  async ({ mainPage }) => {
    const numberToken: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'number',
      value: '2',
    };
    const newTokenValue = '1';

    await demoAccountFileTest.step(
      `Create text layer and apply "${numberToken.name}" token as Line Height`,
      async () => {
        await mainPage.createDefaultTextLayerByCoordinates(100, 200);
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(numberToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(numberToken.name);
        await tokensPage.tokensComp.selectMenuItem(numberToken.name, 'Line Height');
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name);
        await tokensPage.tokensComp.isMenuItemWithNameSelected(
          numberToken.name,
          'Line Height',
        );
        await designPanelPage.checkTextLineHeight(numberToken.value);
      },
    );

    await demoAccountFileTest.step(
      `Override line height to "${newTokenValue}" from Design tab and verify token is detached`,
      async () => {
        await designPanelPage.changeTextLineHeight(newTokenValue);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name, false);
        await designPanelPage.checkTextLineHeight(newTokenValue);
      },
    );
  },
);
