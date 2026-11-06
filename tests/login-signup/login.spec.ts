import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { LoginPage } from '@pages/login-page';
import { demoCredentialsTest } from './login-signup-fixtures';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;

demoCredentialsTest.beforeEach('Go to login and accept cookie', async ({ page }) => {
  loginPage = new LoginPage(page);
  dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.acceptCookie();
});

demoCredentialsTest(
  qase(35, 'Login with an email address'),
  async ({ demoAccount }) => {
    await loginPage.enterEmailAndClickOnContinue(demoAccount.email);
    await loginPage.enterPwd(demoAccount.password);
    await loginPage.clickLoginButton();
    await dashboardPage.isHeaderDisplayed('Personal Projects');
  },
);

demoCredentialsTest(qase(40, 'Login with invalid email address'), async () => {
  await loginPage.enterEmail('test@com');
  await loginPage.isEmailInputErrorVisible('Enter a valid email please');
  await loginPage.isLoginButtonDisplayed();
  await loginPage.isLoginButtonDisabled();
});

demoCredentialsTest(qase(41, 'Login with no password'), async ({ demoAccount }) => {
  await loginPage.enterEmailAndClickOnContinue(demoAccount.email);
  await loginPage.clickPwdInput();
  await loginPage.clickHeader();
  await loginPage.isLoginButtonDisplayed();
  await loginPage.isLoginButtonEnabled();
});

demoCredentialsTest(
  qase(42, 'Login with incorrect password'),
  async ({ demoAccount }) => {
    await loginPage.enterEmailAndClickOnContinue(demoAccount.email);
    await loginPage.enterPwd('11223344');
    await loginPage.clickLoginButton();
    await loginPage.isLoginErrorMessageDisplayed('Email or password is incorrect.');
  },
);

demoCredentialsTest(
  qase(
    2639,
    'Attempt to log in with a Custom SSO email using standard Penpot login form',
  ),
  { tag: '@external' },
  async ({ demoAccount }) => {
    // Start with a non-SSO email: typing the SSO one here would redirect to the
    // identity provider. Then swap in the SSO account's Penpot credentials, which
    // the standard form must accept.
    await loginPage.enterEmailAndClickOnContinue(demoAccount.email);
    await loginPage.enterEmail(process.env.SSO_LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.SSO_LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isHeaderDisplayed('Personal Projects');
  },
);
