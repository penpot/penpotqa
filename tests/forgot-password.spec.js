const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { ForgotPasswordPage } = require('../pages/forgot-password-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

test(qase(50,'ON-23 Forgot password flow with invalid email'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const forgotPasswordPage = new ForgotPasswordPage(page);
  await loginPage.goto();
  await loginPage.clickOnForgotPassword();
  await forgotPasswordPage.enterEmail("xxx");
  await forgotPasswordPage.isRecoverPasswordButtonDisabled();
});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry)
});
