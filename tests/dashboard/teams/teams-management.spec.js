const { mainTest, registerTest } = require('../../../fixtures');
const { LoginPage } = require('../../../pages/login-page.js');
const { RegisterPage } = require('../../../pages/register-page.js');
const { ProfilePage } = require('../../../pages/profile-page.js');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page.js');
const { TeamPage } = require('../../../pages/dashboard/team-page.js');
const { MainPage } = require('../../../pages/workspace/main-page.js');
const { ViewModePage } = require('../../../pages/workspace/view-mode-page.js');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page.js');
const { random } = require('../../../helpers/string-generator.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { expect } = require('@playwright/test');
const {
  getRegisterMessage,
  checkInviteText,
  checkMessagesCount,
  waitMessage,
  waitSecondMessage,
  waitRequestMessage,
  checkConfirmAccessText,
  checkDashboardConfirmAccessText,
  checkYourPenpotConfirmAccessText,
  checkYourPenpotViewModeConfirmAccessText,
  checkSigningText,
} = require('../../../helpers/gmail.js');

// TO REMOVE
mainTest.skip(true, 'Temporarily disabled due to unrelated to new render');

const maxDiffPixelRatio = 0.001;

let teamPage,
  loginPage,
  registerPage,
  dashboardPage,
  layersPanelPage,
  profilePage,
  mainPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
  layersPanelPage = new LayersPanelPage(page);
  profilePage = new ProfilePage(page);
  mainPage = new MainPage(page);
});

mainTest(qase(1162, 'Create a team'), async () => {
  const team = random().concat('autotest');
  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.deleteTeam(team);
});

mainTest(qase(1163, 'Team.Switch between teams'), async () => {
  const team1 = random().concat('autotest QA Test team 1');
  const team2 = random().concat('autotest QA Test team 2');

  await teamPage.createTeam(team1);
  await teamPage.isTeamSelected(team1);
  await teamPage.createTeam(team2);
  await teamPage.isTeamSelected(team2);
  await teamPage.switchTeam(team1);
  await teamPage.switchTeam(team2);
  await teamPage.deleteTeams([team1, team2]);
});
