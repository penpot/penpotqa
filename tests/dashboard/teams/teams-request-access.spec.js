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

const maxDiffPixelRatio = 0.001;

// Setup team and file
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
  await mainPage.isMainPageLoaded();

  return { loginPage, registerPage, dashboardPage, teamPage, profilePage, mainPage };
}

// Login helper
async function loginAs({ profilePage, loginPage, dashboardPage }, email) {
  await profilePage.logout();
  await loginPage.isEmailInputVisible();
  await loginPage.isLoginPageOpened();
  await loginPage.enterEmail(email);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  await dashboardPage.isDashboardOpenedAfterLogin();
}

// Request access helper
async function requestAccessFlow(
  page,
  currentURL,
  { teamPage, dashboardPage },
  viewModePage = null,
  screenshotName,
  maxDiff,
) {
  await page.goto(currentURL);

  if (viewModePage) {
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.isShareButtonVisible();
  } else {
    await expect(teamPage.accessDialog).toHaveScreenshot(screenshotName, {
      maxDiffPixelRatio: maxDiff || maxDiffPixelRatio,
    });
    await teamPage.clickOnRequestAccessButton();
    await teamPage.isRequestAccessButtonVisible(false);
    await teamPage.checkRequestSentCorrectlyDialog();
    await teamPage.clickReturnHomeButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  }
}

registerTest.describe(
  'User Permissions - Request Access (previous register) - View Mode',
  () => {
    let team;
    let viewModePage;
    let secondRandomName;
    let secondEmail;
    let invite;

    registerTest.beforeEach(async ({ page }) => {
      await registerTest.slow();
      viewModePage = new ViewModePage(page);
      team = random().concat('autotest');
      secondRandomName = random().concat('autotest');
      secondEmail = `${process.env.GMAIL_NAME}+${secondRandomName}${process.env.GMAIL_DOMAIN}`;
    });

    registerTest(
      qase(1827, 'Request access from Workspace (Not Your Penpot)'),
      async ({ page, email }) => {
        const pages = await setupTeamAndFile(page, team);
        const currentURL = await pages.mainPage.getUrl();
        await pages.mainPage.clickPencilBoxButton();

        await loginAs(pages, process.env.SECOND_EMAIL);
        await requestAccessFlow(
          page,
          currentURL,
          pages,
          null,
          'request-file-access-dialog-image.png',
        );

        await loginAs(pages, email);
        await waitSecondMessage(page, email, 40);
        const requestMessage = await waitRequestMessage(page, email, 40);
        await checkConfirmAccessText(
          requestMessage.inviteText,
          'QA Engineer',
          process.env.SECOND_EMAIL,
          team,
        );

        await page.goto(requestMessage.inviteUrl[1]);
        await viewModePage.waitForViewerSection(45000);
        await viewModePage.isShareButtonVisible();
      },
    );

    registerTest(
      qase(1829, 'Request access from Dashboard (Not Your Penpot)'),
      async ({ page, email }) => {
        const pages = await setupTeamAndFile(page, team);
        const currentURL = await pages.mainPage.getUrl();
        await pages.mainPage.clickPencilBoxButton();

        await loginAs(pages, process.env.SECOND_EMAIL);
        await requestAccessFlow(
          page,
          currentURL,
          pages,
          null,
          'request-project-access-dialog-image.png',
          maxDiffPixelRatio,
        );

        await loginAs(pages, email);
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
      qase(1830, 'Request access from Workspace (Your Penpot)'),
      async ({ page, email }) => {
        const pages = await setupTeamAndFile(page, team);
        const currentURL = await pages.mainPage.getUrl();
        await pages.mainPage.clickPencilBoxButton();

        await loginAs(pages, process.env.SECOND_EMAIL);
        await requestAccessFlow(page, currentURL, pages);

        await loginAs(pages, email);
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
      qase(1831, 'Request access from View mode (Your Penpot)'),
      async ({ page, email }) => {
        const pages = await setupTeamAndFile(page, team);
        await pages.mainPage.createDefaultBoardByCoordinates(300, 300);
        await pages.mainPage.waitForChangeIsSaved();
        const newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
        const currentURL = await viewModePage.getUrl();
        await pages.mainPage.clickPencilBoxButton();

        await loginAs(pages, process.env.SECOND_EMAIL);
        await requestAccessFlow(page, currentURL, pages);

        await loginAs(pages, email);
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

    registerTest(
      qase(1833, 'Auto Join to the team'),
      async ({ page, name, email }) => {
        const pages = await setupTeamAndFile(page, team);
        const currentURL = await pages.mainPage.getUrl();
        await pages.mainPage.clickPencilBoxButton();

        // Register second user
        await pages.profilePage.logout();
        await page.context().clearCookies();
        await pages.mainPage.reloadPage();
        await pages.loginPage.isLoginPageOpened();
        await pages.loginPage.acceptCookie();
        await pages.loginPage.clickOnCreateAccount();
        await pages.registerPage.registerAccount(
          secondRandomName,
          secondEmail,
          process.env.LOGIN_PWD,
        );
        await pages.registerPage.isRegisterEmailCorrect(secondEmail);
        invite = await waitMessage(page, secondEmail, 40);
        await page.goto(invite.inviteUrl);
        await pages.dashboardPage.fillOnboardingQuestions();
        await pages.dashboardPage.isDashboardOpenedAfterLogin();

        // Request access
        await page.goto(currentURL);
        await pages.teamPage.checkRequestFileAccessDialog();
        await pages.teamPage.clickOnRequestAccessButton();
        await pages.teamPage.isRequestAccessButtonVisible(false);
        await pages.teamPage.checkRequestSentCorrectlyDialog();
        await pages.teamPage.clickReturnHomeButton();
        await pages.dashboardPage.isDashboardOpenedAfterLogin();

        // Login as primary user to confirm
        await loginAs(pages, email);
        await pages.teamPage.switchTeam(team);
        await waitSecondMessage(page, email, 40);
        const requestMessage = await waitRequestMessage(page, email, 40);
        await page.goto(requestMessage.inviteUrl[0]);
        await pages.teamPage.checkFirstInvitedEmail(secondEmail);
        await pages.teamPage.waitForInvitationButtonEnabled(10000);
        await pages.teamPage.clickSendInvitationButton();

        await waitSecondMessage(page, secondEmail, 40);
        const secondRequestMessage = await waitRequestMessage(page, secondEmail, 40);
        await checkSigningText(secondRequestMessage.inviteText, name, team);
      },
    );
  },
);
