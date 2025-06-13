const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { ForgotPasswordPage } = require('../pages/forgot-password-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { random } = require('../helpers/string-generator');
const { RegisterPage } = require('../pages/register-page');
const {
  getRegisterMessage,
  checkRecoveryText,
  waitMessage,
  waitSecondMessage,
} = require('../helpers/gmail');
const { DashboardPage } = require('../pages/dashboard/dashboard-page');
const { ProfilePage } = require('../pages/profile-page');

test(qase(50, 'ON-23 Forgot password flow with invalid email'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const forgotPasswordPage = new ForgotPasswordPage(page);
  await loginPage.goto();
  await loginPage.clickOnForgotPassword();
  await forgotPasswordPage.enterEmail('xxx');
  await forgotPasswordPage.isRecoverPasswordButtonDisabled();
});

test(
  qase(51, 'ON-24 Forgot password flow with inexisted email'),
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await loginPage.goto();
    await loginPage.clickOnForgotPassword();
    const email = `${process.env.GMAIL_NAME}autotest+${random()}@gmail.com`;
    await forgotPasswordPage.enterEmail(email);
    await forgotPasswordPage.clickRecoverPasswordButton();
    await forgotPasswordPage.isRecoverPasswordButtonDisabled();
  },
);

test.describe(() => {
  let randomName, email, invite;
  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 30000);
    randomName = random().concat('autotest');
    email = `${process.env.GMAIL_NAME}+${randomName}@gmail.com`;
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    await page.context().clearCookies();

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(randomName, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
    invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
  });

  test(qase(49, 'ON-22 Forgot password flow'), async ({ page }) => {
    const newPwd = 'TestForgotPassword123';
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.clickOnForgotPassword();
    await forgotPasswordPage.enterEmail(email);
    await forgotPasswordPage.clickRecoverPasswordButton();
    await waitSecondMessage(page, email, 40);
    const forgotPass = await getRegisterMessage(email);
    await checkRecoveryText(forgotPass.inviteText, randomName);
    await page.goto(forgotPass.inviteUrl);
    await forgotPasswordPage.enterNewPwd(newPwd);
    await forgotPasswordPage.enterConfirmPwd(newPwd);
    await forgotPasswordPage.clickOnChangePwdButton();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(email);
    await loginPage.enterPwd(newPwd);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  });

  test(qase(52, 'ON-25 Login with old password'), async ({ page }) => {
    const newPwd = 'TestForgotPassword123';
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.clickOnForgotPassword();
    await forgotPasswordPage.enterEmail(email);
    await forgotPasswordPage.clickRecoverPasswordButton();
    await waitSecondMessage(page, email, 40);
    const forgotPass = await getRegisterMessage(email);
    await checkRecoveryText(forgotPass.inviteText, randomName);
    await page.goto(forgotPass.inviteUrl);
    await forgotPasswordPage.enterNewPwd(newPwd);
    await forgotPasswordPage.enterConfirmPwd(newPwd);
    await forgotPasswordPage.clickOnChangePwdButton();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(email);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await loginPage.isLoginErrorMessageDisplayed('Email or password is incorrect.');
  });
});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry);
});
