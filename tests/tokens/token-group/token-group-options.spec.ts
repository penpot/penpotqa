import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import {
  TokenClass,
  buildTokenPath,
} from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  await mainPage.clickMoveButton();
  await tokensPage.clickTokensTab();
});

mainAccountFileTest.describe('Context menu > Delete', () => {
  mainAccountFileTest.beforeEach(async () => {
    await tokensPage.clickTokensTab();
  });

  mainAccountFileTest(qase([2742], 'Remove a tokens group'), async () => {
    const tokenValue = '#000000';
    const foundationsGroup = { name: 'foundations' };
    const primaryGroup = { name: 'primary', parent: foundationsGroup };

    const darkToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: buildTokenPath('dark', primaryGroup),
      value: tokenValue,
    };
    const accentToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: buildTokenPath('accent', primaryGroup),
      value: tokenValue,
    };
    const foregroundToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: buildTokenPath('foreground', primaryGroup),
      value: tokenValue,
    };
    const backgroundToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: buildTokenPath('background', primaryGroup),
      value: tokenValue,
    };

    await mainAccountFileTest.step(
      `Create color tokens "${darkToken.name}", "${accentToken.name}", "${foregroundToken.name}" and "${backgroundToken.name}"`,
      async () => {
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(darkToken);
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(accentToken);
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(foregroundToken);
        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(backgroundToken);
      },
    );

    await mainAccountFileTest.step(
      `Verify "${foundationsGroup.name}" and "${primaryGroup.name}" groups are visible and contain the expected tokens`,
      async () => {
        await tokensPage.tokensComp.isTokenGroupVisible(foundationsGroup);
        await tokensPage.tokensComp.isTokenGroupVisible(primaryGroup);
        await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
          primaryGroup,
          'dark',
        );
        await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
          primaryGroup,
          'accent',
        );
        await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
          primaryGroup,
          'foreground',
        );
        await tokensPage.tokensComp.isLastSegmentVisibleInGroup(
          primaryGroup,
          'background',
        );
      },
    );

    await mainAccountFileTest.step(
      `Delete "${foundationsGroup.name}" group and verify "${foundationsGroup.name}", "${primaryGroup.name}" groups and tokens "${darkToken.name}", "${accentToken.name}", "${foregroundToken.name}", "${backgroundToken.name}" are removed`,
      async () => {
        await tokensPage.tokensComp.deleteTokenGroup(foundationsGroup);
        await tokensPage.tokensComp.isTokenGroupCount(foundationsGroup, 0);
        await tokensPage.tokensComp.isTokenGroupCount(primaryGroup, 0);
        await tokensPage.tokensComp.isTokenVisibleWithName(darkToken.name, false);
        await tokensPage.tokensComp.isTokenVisibleWithName(accentToken.name, false);
        await tokensPage.tokensComp.isTokenVisibleWithName(
          foregroundToken.name,
          false,
        );
        await tokensPage.tokensComp.isTokenVisibleWithName(
          backgroundToken.name,
          false,
        );
      },
    );
  });

  mainAccountFileTest(
    qase(
      [2745],
      'Remove a tokens group (with a token referenced in other tokens group)',
    ),
    async () => {
      const primaryGroup = { name: 'primary' };
      const secondaryGroup = { name: 'secondary' };
      const primaryToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: `${primaryGroup.name}.border-radius30`,
        value: '30',
      };
      const secondaryToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: `${secondaryGroup.name}.border-radius60`,
        value: `{${primaryToken.name}}+2`,
      };

      await mainAccountFileTest.step(
        `Create token "${primaryToken.name}" with value "${primaryToken.value}"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(primaryToken);
        },
      );

      await mainAccountFileTest.step(
        `Create token "${secondaryToken.name}" with value "${secondaryToken.value}" referencing "${primaryToken.name}"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            secondaryToken,
          );
        },
      );

      await mainAccountFileTest.step(
        `Verify "${primaryGroup.name}" and "${secondaryGroup.name}" groups are visible`,
        async () => {
          await tokensPage.tokensComp.isTokenGroupVisible(primaryGroup);
          await tokensPage.tokensComp.isTokenGroupVisible(secondaryGroup);
        },
      );

      await mainAccountFileTest.step(
        `Delete "${primaryGroup.name}" group and verify group and token "${primaryToken.name}" are removed`,
        async () => {
          await tokensPage.tokensComp.deleteTokenGroup(primaryGroup);
          await tokensPage.tokensComp.isTokenGroupCount(primaryGroup, 0);
          await tokensPage.tokensComp.isTokenVisibleWithName(
            primaryToken.name,
            false,
          );
        },
      );

      await mainAccountFileTest.step(
        `Verify "${secondaryToken.name}" is highlighted as invalid and shows correct tooltip`,
        async () => {
          await tokensPage.tokensComp.checkInvalidTokenCount(1);
          await tokensPage.tokensComp.invalidToken.hover();
          await expect(tokensPage.tokensComp.invalidToken).toHaveAttribute(
            'title',
            `Reference in {${secondaryToken.name}} is not valid or is not in any active set.`,
          );
        },
      );
    },
  );

  mainAccountFileTest(
    qase([2743], 'Remove a token in a tokens group (with only one token)'),
    async () => {
      const tokenValue = '#000000';
      const foundationsGroup = { name: 'foundations' };
      const primaryGroup = { name: 'primary', parent: foundationsGroup };

      const darkToken: MainToken<TokenClass> = {
        class: TokenClass.Color,
        name: buildTokenPath('dark', primaryGroup),
        value: tokenValue,
      };

      await mainAccountFileTest.step('Open Tokens panel', async () => {
        await tokensPage.clickTokensTab();
      });

      await mainAccountFileTest.step(
        `Create color token "${darkToken.name}"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(darkToken);
        },
      );

      await mainAccountFileTest.step(
        `Verify "${foundationsGroup.name}" and "${primaryGroup.name}" groups are visible`,
        async () => {
          await tokensPage.tokensComp.isTokenGroupVisible(foundationsGroup);
          await tokensPage.tokensComp.isTokenGroupVisible(primaryGroup);
        },
      );

      await mainAccountFileTest.step(
        `Delete "${darkToken.name}" token and verify it is removed along with "${foundationsGroup.name}" and "${primaryGroup.name}" groups`,
        async () => {
          await tokensPage.tokensComp.deleteToken(darkToken.name);
          await tokensPage.tokensComp.isTokenVisibleWithName(darkToken.name, false);
          await tokensPage.tokensComp.isTokenGroupCount(foundationsGroup, 0);
          await tokensPage.tokensComp.isTokenGroupCount(primaryGroup, 0);
        },
      );
    },
  );
});

mainAccountFileTest.describe('Context menu > Rename', () => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
  });

  mainAccountFileTest(
    qase(
      [2839],
      'Rename a token group with tokens that are being referenced from other token that has several alias (tokens with the same name in different sets)',
    ),
    async ({ mainPage }) => {
      const colorTokenName = 'color.primary';
      const colorPrimaryValue = '#ff0000';
      const colorUpdatedValue = '#2200ff';
      const set = 'Light';
      const primaryGroup = { name: 'color' };
      const newGroupName = 'brandColors';

      await mainAccountFileTest.step('Import tokens with sets', async () => {
        await tokensPage.toolsComp.clickOnTokenToolsButton();
        await tokensPage.toolsComp.importTokens(
          'documents/tokens/tokens-with-sets.json',
        );
      });

      await mainAccountFileTest.step(
        `Click set "${set}" and apply "${colorTokenName}" (${colorPrimaryValue}) token to shape`,
        async () => {
          await tokensPage.setsComp.clickSetItemButton(set);
          await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
          await tokensPage.tokensComp.clickOnTokenWithName(colorTokenName);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(colorTokenName);
        },
      );

      await mainAccountFileTest.step(
        `Rename token group "${primaryGroup.name}" to "${newGroupName}"`,
        async () => {
          await tokensPage.tokensComp.renameTokenGroup(primaryGroup, newGroupName);
          await tokensPage.tokensComp.clickRemapTokensButton();
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenGroupVisible({ name: newGroupName });
        },
      );

      await mainAccountFileTest.step(
        `Assert shape color is updated to ${colorUpdatedValue}`,
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'token-group-renamed-shape-color.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );
});

mainAccountFileTest.describe('Context menu > Duplicate', () => {
  const tokenValue = '#ff0000';

  // Token nested in the 'button' group
  const buttonGroup = { name: 'button' };
  const primaryButtonGroupGroup = { name: 'primary', parent: buttonGroup };
  const backgroundColorButtonGroupToken: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: buildTokenPath('background-color', primaryButtonGroupGroup),
    value: tokenValue,
  };

  // Token nested in the 'button-copy' group
  const buttonGroupCopy = { name: 'button-copy' };
  const primaryButtonGroupCopyGroup = { name: 'primary', parent: buttonGroupCopy };
  const backgroundColorButtonGroupCopyToken: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: buildTokenPath('background-color', primaryButtonGroupCopyGroup),
    value: tokenValue,
  };

  mainAccountFileTest(
    qase(
      [2835],
      'Duplicate 2nd-level token group supports merging new content into an existing token group',
    ),
    async () => {
      await mainAccountFileTest.step(
        'Import tokens file with 2nd level token groups',
        async () => {
          await tokensPage.toolsComp.clickOnTokenToolsButton();
          await tokensPage.toolsComp.importTokens(
            'documents/tokens/duplicating_token_groups.json',
          );
        },
      );

      await mainAccountFileTest.step(
        `Expand token group ${TokenClass.Color} and verify groups "${buttonGroup.name}" and "${buttonGroupCopy.name}" are visible with expected tokens`,
        async () => {
          await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
          await tokensPage.tokensComp.isTokenGroupVisible(buttonGroup);
          await tokensPage.tokensComp.isTokenGroupCount(buttonGroup, 1);
          await tokensPage.tokensComp.isTokenGroupVisible(buttonGroupCopy);
          await tokensPage.tokensComp.isTokenGroupCount(buttonGroupCopy, 1);
          await tokensPage.tokensComp.isTokenVisibleWithName(
            backgroundColorButtonGroupToken.name,
          );
        },
      );

      await mainAccountFileTest.step(
        `Duplicate "${buttonGroup.name}" token group and merge into "${buttonGroupCopy.name}" token group`,
        async () => {
          await tokensPage.tokensComp.duplicateTokenGroup(
            buttonGroup,
            buttonGroupCopy.name,
          );
        },
      );

      await mainAccountFileTest.step(
        `Verify the groups are merged with both of them containing the expected token "${backgroundColorButtonGroupToken.name}" and "${backgroundColorButtonGroupCopyToken.name}" respectively`,
        async () => {
          await tokensPage.tokensComp.isTokenGroupVisible(buttonGroup);
          await tokensPage.tokensComp.isTokenGroupCount(buttonGroup, 1);
          await tokensPage.tokensComp.isTokenVisibleWithName(
            backgroundColorButtonGroupToken.name,
          );

          await tokensPage.tokensComp.isTokenGroupVisible(buttonGroupCopy);
          await tokensPage.tokensComp.isTokenGroupCount(buttonGroupCopy, 1);
          await tokensPage.tokensComp.isTokenVisibleWithName(
            backgroundColorButtonGroupCopyToken.name,
          );
        },
      );
    },
  );
});
