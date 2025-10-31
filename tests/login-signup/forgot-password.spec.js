const { registerTest } = require('../../fixtures');
const { test } = require('@playwright/test');
const { LoginPage } = require('../../pages/login-page');
const { ForgotPasswordPage } = require('../../pages/forgot-password-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { random } = require('../../helpers/string-generator');
const { RegisterPage } = require('../../pages/register-page');
const {
  getRegisterMessage,
  checkRecoveryText,
  waitSecondMessage,
} = require('../../helpers/gmail');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { ProfilePage } = require('../../pages/profile-page');

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
    const email = `${process.env.GMAIL_NAME}autotest+${random()}${process.env.GMAIL_DOMAIN}`;
    await forgotPasswordPage.enterEmail(email);
    await forgotPasswordPage.clickRecoverPasswordButton();
    await forgotPasswordPage.isRecoverPasswordButtonDisabled();
  },
);

registerTest.describe(() => {
  let newPwd;
  let loginPage, registerPage, forgotPasswordPage, profilePage, dashboardPage;
  registerTest.beforeEach(async ({ page, name, email }) => {
    await registerTest.slow();
    newPwd = 'TestForgotPassword123';
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    dashboardPage = new DashboardPage(page);
    profilePage = new ProfilePage(page);
    forgotPasswordPage = new ForgotPasswordPage(page);
    await page.context().clearCookies();

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.clickOnForgotPassword();
    await forgotPasswordPage.enterEmail(email);
    await forgotPasswordPage.clickRecoverPasswordButton();
    await waitSecondMessage(page, email, 60);
    const forgotPass = await getRegisterMessage(email);
    await checkRecoveryText(forgotPass.inviteText, name);
    await page.goto(forgotPass.inviteUrl);
    await forgotPasswordPage.enterNewPwd(newPwd);
    await forgotPasswordPage.enterConfirmPwd(newPwd);
    await forgotPasswordPage.clickOnChangePwdButton();
    await loginPage.isLoginPageOpened();
  });

  registerTest(qase(49, 'ON-22 Forgot password flow'), async ({ email }) => {
    await loginPage.enterEmail(email);
    await loginPage.enterPwd(newPwd);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  });

  registerTest(qase(52, 'ON-25 Login with old password'), async ({ email }) => {
    await loginPage.enterEmail(email);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await loginPage.isLoginErrorMessageDisplayed('Email or password is incorrect.');
  });
});
