const { registerTest } = require('../../../fixtures');
const { LoginPage } = require('../../../pages/login-page.js');
const { RegisterPage } = require('../../../pages/register-page.js');
const { ProfilePage } = require('../../../pages/profile-page.js');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page.js');
const { TeamPage } = require('../../../pages/dashboard/team-page.js');
const { MainPage } = require('../../../pages/workspace/main-page.js');
const { ViewModePage } = require('../../../pages/workspace/view-mode-page.js');
const { random } = require('../../../helpers/string-generator.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { expect } = require('@playwright/test');
const {
  waitMessage,
  waitSecondMessage,
  waitRequestMessage,
  checkConfirmAccessText,
  checkDashboardConfirmAccessText,
  checkYourPenpotConfirmAccessText,
  checkYourPenpotViewModeConfirmAccessText,
  checkSigningText,
} = require('../../../helpers/gmail.js');

// Set up Team and File
async function setupTeamAndFile(page, teamName) {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);
  const mainPage = new MainPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.waitForViewportVisible();

  return { loginPage, registerPage, dashboardPage, teamPage, profilePage, mainPage };
}

// Setup ONLY a file (for Your Penpot workspace)
async function setupFileOnly(page) {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const profilePage = new ProfilePage(page);
  const mainPage = new MainPage(page);
  const teamPage = new TeamPage(page);

  await dashboardPage.createFileViaPlaceholder();
  // await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();

  return { loginPage, registerPage, dashboardPage, profilePage, mainPage, teamPage };
}

// Login as specific user helper
async function loginAs({ profilePage, loginPage, dashboardPage }, email) {
  await loginPage.isEmailInputVisible();
  await loginPage.enterEmail(email);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  await dashboardPage.isDashboardOpenedAfterLogin();
}

let viewModePage;
let invite;
let secondRandomName = random() + 'autotest';
let secondEmail = `${process.env.GMAIL_NAME}+${secondRandomName}${process.env.GMAIL_DOMAIN}`;

const team = `${random()}-request-autotest`;

registerTest.beforeEach(
  'Create a new account, login and complete onboarding modal',
  ({ page }) => {
    viewModePage = new ViewModePage(page);
  },
);

registerTest(
  qase(
    1827,
    "Request access from Workspace URL (Not Your Penpot): 'You don't have access to this file'",
  ),
  async ({ page, email }) => {
    // Create a team, a new file and navigate to Dasboard (as owner)
    const setup = await setupTeamAndFile(page, team);
    const { mainPage, teamPage, loginPage, dashboardPage, profilePage } = setup;

    // Get Workspace URL and navigate to Dashboard
    const currentURL = await mainPage.getUrl();
    await mainPage.clickPencilBoxButton();

    // Login as SECOND_EMAIL and navigate to URL
    await profilePage.logout();
    await loginAs(setup, process.env.SECOND_EMAIL);
    await page.goto(currentURL);

    // Request access as SECOND_EMAIL from dialog and return home
    await teamPage.isRequestFileAccessDialogVisible();
    await teamPage.clickOnRequestAccessButton();
    await teamPage.isRequestAccessButtonVisible(false);
    await teamPage.checkRequestSentCorrectlyDialog();
    await teamPage.clickReturnHomeButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await profilePage.logout();

    // Login with owner email and check request access email
    await loginAs(setup, email);

    await waitSecondMessage(page, email, 40);
    const requestMessage = await waitRequestMessage(page, email, 40);

    await checkConfirmAccessText(
      requestMessage.inviteText,
      'QA Engineer',
      process.env.SECOND_EMAIL,
      team,
    );

    // Navigate to invite (view file)
    await page.goto(requestMessage.inviteUrl[1]);

    // Validate Viewer page
    await viewModePage.waitForViewerSection();
    await viewModePage.isShareButtonVisible();
  },
);

registerTest(
  qase(
    1829,
    "Request access from Dashboard URL (Not Your Penpot): You don't have access to this project",
  ),
  async ({ page, email }) => {
    // Create a team, a new file and navigate to Dasboard (as owner)
    const setup = await setupTeamAndFile(page, team);
    const { mainPage, teamPage, dashboardPage, loginPage, profilePage } = setup;

    // Navigate to Dashboard and get Dashboard URL
    await mainPage.clickPencilBoxButton();
    const currentURL = await mainPage.getUrl();

    // Login as SECOND_EMAIL and navigate to Dashboard URL
    await profilePage.logout();
    await loginAs(setup, process.env.SECOND_EMAIL);
    await page.goto(currentURL);

    // Request access as SECOND_EMAIL from dialog and return home
    await teamPage.isRequestAccessProjectDialogVisible();
    await teamPage.clickOnRequestAccessButton();
    await teamPage.isRequestAccessButtonVisible(false);
    await teamPage.checkRequestSentCorrectlyDialog();
    await teamPage.clickReturnHomeButton();
    await profilePage.logout();

    // Login with owner email and check request access email
    await loginAs(setup, email);

    await waitSecondMessage(page, email, 40);
    const requestMessage = await waitRequestMessage(page, email, 40);

    await checkDashboardConfirmAccessText(
      requestMessage.inviteText,
      'QA Engineer',
      process.env.SECOND_EMAIL,
      team,
    );
  },
);

registerTest(
  qase(
    1830,
    "Request access from Workspace (Your Penpot): 'You don't have access to this file'",
  ),
  async ({ page, email }) => {
    // Create a new file in Your Penpot (as owner)
    const setup = await setupFileOnly(page);
    const { mainPage, teamPage, profilePage, dashboardPage } = setup;

    // Get Workspace URL and navigate to Dashboard
    const currentURL = await mainPage.getUrl();
    await mainPage.clickPencilBoxButton();

    // Login as SECOND_EMAIL
    await profilePage.logout();
    await loginAs(setup, process.env.SECOND_EMAIL);

    // Navigate to Workspace URL
    await page.goto(currentURL);

    // Request access as SECOND_EMAIL from dialog and return home
    await teamPage.isRequestFileAccessDialogVisible();
    await teamPage.clickOnRequestAccessButton();
    await teamPage.isRequestAccessButtonVisible(false);
    await teamPage.checkRequestSentCorrectlyDialog();
    await teamPage.clickReturnHomeButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await profilePage.logout();

    // Login with owner email and check request access email
    await loginAs(setup, email);

    await waitSecondMessage(page, email, 40);
    const requestMessage = await waitRequestMessage(page, email, 40);

    await checkYourPenpotConfirmAccessText(
      requestMessage.inviteText,
      'QA Engineer',
      process.env.SECOND_EMAIL,
      team,
    );
  },
);

registerTest(
  qase(
    1831,
    "Request access from View mode (Your Penpot): 'You don't have access to this file'",
  ),
  async ({ page, email }) => {
    // Create a new file in Your Penpot (as owner)
    const setup = await setupFileOnly(page);
    const { mainPage, teamPage, profilePage, dashboardPage } = setup;

    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();

    // Navigate to View Mode
    const viewerPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(viewerPage);

    await viewModePage.waitForViewerSection();

    // Get View Mode URL and navigate to Dashboard
    const currentURL = await viewModePage.getUrl();
    await mainPage.clickPencilBoxButton();
    await profilePage.logout();

    // Login as SECOND_EMAIL
    await loginAs(setup, process.env.SECOND_EMAIL);
    await page.goto(currentURL);

    // Request access as SECOND_EMAIL from dialog and return home
    await teamPage.isRequestFileAccessDialogVisible();
    await teamPage.clickOnRequestAccessButton();
    await teamPage.isRequestAccessButtonVisible(false);
    await teamPage.checkRequestSentCorrectlyDialog();
    await teamPage.clickReturnHomeButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await profilePage.logout();

    // Login with owner email and check request access email
    await loginAs(setup, email);

    await waitSecondMessage(page, email, 40);
    const requestMessage = await waitRequestMessage(page, email, 40);

    await checkYourPenpotViewModeConfirmAccessText(
      requestMessage.inviteText,
      'QA Engineer',
      process.env.SECOND_EMAIL,
      team,
    );
  },
);

registerTest(qase(1833, 'Auto Join to the team'), async ({ page, name, email }) => {
  // Set up team and file
  const setup = await setupTeamAndFile(page, team);
  const { mainPage, teamPage, registerPage, dashboardPage, loginPage, profilePage } =
    setup;

  // Get Workspace URL and go back to Dashboard
  const currentURL = await mainPage.getUrl();
  await mainPage.clickPencilBoxButton();

  // Register a second user (fresh session required)
  await profilePage.logout();
  await loginPage.isEmailInputVisible();
  await page.context().clearCookies();
  await mainPage.reloadPage();
  await loginPage.isLoginPageOpened();
  await loginPage.acceptCookie();
  await loginPage.clickOnCreateAccount();

  await registerPage.registerAccount(
    secondRandomName,
    secondEmail,
    process.env.LOGIN_PWD,
  );
  await registerPage.isRegisterEmailCorrect(secondEmail);

  const invite = await waitMessage(page, secondEmail, 40);
  await page.goto(invite.inviteUrl);

  await dashboardPage.fillOnboardingQuestions();
  await dashboardPage.isDashboardOpenedAfterLogin();

  // Second user requests access to file
  await page.goto(currentURL);

  await teamPage.isRequestFileAccessDialogVisible();
  await teamPage.clickOnRequestAccessButton();
  await teamPage.isRequestAccessButtonVisible(false);
  await teamPage.checkRequestSentCorrectlyDialog();
  await teamPage.clickReturnHomeButton();
  await dashboardPage.isDashboardOpenedAfterLogin();

  // Log out & clean session before OWNER login
  await profilePage.logout();
  await loginPage.isEmailInputVisible();
  await page.context().clearCookies();
  await mainPage.reloadPage();
  await loginPage.isLoginPageOpened();
  await loginPage.acceptCookie();

  // Login back as OWNER
  await loginPage.enterEmail(email);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  await dashboardPage.isDashboardOpenedAfterLogin();

  // Must switch back to the created team
  await teamPage.switchTeam(team);

  // OWNER receives request email & sends invitation
  await waitSecondMessage(page, email, 40);
  const requestMessage = await waitRequestMessage(page, email, 40);

  await page.goto(requestMessage.inviteUrl[0]);
  await teamPage.checkFirstInvitedEmail(secondEmail);
  await teamPage.waitForInvitationButtonEnabled(10000);
  await teamPage.clickSendInvitationButton();

  // SECOND user receives the invitation signing email
  await waitSecondMessage(page, secondEmail, 40);
  const secondRequestMessage = await waitRequestMessage(page, secondEmail, 40);

  await checkSigningText(secondRequestMessage.inviteText, name, team);
});
