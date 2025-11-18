const { mainTest } = require('../../../fixtures');
const { LoginPage } = require('../../../pages/login-page.js');
const { RegisterPage } = require('../../../pages/register-page.js');
const { ProfilePage } = require('../../../pages/profile-page.js');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page.js');
const { TeamPage } = require('../../../pages/dashboard/team-page.js');
const { MainPage } = require('../../../pages/workspace/main-page.js');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page.js');
const { random } = require('../../../helpers/string-generator.js');
const { waitMessage } = require('../../../helpers/gmail.js');
const { qase } = require('playwright-qase-reporter/playwright');

// Helper: create a team, invite user, register via Gmail invite
async function setupInvitedUser(page, role = 'Editor') {
  const teamName = `${random()}-leave-team-autotest`;
  const userName = `${random()}-leave-team-autotest`;
  const userEmail = `${process.env.GMAIL_NAME}+${userName}${process.env.GMAIL_DOMAIN}`;

  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);

  // Create team
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);

  // Send invite
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  await teamPage.enterEmailToInviteMembersPopUp(userEmail);

  if (role !== 'Editor') {
    await teamPage.selectInvitationRoleInPopUp(role);
  }

  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

  // Logout before switching to invited user
  await profilePage.logout();

  // Retrieve invite email
  const invite = await waitMessage(page, userEmail, 40);

  // Register invited user
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
    layersPanelPage,
  };
}

let setup;

mainTest.beforeEach(
  'Set up invited user through Gmail flow',
  async ({ page }, testInfo) => {
    const role = testInfo.title.includes('(as admin)') ? 'Admin' : 'Editor';
    setup = await setupInvitedUser(page, role);
  },
);

mainTest(
  qase(1197, 'Team Members: Admin can leave team and return to onboarding'),
  async () => {
    const { teamPage, dashboardPage, teamName } = setup;

    await mainTest.step('Admin leaves the team', async () => {
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.leaveTeam(teamName);
    });

    await mainTest.step('Confirm onboarding flow', async () => {
      await dashboardPage.clickOnOnboardingContinueWithoutTeamButton();
    });
  },
);

mainTest(
  qase(1198, 'Team Members: Editor can leave team and return to onboarding'),
  async () => {
    const { teamPage, dashboardPage, teamName } = setup;

    await mainTest.step('Editor leaves the team', async () => {
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.leaveTeam(teamName);
    });

    await mainTest.step('Confirm onboarding flow', async () => {
      await dashboardPage.clickOnOnboardingContinueWithoutTeamButton();
    });
  },
);
