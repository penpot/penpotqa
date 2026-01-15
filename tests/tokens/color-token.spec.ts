import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const teamName = random().concat('autotest');
const sampleData = new SampleData();

mainTest.beforeEach(
  'Create a team and a new file',
  async ({ page, browserName }) => {
    let teamPage: TeamPage = new TeamPage(page);
    let dashboardPage: DashboardPage = new DashboardPage(page);
    let mainPage: MainPage = new MainPage(page);

    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await dashboardPage.createFileViaPlaceholder();
    browserName === 'webkit' && !(await mainPage.isMainPageVisible())
      ? await dashboardPage.createFileViaPlaceholder()
      : null;
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
  },
);

mainTest.afterEach(async ({ page }) => {
  const teamPage: TeamPage = new TeamPage(page);
  const mainPage: MainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;

  const colorToken: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'global.color',
    value: sampleData.color.redHexCode,
  };

  mainTest.beforeEach(
    `Create a default board and a color token: "${colorToken.name}"`,
    async ({ page }) => {
      mainPage = new MainPage(page);
      tokensPage = new TokensPage(page);
      designPanelPage = new DesignPanelPage(page);

      await mainPage.createDefaultBoardByCoordinates(320, 210);
      await tokensPage.clickTokensTab();
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken);
      await tokensPage.tokensComp.isTokenVisibleWithName(colorToken.name);
    },
  );

  mainTest(
    qase(2142, 'Apply default "color fill" token to a board (by left click)'),
    async () => {
      await tokensPage.tokensComp.clickOnTokenWithName(colorToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(colorToken.name);
      await designPanelPage.isFillTokenColorSetComponent(colorToken.name);
      await expect(mainPage.createdLayer).toHaveScreenshot('board-color-red.png');
      await tokensPage.tokensComp.isMenuItemWithNameSelected(
        colorToken.name,
        'ColorFill',
      );
    },
  );

  mainTest(
    qase(2147, 'Apply "color stroke" token to a board (by right click)'),
    async () => {
      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.setStrokeWidth('10');
      await tokensPage.tokensComp.selectMenuItem(colorToken.name, 'Stroke');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await tokensPage.tokensComp.isTokenAppliedWithName(colorToken.name);
      await expect(mainPage.createdLayer).toHaveScreenshot('board-red-stroke.png');
      await tokensPage.tokensComp.isMenuItemWithNameSelected(
        colorToken.name,
        'Stroke',
      );
    },
  );

  mainTest(
    qase(2670, 'Search and apply color token (filter list and change input color)'),
    async () => {
      const secondColorToken: MainToken<TokenClass> = {
        class: TokenClass.Color,
        name: 'color.secondary',
        value: sampleData.color.blueHexCode,
      };

      await mainTest.step(
        `Create a second color token: "${secondColorToken.name}"`,
        async () => {
          await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
            secondColorToken,
          );
          await tokensPage.tokensComp.isTokenVisibleWithName(secondColorToken.name);
        },
      );

      await mainTest.step(
        `Apply first token:"${colorToken.name}" to board`,
        async () => {
          await tokensPage.tokensComp.clickOnTokenWithName(colorToken.name);
          await mainPage.waitForChangeIsSaved();
          await tokensPage.tokensComp.isTokenAppliedWithName(colorToken.name);
          await designPanelPage.isFillTokenColorSetComponent(colorToken.name);
        },
      );

      await mainTest.step(
        `Click on color picker and search color token by name: "${secondColorToken.name}"`,
        async () => {
          await designPanelPage.clickFillColorIcon();
          await designPanelPage.isSearchByTokenNameInputVisible();
          await designPanelPage.fillSearchByTokenNameInput('secondary');
        },
      );

      await mainTest.step(
        `Assert "${secondColorToken.name}" is visible and "${colorToken.name}" is not visible in the filtered list`,
        async () => {
          await designPanelPage.isColorTokenButtonVisible(secondColorToken.name);
          await designPanelPage.isColorTokenButtonNotVisible(colorToken.name);
        },
      );

      await mainTest.step(
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
