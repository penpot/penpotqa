const { mainTest } = require('../../../fixtures');
const { LoginPage } = require('../../../pages/login-page.js');
const { RegisterPage } = require('../../../pages/register-page.js');
const { ProfilePage } = require('../../../pages/profile-page.js');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page.js');
const { TeamPage } = require('../../../pages/dashboard/team-page.js');
const { MainPage } = require('../../../pages/workspace/main-page.js');
const { random } = require('../../../helpers/string-generator.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { expect } = require('@playwright/test');

const maxDiffPixelRatio = 0.001;

let teamPage, loginPage, registerPage, dashboardPage, profilePage, mainPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  mainPage = new MainPage(page);
});

mainTest(qase(1200, 'Team Settings - upload team profile picture'), async () => {
  const team = random().concat('autotest');

  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openTeamSettingsPageViaOptionsMenu();
  await teamPage.uploadTeamImage('images/images.png');
  await teamPage.waitInfoMessageHidden();
  await teamPage.hoverOnTeamName();
  await expect(teamPage.teamInfoSection).toHaveScreenshot('team-profile-image.png', {
    maxDiffPixelRatio: maxDiffPixelRatio,
    mask: [teamPage.teamNameLabel],
  });
  await teamPage.deleteTeam(team);
});

mainTest(qase(1202, "Team. Settings - check 'Team members' info"), async () => {
  const team = random().concat('autotest');

  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.changeProfileName('QA Engineer');
  await profilePage.uploadProfileImage('images/sample.jpeg');
  await profilePage.waitInfoMessageHidden();
  await profilePage.backToDashboardFromAccount();
  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openTeamSettingsPageViaOptionsMenu();

  const teamOwner = 'QA Engineer (Owner)';
  await teamPage.isTeamOwnerInfoDisplayed(teamOwner);
  await teamPage.isTeamMembersInfoDisplayed('1 members');
  await expect(teamPage.teamOwnerSection).toHaveScreenshot('team-owner-block.png', {
    maxDiffPixelRatio: maxDiffPixelRatio,
  });
  await teamPage.deleteTeam(team);
});

mainTest(qase(1203, "Team. Settings - check 'Team projects' info"), async () => {
  const team = random().concat('autotest');
  const projectFirst = 'QA Project 1';
  const projectSecond = 'QA Project 2';

  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await dashboardPage.createProject(projectFirst);
  await dashboardPage.pinProjectByName(projectFirst);
  await dashboardPage.createProject(projectSecond);
  await dashboardPage.pinProjectByName(projectSecond);
  await dashboardPage.openSidebarItem('Drafts');
  await dashboardPage.createFileViaProjectPlaceholder();
  await mainPage.backToDashboardFromFileEditor();
  await dashboardPage.openPinnedProjectFromSidebar(projectFirst);
  await dashboardPage.createFileViaProjectPlaceholder();
  await mainPage.backToDashboardFromFileEditor();
  await dashboardPage.openPinnedProjectFromSidebar(projectSecond);
  await dashboardPage.createFileViaProjectPlaceholder();
  await mainPage.backToDashboardFromFileEditor();

  await teamPage.openTeamSettingsPageViaOptionsMenu();
  await teamPage.isTeamProjectsInfoDisplayed('2 projects');
  await teamPage.isTeamFilesInfoDisplayed('3 files');
  await expect(teamPage.teamStatsSection).toHaveScreenshot('team-stats-block.png', {
    maxDiffPixelRatio: maxDiffPixelRatio,
  });
  await teamPage.deleteTeam(team);
});

mainTest(qase(1208, 'Delete a team via owner'), async () => {
  const team = random().concat('autotest');

  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.deleteTeam(team);
  await teamPage.isTeamDeleted(team);
  await teamPage.deleteTeam(team);
});
