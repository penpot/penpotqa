import { mainTest } from '../../fixtures';
import { random } from '../../helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '../../pages/workspace/main-page';
import { TeamPage } from '../../pages/dashboard/team-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { TokensPage } from '../../pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page }) => {
  const teamPage: TeamPage = new TeamPage(page);
  const dashboardPage: DashboardPage = new DashboardPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest.afterEach(async ({ page }) => {
  const mainPage: MainPage = new MainPage(page);
  const teamPage: TeamPage = new TeamPage(page);

  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let dashboardPage: DashboardPage;
  let tokensPage: TokensPage;

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    dashboardPage = new DashboardPage(page);
    tokensPage = new TokensPage(page);

    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.toolsComp.clickOnTokenToolsButton();
  });

  mainTest.describe(() => {
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

    mainTest.beforeEach(async () => {
      await mainPage.createDefaultBoardByCoordinates(320, 210);
      await mainPage.doubleClickCreatedBoardTitleOnCanvas();
      await mainPage.createDefaultTextLayerByCoordinates(350, 250);
      await mainPage.waitForChangeIsSaved();

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(borderRadiusToken);
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontSizeToken);

      await mainPage.clickViewportByCoordinates(350, 250);
      await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
      await mainPage.waitForChangeIsSaved();
    });

    mainTest(
      qase(
        [2719],
        'Rename a token that is being referenced from other tokens as part of an expression',
      ),
      async () => {
        await mainTest.step(
          `Select "${borderRadiusToken.name}" token and open Edit Token modal`,
          async () => {
            await tokensPage.tokensComp.clickEditToken(borderRadiusToken);
          },
        );

        await mainTest.step(
          `Edit the token name to "${renamedBorderRadiusToken.name}"`,
          async () => {
            await tokensPage.tokensComp.tokenNameInput.fill(
              renamedBorderRadiusToken.name,
            );
          },
        );

        await mainTest.step(
          'Save — remap modal opens, token name not changed yet',
          async () => {
            await tokensPage.tokensComp.baseComp.modalSaveButton.click();
          },
        );

        await mainTest.step(
          'Check remap modal is visible with rename info and references',
          async () => {
            await tokensPage.tokensComp.isRemapModalVisible();
          },
        );

        await mainTest.step(
          `Confirm remap — "${borderRadiusToken.name}" renamed to "${renamedBorderRadiusToken.name}" and still highlighted`,
          async () => {
            await tokensPage.tokensComp.clickRemapTokensButton();
            await mainPage.waitForChangeIsSaved();
            await tokensPage.tokensComp.isTokenVisibleWithName(
              renamedBorderRadiusToken.name,
            );
          },
        );

        await mainTest.step(
          `Check "${fontSizeToken.name}" token is still applied with the updated reference`,
          async () => {
            await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
          },
        );

        await mainTest.step(
          `Check applied token title reflects new name and correct reference`,
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
  });
});
