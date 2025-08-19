// Login tests for Penpot application
const { DashboardPage } = require('../pages/dashboard/dashboard-page');
const { LoginPage } = require('../pages/login-page');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { test } = require('@playwright/test');
const { updateTestResults } = require('./../helpers/saveTestResults.js');

test(qase(35, 'Login with an email address'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.acceptCookie();
  await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.isHeaderDisplayed('Projects');
});

test(qase(40, 'Login with invalid email address'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.acceptCookie();
  await loginPage.enterEmail('test@com');
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.isEmailInputErrorDisplayed('Enter a valid email please');
  await loginPage.isLoginButtonDisplayed();
  await loginPage.isLoginButtonDisabled();
});

test(qase(41, 'Login with no password'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  await loginPage.clickPwdInput();
  await loginPage.clickHeader();
  await loginPage.isLoginButtonDisplayed();
  await loginPage.isLoginButtonDisabled();
});

test(qase(42, 'Login with incorrect password'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  await loginPage.enterPwd('11223344');
  await loginPage.clickLoginButton();
  await loginPage.isLoginErrorMessageDisplayed('Email or password is incorrect.');
});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry);
});

// Test change to trigger pipeline - Added on Aug 19, 2025
