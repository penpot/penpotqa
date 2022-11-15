// @ts-check
const { test } = require("@playwright/test");
const { LoginPage } = require("../pages/login-page");
const { DashboardPage } = require("../pages/dashboard-page");

test("Login with an email address", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.isHeaderDisplayed("Projects");
});

test("Login with invalid email address", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.enterEmail("test@com");
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.isEmailInputErrorDisplayed();
  await loginPage.isLoginButtonDisplayed();
  await loginPage.isLoginButtonDisabled();
});

test("Login with no password", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  await loginPage.clickPwdInput();
  await loginPage.clickSection();
  await loginPage.isPwdInputErrorDisplayed();
  await loginPage.isLoginButtonDisplayed();
  await loginPage.isLoginButtonDisabled();
});

test("Login with incorrect password", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  await loginPage.enterPwd("11223344");
  await loginPage.clickLoginButton();
  await loginPage.isLoginErrorMessageDisplayed(
    "Username or password seems to be wrong."
  );
});
