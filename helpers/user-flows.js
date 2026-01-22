const { LoginPage } = require('../pages/login-page.js');
const { DashboardPage } = require('../pages/dashboard/dashboard-page.js');
const { RegisterPage } = require('../pages/register-page.js');
const { ProfilePage } = require('../pages/profile-page.js');
const { TeamPage } = require('../pages/dashboard/team-page.js');
const { MainPage } = require('../pages/workspace/main-page.js');
const { waitMessage } = require('./gmail.js');
const { random } = require('./string-generator.js');

function createTestUserData() {
  const teamName = `${random()}-autotest`;
  const userName = `${random()}-autotest`;
  const userEmail = `${process.env.GMAIL_NAME}+${userName}${process.env.GMAIL_DOMAIN}`;

  return { teamName, userName, userEmail };
}

function initPages(page) {
  return {
    loginPage: new LoginPage(page),
    registerPage: new RegisterPage(page),
    dashboardPage: new DashboardPage(page),
    teamPage: new TeamPage(page),
    profilePage: new ProfilePage(page),
    mainPage: new MainPage(page),
  };
}

// Login as SECOND_USER (.env variable)
async function loginAsSecondUser(page) {
  const { loginPage, dashboardPage } = initPages(page);

  await loginPage.isEmailInputVisible();
  await loginPage.isLoginPageOpened();
  await loginPage.enterEmailAndClickOnContinue(process.env.SECOND_EMAIL);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  await dashboardPage.isDashboardOpenedAfterLogin();
}

/**
 * Generic user setup with role
 */
async function setupUserWithRole(
  page,
  { role = 'Editor', assertInviteHeader = false } = {},
) {
  const { teamName, userName, userEmail } = createTestUserData();
  const pages = initPages(page);
  const { teamPage, profilePage, registerPage, dashboardPage } = pages;

  // Create team
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);

  // Invite user
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();

  if (assertInviteHeader) {
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  }

  await teamPage.enterEmailToInviteMembersPopUp(userEmail);

  if (role !== 'Editor') {
    await teamPage.selectInvitationRoleInPopUp(role);
  }

  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

  // Register invited user
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
    ...pages,
  };
}

// Role-specific helpers (thin wrappers)
const setupViewerRoleUser = (page) => setupUserWithRole(page, { role: 'Viewer' });

const setupEditorRoleUser = (page) =>
  setupUserWithRole(page, { role: 'Editor', assertInviteHeader: true });

const setupAdminRoleUser = (page) => setupUserWithRole(page, { role: 'Admin' });

module.exports = {
  loginAsSecondUser,
  setupViewerRoleUser,
  setupEditorRoleUser,
  setupAdminRoleUser,
};
