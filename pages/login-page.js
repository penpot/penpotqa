const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

exports.LoginPage = class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.pageTitle = page.locator('h1[data-testid="login-title"]');
    this.emailInput = page.locator('#email');
    this.pwdInput = page.locator('#password');
    this.loginButton = page.locator('button[data-testid="login-submit"]');
    this.emailInputError = page.locator('div[data-testid="-error"]');
    this.section = page.locator('section[class="auth-content"]');
    this.loginErrorBanner = page.locator('aside[class*="context_notification__warning"] div:nth-of-type(2)');
    this.createAccountLink = page.locator('a:has-text("Create an account")');
    this.forgotPasswordLink = page.locator('a[data-testid="forgot-password"]');
    this.loginHereButton = page.locator('*[data-testid="login-here-link"]');
  }

  async checkLoginError(text) {
    return this.page.locator(`//aside[contains(@class,"context_notification__warning")]/div[text()='${text}']`).isVisible()
  }

  async goto() {
    await this.page.goto('/#/auth/login');
  }

  async enterEmail(loginEmail) {
    await this.emailInput.fill(loginEmail);
  }

  async enterPwd(loginPwd) {
    await this.pwdInput.fill(loginPwd);
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async clickPwdInput() {
    await this.pwdInput.click();
  }

  async isEmailInputErrorDisplayed(error) {
    await expect(this.emailInputError).toHaveText(error);
  }

  async isLoginButtonDisplayed() {
    await expect(this.loginButton).toBeVisible();
  }

  async isLoginButtonDisabled() {
    await expect(this.loginButton).toBeDisabled();
  }

  async clickHeader() {
    await this.pageTitle.click();
  }

  async isLoginErrorMessageDisplayed(message) {
    await expect(await this.checkLoginError(message)).toBeTruthy;
  }

  async clickOnCreateAccount() {
    await this.createAccountLink.click();
  }
  async clickOnLoginHereLinc() {
    await this.loginHereButton.click();
  }

  async clickOnForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async isLoginPageOpened() {
    await expect(this.pageTitle).toHaveText('Log into my account');
  }
};
