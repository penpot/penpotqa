import { qase } from 'playwright-qase-reporter/playwright';
import { test } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { LoginPage } from '@pages/login-page';
import { updateTestResults } from 'helpers/saveTestResults';

let loginPage: LoginPage;

test.beforeEach('Go to login and accept cookie', async ({ page }) => {
  loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.acceptCookie();
});

test(qase(35, 'Login with an email address'), async ({ page }) => {
  await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.isHeaderDisplayed('Projects');
});

test(qase(40, 'Login with invalid email address'), async ({ page }) => {
  await loginPage.enterEmail('test@com');
  await loginPage.isEmailInputErrorDisplayed('Enter a valid email please');
  await loginPage.isLoginButtonDisplayed();
  await loginPage.isLoginButtonDisabled();
});

test(qase(41, 'Login with no password'), async ({ page }) => {
  await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
  await loginPage.clickPwdInput();
  await loginPage.clickHeader();
  await loginPage.isLoginButtonDisplayed();
  await loginPage.isLoginButtonEnabled();
});

test(qase(42, 'Login with incorrect password'), async ({ page }) => {
  await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
  await loginPage.enterPwd('11223344');
  await loginPage.clickLoginButton();
  await loginPage.isLoginErrorMessageDisplayed('Email or password is incorrect.');
});

test(
  qase(
    2639,
    'Attempt to log in with a Custom SSO email using standard Penpot login form',
  ),
  async ({ page }) => {
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
    await loginPage.enterEmail(process.env.SSO_LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.SSO_LOGIN_PWD);
    await loginPage.clickLoginButton();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.isHeaderDisplayed('Projects');
  },
);

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry);
});
