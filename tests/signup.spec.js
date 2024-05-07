const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { RegisterPage } = require('../pages/register-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

test(qase(32,'ON-5 Sign up with invalid email address'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.enterEmail('test.com');
  await registerPage.enterPassword(process.env.LOGIN_PWD);
  await registerPage.isEmailInputErrorDisplayed('Enter a valid email please');
  await registerPage.isCreateAccountBtnDisplayed();
  await registerPage.isCreateAccountBtnDisabled();
});

test(qase(33,'ON-6 Sign up with no password'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.enterEmail(process.env.LOGIN_EMAIL);
  await registerPage.clickOnPasswordInput();
  await registerPage.clickOnHeader();
  await registerPage.isPasswordInputHintDisplayed('At least 8 characters');
  await registerPage.isCreateAccountBtnDisplayed();
  await registerPage.isCreateAccountBtnDisabled();
});

test(qase(34,'ON-7 Sign up with incorrect password'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.enterEmail(process.env.LOGIN_EMAIL);
  await registerPage.enterPassword('1234');
  await registerPage.isPasswordInputErrorDisplayed(
    'Password should at least be 8 characters',
  );
  await registerPage.isCreateAccountBtnDisplayed();
  await registerPage.isCreateAccountBtnDisabled();
});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry)
});
