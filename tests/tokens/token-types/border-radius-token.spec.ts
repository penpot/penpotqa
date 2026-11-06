import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  await mainPage.clickMoveButton();
});

demoAccountFileTest.describe(() => {
  let tokensPage: TokensPage;
  let mainPage: MainPage;
  let designPanelPage: DesignPanelPage;
  let workspacePage: WorkspacePage;

  const radiusToken: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'border-radius',
    value: '10',
    description: 'Description',
  };
  const newTokenValue = '20';

  demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    tokensPage = new TokensPage(page);
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);
    workspacePage = new WorkspacePage(page);

    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(radiusToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(radiusToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase([2125], 'Apply default "all radius" token to a rectangle (by left click)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        `Verify "${radiusToken.name}" token is applied and corner radius matches`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await designPanelPage.checkGeneralCornerRadius(radiusToken.value);
        },
      );

      await demoAccountFileTest.step(
        'Verify screenshot and RadiusAll menu item is selected',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'rectangle-border-radius-1.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await tokensPage.tokensComp.isAllMenuItemWithSectionNameSelected(
            radiusToken.name,
            'Radius',
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [2166],
      'Edit a border radius token, already applied to a shape (with warning renaming message)',
    ),
    async ({ mainPage }) => {
      const radiusToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: 'border-radius',
        value: '-1',
        description: 'Description',
      };

      const updatedTokenData: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: radiusToken.name,
        value: newTokenValue,
      };

      await demoAccountFileTest.step(
        `Edit "${radiusToken.name}" token to value "${updatedTokenData.value}" and verify it is applied`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await tokensPage.tokensComp.editTokenViaRightClickAndSave(
            updatedTokenData,
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGeneralCornerRadius(updatedTokenData.value);
          await tokensPage.tokensComp.isTokenAppliedWithName(updatedTokenData.name);
        },
      );

      await demoAccountFileTest.step(
        'Verify screenshot and applied token title',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'rectangle-border-radius-20.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await tokensPage.tokensComp.checkAppliedTokenTitle(
            'Name: border-radius\n' + 'Original value: 20\n' + 'Resolved value: 20',
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([2136], 'Delete a token and redo deletion'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        `Delete "${radiusToken.name}" token and verify it is removed`,
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await tokensPage.tokensComp.deleteToken(radiusToken.name);
          await tokensPage.tokensComp.isTokenVisibleWithName(
            radiusToken.name,
            false,
          );
        },
      );

      await demoAccountFileTest.step(
        'Undo deletion and verify token is restored',
        async () => {
          await mainPage.clickShortcutCtrlZ();
          await tokensPage.tokensComp.expandTokenByName(TokenClass.BorderRadius);
          await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name, true);
        },
      );
    },
  );

  demoAccountFileTest(
    qase([2135], 'Unapply a border radius token from a rectangle (3 ways)'),
    async ({ mainPage }) => {
      const renamedToken = 'border-radius-renamed';

      await demoAccountFileTest.step(
        'Unapply the token by clicking on it, then undo',
        async () => {
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
          await tokensPage.tokensComp.clickOnTokenWithName(radiusToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(
            radiusToken.name,
            false,
          );
          await mainPage.clickShortcutCtrlZ();
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
        },
      );

      await demoAccountFileTest.step(
        'Unapply the token from the ticked context menu option, then undo',
        async () => {
          await tokensPage.tokensComp.isAllMenuItemWithSectionNameSelected(
            radiusToken.name,
            'Radius',
          );
          await tokensPage.tokensComp.clickAllMenuItemWithSectionName('Radius');
          await tokensPage.tokensComp.isTokenAppliedWithName(
            radiusToken.name,
            false,
          );
          await mainPage.clickShortcutCtrlZ();
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
        },
      );

      await demoAccountFileTest.step(
        'Rename the token without remapping and verify the reference is broken',
        async () => {
          await tokensPage.tokensComp.renameTokenAndSkipRemap(
            radiusToken,
            renamedToken,
          );
          await tokensPage.tokensComp.isTokenAppliedWithName(renamedToken, false);
          await workspacePage.rightSidebar.design.radius.checkTokenNotExistOrDeleted(
            radiusToken.name,
          );
        },
      );
    },
  );
});
