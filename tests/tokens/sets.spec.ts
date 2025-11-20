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

mainTest.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);

  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase(2102, 'Create a set via "create one" link'), async ({ page }) => {
  const tokensPage: TokensPage = new TokensPage(page);
  const name = 'Mobile';
  await tokensPage.clickTokensTab();
  await tokensPage.setsComp.createSetViaLink(name);
  await tokensPage.setsComp.checkFirstSetName(name);
});

mainTest(qase(2127, 'Rename a set'), async ({ page }) => {
  const tokensPage: TokensPage = new TokensPage(page);
  const name = 'Mobile';
  const newName1 = 'Mobile-Updated-Double-Click';
  const newName2 = 'Mobile-Updated-Context-Menu';
  const colorToken: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'color',
    value: sampleData.color.getRandomHexCode(),
  };

  await mainTest.step('Create a set', async () => {
    await tokensPage.clickTokensTab();
    await tokensPage.setsComp.createSetViaButton(name);
    await tokensPage.setsComp.checkFirstSetName(name);
  });

  await mainTest.step('Create a color token', async () => {
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken);
  });

  await mainTest.step('Rename set double click and assert name', async () => {
    await tokensPage.setsComp.renameSetByDoubleClick(newName1);
    await tokensPage.setsComp.checkFirstSetName(newName1);
  });

  await mainTest.step('Rename set via context menu and assert name', async () => {
    await tokensPage.setsComp.renameSetViaContextMenu(newName1, newName2);
    await tokensPage.setsComp.checkFirstSetName(newName2);
  });
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let designPanelPage: DesignPanelPage;
  let tokensPage: TokensPage;

  const colorToken1: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'color',
    value: sampleData.color.getRandomHexCode(),
  };
  const colorToken2: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'color',
    value: sampleData.color.getRandomHexCode(),
  };
  const radiusToken1: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'border-radius',
    value: '30',
  };
  const radiusToken2: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'border-radius',
    value: '50',
  };

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);
    tokensPage = new TokensPage(page);

    await tokensPage.createDefaultRectangleByCoordinates(100, 200);

    await tokensPage.clickTokensTab();
    await tokensPage.setsComp.createSetViaButton('Mode/Dark');
    await tokensPage.setsComp.isSetNameVisible('Dark');
    await tokensPage.setsComp.isGroupSetNameVisible('Mode');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Dark');
    await tokensPage.setsComp.isSetCheckedByName('Dark');
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken1);
    await tokensPage.mainTokensComp.clickOnTokenWithName(colorToken1.name);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSetComponent(colorToken1.value);

    await tokensPage.setsComp.createSetViaButton('Mode/Light');
    await tokensPage.setsComp.isSetNameVisible('Light');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Light');
    await tokensPage.setsComp.isSetCheckedByName('Light');
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken2);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSetComponent(colorToken2.value);

    await tokensPage.setsComp.createSetViaButton('Device/Desktop');
    await tokensPage.setsComp.isSetNameVisible('Desktop');
    await tokensPage.setsComp.isGroupSetNameVisible('Device');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Desktop');
    await tokensPage.setsComp.isSetCheckedByName('Desktop');
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(radiusToken2);

    await tokensPage.mainTokensComp.clickOnTokenWithName(radiusToken2.name);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkGeneralCornerRadius(radiusToken2.value);

    await tokensPage.setsComp.createSetViaButton('Device/Mobile');
    await tokensPage.setsComp.isSetNameVisible('Mobile');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Mobile');
    await tokensPage.setsComp.isSetCheckedByName('Mobile');
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(radiusToken1);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkGeneralCornerRadius(radiusToken1.value);
  });

  mainTest(qase(2139, 'Enable and Disable sets'), async () => {
    await tokensPage.setsComp.clickOnSetCheckboxByName('Light');
    await designPanelPage.isFillHexCodeSetComponent(colorToken1.value);
    await tokensPage.setsComp.clickOnSetCheckboxByName('Mobile');
    await designPanelPage.checkGeneralCornerRadius(radiusToken2.value);
    await tokensPage.setsComp.clickOnSetCheckboxByName('Light');
    await designPanelPage.isFillHexCodeSetComponent(colorToken2.value);
    await tokensPage.setsComp.clickOnSetCheckboxByName('Mobile');
    await designPanelPage.checkGeneralCornerRadius(radiusToken1.value);
  });

  mainTest(qase(2141, 'Add set to this group'), async () => {
    await tokensPage.setsComp.addSetToGroupByName('Device', 'Tablet');
    await tokensPage.setsComp.isSetNameVisible('Tablet', true);
  });

  mainTest(qase(2146, 'Delete a set group'), async () => {
    await tokensPage.setsComp.deleteSetsGroupByName('Device');
    await tokensPage.setsComp.isGroupSetNameVisible('Device', false);
    await tokensPage.setsComp.isSetNameVisible('Desktop', false);
    await tokensPage.setsComp.isSetNameVisible('Mobile', false);
  });
});

mainTest(qase(2231, 'Duplicate set'), async ({ page }) => {
  const tokensPage: TokensPage = new TokensPage(page);

  const name = 'Mobile';
  await tokensPage.clickTokensTab();
  await tokensPage.setsComp.createSetViaButton(name);
  await tokensPage.setsComp.checkFirstSetName(name);
  await tokensPage.setsComp.duplicateSetByName(name);
  const firstSetName = name + '-copy';
  await tokensPage.setsComp.isSetNameVisible(firstSetName);
  await tokensPage.setsComp.duplicateSetByName(firstSetName);
  const secondSetName = firstSetName + '-copy';
  await tokensPage.setsComp.isSetNameVisible(secondSetName);
  await tokensPage.setsComp.duplicateSetByName(secondSetName);
  const thirdSetName = secondSetName + '-copy';
  await tokensPage.setsComp.isSetNameVisible(thirdSetName);
  await tokensPage.setsComp.duplicateSetByName(thirdSetName);
});
