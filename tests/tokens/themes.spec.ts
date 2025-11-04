import { mainTest } from '../../fixtures';
import { MainPage } from '../../pages/workspace/main-page';
import { random } from '../../helpers/string-generator';
import { TeamPage } from '../../pages/dashboard/team-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { DesignPanelPage } from '../../pages/workspace/design-panel-page';
import { TokensPage } from '../../pages/workspace/tokens/tokens-page';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page }) => {
  const teamPage: TeamPage = new TeamPage(page);
  const dashboardPage: DashboardPage = new DashboardPage(page);
  const mainPage: MainPage = new MainPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async ({ page }) => {
  let mainPage = new MainPage(page);
  let teamPage = new TeamPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase(2167, 'Create theme via "create one" link'), async ({ page }) => {
  const tokensPage: TokensPage = new TokensPage(page);
  await tokensPage.clickTokensTab();
  await tokensPage.themesComp.createThemeViaLink('Desktop');
  await tokensPage.themesComp.checkSelectedTheme('No theme active');
});

mainTest.describe('Themes tests', () => {
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let mainPage: MainPage;

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultRectangleByCoordinates(200, 200);

    await tokensPage.clickTokensTab();
    await tokensPage.setsComp.createSetViaButton('Mode/Dark');
    await tokensPage.setsComp.isSetNameVisible('Dark');
    await tokensPage.setsComp.isGroupSetNameVisible('Mode');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Dark');
    await tokensPage.setsComp.isSetCheckedByName('Dark');
    await tokensPage.tokensComp.createColorToken('red', '#ef0c0c');
    await tokensPage.tokensComp.clickOnTokenWithName('red');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSetComponent('ef0c0c');

    await tokensPage.setsComp.createSetViaButton('Mode/Light');
    await tokensPage.setsComp.isSetNameVisible('Light');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Light');
    await tokensPage.setsComp.isSetCheckedByName('Light');
    await tokensPage.tokensComp.createColorToken('red', '#ec9090');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSetComponent('ec9090');

    await tokensPage.setsComp.createSetViaButton('Device/Desktop');
    await tokensPage.setsComp.isSetNameVisible('Desktop');
    await tokensPage.setsComp.isGroupSetNameVisible('Device');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Desktop');
    await tokensPage.setsComp.isSetCheckedByName('Desktop');
    await tokensPage.tokensComp.createRadiusToken('border-radius', '50');
    await tokensPage.tokensComp.clickOnTokenWithName('border-radius');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkGeneralCornerRadius('50');

    await tokensPage.setsComp.createSetViaButton('Device/Mobile');
    await tokensPage.setsComp.isSetNameVisible('Mobile');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Mobile');
    await tokensPage.setsComp.isSetCheckedByName('Mobile');
    await tokensPage.tokensComp.createRadiusToken('border-radius', '30');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkGeneralCornerRadius('30');
  });

  mainTest(qase(2206, 'Enable themes in different groups'), async () => {
    await tokensPage.themesComp.createThemeViaLinkWithGroup('App', 'Web');
    await tokensPage.themesComp.addNewThemeWithGroup('App', 'Mobile');

    await tokensPage.themesComp.openEditThemeModalByThemeName('Web');
    await tokensPage.themesComp.activateSetInTheme('Dark');
    await tokensPage.themesComp.activateSetInTheme('Light');
    await tokensPage.themesComp.activateSetInTheme('Desktop');
    await tokensPage.themesComp.saveTheme();
    await tokensPage.setsComp.checkActiveSetsCountByThemeName('Web', '3');

    await tokensPage.themesComp.openEditThemeModalByThemeName('Mobile');
    await tokensPage.themesComp.activateSetInTheme('Light');
    await tokensPage.themesComp.activateSetInTheme('Mobile');
    await tokensPage.themesComp.saveTheme();
    await tokensPage.setsComp.checkActiveSetsCountByThemeName('Mobile', '2');

    await tokensPage.themesComp.addNewTheme('Brand X');
    await tokensPage.themesComp.openEditThemeModalByThemeName('Brand X');
    await tokensPage.themesComp.activateSetInTheme('Light');
    await tokensPage.themesComp.activateSetInTheme('Dark');
    await tokensPage.themesComp.activateSetInTheme('Desktop');
    await tokensPage.themesComp.activateSetInTheme('Mobile');
    await tokensPage.themesComp.saveTheme();
    await tokensPage.setsComp.checkActiveSetsCountByThemeName('Brand X', '4');
    await mainPage.closeModalWindow();
    await tokensPage.themesComp.checkSelectedTheme('No theme active');

    await tokensPage.themesComp.selectTheme('Web');
    await tokensPage.themesComp.checkSelectedTheme('App / Web');
    await tokensPage.setsComp.isSetCheckedByName('Dark');
    await tokensPage.setsComp.isSetCheckedByName('Light');
    await tokensPage.setsComp.isSetCheckedByName('Desktop');

    await tokensPage.themesComp.selectTheme('Mobile');
    await tokensPage.themesComp.checkSelectedTheme('App / Mobile');
    await tokensPage.setsComp.isSetCheckedByName('Light');
    await tokensPage.setsComp.isSetCheckedByName('Mobile');

    await tokensPage.themesComp.selectTheme('Brand X');
    await tokensPage.themesComp.checkSelectedTheme('2 active themes');
    await tokensPage.setsComp.isSetCheckedByName('Dark');
    await tokensPage.setsComp.isSetCheckedByName('Light');
    await tokensPage.setsComp.isSetCheckedByName('Mobile');
    await tokensPage.setsComp.isSetCheckedByName('Desktop');
  });

  mainTest(qase(2236, 'Create theme with immediately set selection'), async () => {
    await tokensPage.clickTokensTab();
    await tokensPage.themesComp.createThemeViaLinkWithSet('Test', 'Dark');
    await tokensPage.themesComp.checkSelectedTheme('No theme active');
    await tokensPage.themesComp.selectTheme('Test');
    await tokensPage.themesComp.checkSelectedTheme('Test');
    await tokensPage.setsComp.isSetCheckedByName('Dark');
  });
});
