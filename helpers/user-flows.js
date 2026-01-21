const { LoginPage } = require('../pages/login-page.js');
const { DashboardPage } = require('../pages/dashboard/dashboard-page.js');
const { RegisterPage } = require('../pages/register-page.js');
const { ProfilePage } = require('../pages/profile-page.js');
const { TeamPage } = require('../pages/dashboard/team-page.js');
const { MainPage } = require('..//pages/workspace/main-page.js');
const { waitMessage } = require('./gmail.js');
const { random } = require('./string-generator.js');

// Login as SECOND_USER (.env variable)
async function loginAsSecondUser(page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.isEmailInputVisible();
  await loginPage.isLoginPageOpened();
  await loginPage.enterEmailAndClickOnContinue(process.env.SECOND_EMAIL);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  await dashboardPage.isDashboardOpenedAfterLogin();
}

// Set up user with Viewer role
async function setupViewerRoleUser(page, role = 'Viewer') {
  const teamName = `${random()}-autotest`;
  const userName = `${random()}-autotest`;
  const userEmail = `${process.env.GMAIL_NAME}+${userName}${process.env.GMAIL_DOMAIN}`;

  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);
  const mainPage = new MainPage(page);

  // Create team
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);

  // Invite user
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.enterEmailToInviteMembersPopUp(userEmail);
  await teamPage.selectInvitationRoleInPopUp(role);
  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

  // Register user
  await profilePage.logout();
  const invite = await waitMessage(page, userEmail, 40);
  await page.goto(invite.inviteUrl);
  await registerPage.registerAccount(userName, userEmail, process.env.LOGIN_PWD);
  await dashboardPage.fillOnboardingQuestions();
  await teamPage.isTeamSelected(teamName);

  return {
    teamName,
    userName,
    userEmail,
    loginPage,
    registerPage,
    dashboardPage,
    teamPage,
    profilePage,
    mainPage,
  };
}

// Set up user with Editor role (default)
async function setupEditorRoleUser(page) {
  const teamName = `${random()}-autotest`;
  const userName = `${random()}-autotest`;
  const userEmail = `${process.env.GMAIL_NAME}+${userName}${process.env.GMAIL_DOMAIN}`;

  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);
  const mainPage = new MainPage(page);

  // Create team & file
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);

  // Invite user
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  await teamPage.enterEmailToInviteMembersPopUp(userEmail);
  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

  // Register user
  await profilePage.logout();
  const invite = await waitMessage(page, userEmail, 40);
  await page.goto(invite.inviteUrl);
  await registerPage.registerAccount(userName, userEmail, process.env.LOGIN_PWD);
  await dashboardPage.fillOnboardingQuestions();
  await teamPage.isTeamSelected(teamName);

  return {
    teamName,
    userName,
    userEmail,
    loginPage,
    registerPage,
    dashboardPage,
    teamPage,
    profilePage,
    mainPage,
  };
}

// Set up user with Admin role
async function setupAdminRoleUser(page, role = 'Admin') {
  const teamName = `${random()}-autotest`;
  const userName = `${random()}-autotest`;
  const userEmail = `${process.env.GMAIL_NAME}+${userName}${process.env.GMAIL_DOMAIN}`;

  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);
  const mainPage = new MainPage(page);

  // Create team
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);

  // Invite user
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.enterEmailToInviteMembersPopUp(userEmail);
  await teamPage.selectInvitationRoleInPopUp(role);
  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

  // Register user
  await profilePage.logout();
  const invite = await waitMessage(page, userEmail, 40);
  await page.goto(invite.inviteUrl);
  await registerPage.registerAccount(userName, userEmail, process.env.LOGIN_PWD);
  await dashboardPage.fillOnboardingQuestions();
  await teamPage.isTeamSelected(teamName);

  return {
    teamName,
    userName,
    userEmail,
    loginPage,
    registerPage,
    dashboardPage,
    teamPage,
    profilePage,
    mainPage,
  };
}

module.exports = {
  loginAsSecondUser,
  setupViewerRoleUser,
  setupEditorRoleUser,
  setupAdminRoleUser,
};
