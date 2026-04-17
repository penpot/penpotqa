import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const teamName = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(
    2485,
    'Reference a Number token as an operand (math operation / Number token)',
  ),
  async () => {
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

mainTest(
  qase(2477, 'Apply a Number token (Rotation) and override value from Design tab'),
  async () => {
    const numberToken: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'number',
      value: '45',
    };
    const newTokenValue = '0';

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

    await designPanelPage.changeRotationForLayer(newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name, false);
    await designPanelPage.checkRotationForLayer(newTokenValue);
  },
);

mainTest(
  qase(
    2492,
    'Apply a Number token (Line Height) and override value from Design tab',
  ),
  async () => {
    const numberToken: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'number',
      value: '2',
    };
    const newTokenValue = '1';

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

    await designPanelPage.changeTextLineHeight(newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name, false);
    await designPanelPage.checkTextLineHeight(newTokenValue);
  },
);
