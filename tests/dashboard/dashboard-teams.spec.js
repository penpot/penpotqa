const { mainTest } = require('../../fixtures');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { expect, test } = require('@playwright/test');
const { ProfilePage } = require('../../pages/profile-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
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
} = require('../../helpers/gmail');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { ViewModePage } = require('../../pages/workspace/view-mode-page');

test.describe(() => {
  const team = random().concat('autotest');
  let loginPage,
    registerPage,
    profilePage,
    dashboardPage,
    teamPage,
    mainPage,
    viewModePage;
  let invite;
  let randomName = random().concat('autotest');
  let secondRandomName = random().concat('autotest');
  let email = `${process.env.GMAIL_NAME}+${randomName}@gmail.com`;
  let secondEmail = `${process.env.GMAIL_NAME}+${secondRandomName}@gmail.com`;

  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 30000);
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    profilePage = new ProfilePage(page);
    dashboardPage = new DashboardPage(page);
    teamPage = new TeamPage(page);
    mainPage = new MainPage(page);
    viewModePage = new ViewModePage(page);
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(email);
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.clickOnCreateAccountBtn();

    await registerPage.enterFullName(randomName);
    await registerPage.clickOnAcceptTermsCheckbox();
    await registerPage.clickOnCreateAccountSecondBtn();
    await registerPage.isRegisterEmailCorrect(email);
    invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
  });

  test(
    qase(1827, 'Request access from Workspace (Not Your Penpot)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);

      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.waitForViewportVisible();
      await mainPage.isMainPageLoaded();
      const currentURL = await mainPage.getUrl();
      await mainPage.clickPencilBoxButton();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.goto();
      await loginPage.enterEmail(process.env.SECOND_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      await page.goto(currentURL);
      await expect(teamPage.accessDialog).toHaveScreenshot(
        'request-file-access-dialog-image.png',
      );
      await teamPage.clickOnRequestAccessButton();
      await teamPage.isRequestAccessButtonVisible(false);
      await expect(teamPage.accessDialog).toHaveScreenshot(
        'request-sent-dialog-image.png',
      );
      await teamPage.clickReturnHomeButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.goto();
      await loginPage.enterEmail(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      const requestMessage = await waitRequestMessage(page, email, 40);
      await checkConfirmAccessText(
        requestMessage.inviteText,
        '9z0700h',
        process.env.SECOND_EMAIL,
        team,
      );

      await page.goto(requestMessage.inviteUrl[1]);

      await viewModePage.waitForViewerSection(45000);
      await viewModePage.isShareButtonVisible();
    },
  );

  test(
    qase(1829, 'Request access from Dashboard (Not Your Penpot)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);

      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.waitForViewportVisible();
      await mainPage.isMainPageLoaded();
      await mainPage.clickPencilBoxButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      const currentURL = await mainPage.getUrl();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.goto();
      await loginPage.enterEmail(process.env.SECOND_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      await page.goto(currentURL);
      await expect(teamPage.accessDialog).toHaveScreenshot(
        'request-project-access-dialog-image.png',
      );
      await teamPage.clickOnRequestAccessButton();
      await teamPage.isRequestAccessButtonVisible(false);
      await expect(teamPage.accessDialog).toHaveScreenshot(
        'request-sent-dialog-image.png',
      );
      await teamPage.clickReturnHomeButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.goto();
      await loginPage.enterEmail(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      const requestMessage = await waitRequestMessage(page, email, 40);

      await checkDashboardConfirmAccessText(
        requestMessage.inviteText,
        '9z0700h',
        process.env.SECOND_EMAIL,
        team,
      );
    },
  );

  test(
    qase(1830, 'Request access from Workspace (Your Penpot)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);

      await dashboardPage.createFileViaPlaceholder();
      await mainPage.waitForViewportVisible();
      await mainPage.isMainPageLoaded();
      const currentURL = await mainPage.getUrl();
      await mainPage.clickPencilBoxButton();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.goto();
      await loginPage.enterEmail(process.env.SECOND_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      await page.goto(currentURL);
      await expect(teamPage.accessDialog).toHaveScreenshot(
        'request-file-access-dialog-image.png',
      );
      await teamPage.clickOnRequestAccessButton();
      await teamPage.isRequestAccessButtonVisible(false);
      await expect(teamPage.accessDialog).toHaveScreenshot(
        'request-sent-dialog-image.png',
      );
      await teamPage.clickReturnHomeButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.goto();
      await loginPage.enterEmail(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      const requestMessage = await waitRequestMessage(page, email, 40);
      await checkYourPenpotConfirmAccessText(
        requestMessage.inviteText,
        '9z0700h',
        process.env.SECOND_EMAIL,
        team,
      );
    },
  );

  test(
    qase(1831, 'Request access from View mode (Your Penpot)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);

      await dashboardPage.createFileViaPlaceholder();
      await mainPage.waitForViewportVisible();
      await mainPage.isMainPageLoaded();
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      const currentURL = await viewModePage.getUrl();
      await mainPage.clickPencilBoxButton();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.goto();
      await loginPage.enterEmail(process.env.SECOND_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      await page.goto(currentURL);
      await expect(teamPage.accessDialog).toHaveScreenshot(
        'request-file-access-dialog-image.png',
      );
      await teamPage.clickOnRequestAccessButton();
      await teamPage.isRequestAccessButtonVisible(false);
      await expect(teamPage.accessDialog).toHaveScreenshot(
        'request-sent-dialog-image.png',
      );
      await teamPage.clickReturnHomeButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.goto();
      await loginPage.enterEmail(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      const requestMessage = await waitRequestMessage(page, email, 40);
      await checkYourPenpotViewModeConfirmAccessText(
        requestMessage.inviteText,
        '9z0700h',
        process.env.SECOND_EMAIL,
        team,
      );
    },
  );

  test(qase(1833, 'Auto Join to the team'), async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 60000);

    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.waitForViewportVisible();
    await mainPage.isMainPageLoaded();
    const currentURL = await mainPage.getUrl();
    await mainPage.clickPencilBoxButton();

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(secondEmail);
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.clickOnCreateAccountBtn();

    await registerPage.enterFullName(secondRandomName);
    await registerPage.clickOnAcceptTermsCheckbox();
    await registerPage.clickOnCreateAccountSecondBtn();
    await registerPage.isRegisterEmailCorrect(secondEmail);
    invite = await waitMessage(page, secondEmail, 40);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await dashboardPage.isDashboardOpenedAfterLogin();

    await page.goto(currentURL);
    await expect(teamPage.accessDialog).toHaveScreenshot(
      'request-file-access-dialog-image.png',
    );
    await teamPage.clickOnRequestAccessButton();
    await teamPage.isRequestAccessButtonVisible(false);
    await expect(teamPage.accessDialog).toHaveScreenshot(
      'request-sent-dialog-image.png',
    );
    await teamPage.clickReturnHomeButton();
    await dashboardPage.isDashboardOpenedAfterLogin();

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.goto();
    await loginPage.enterEmail(email);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();

    const requestMessage = await waitRequestMessage(page, email, 40);
    await page.goto(requestMessage.inviteUrl[0]);
    await teamPage.clickSendInvitationButton();

    await waitSecondMessage(page, secondEmail, 40);
    const secondRequestMessage = await waitRequestMessage(page, secondEmail, 40);
    await checkSigningText(secondRequestMessage.inviteText, randomName, team);
  });
});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry);
});
