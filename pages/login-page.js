const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

exports.LoginPage = class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.pageTitle = page
      .getByRole('heading', { name: 'Log into my account', exact: true });
    this.emailInput = page
      .getByPlaceholder('Work email', { exact: true });
    this.pwdInput = page
      .getByPlaceholder('Password', { exact: true });
    this.loginButton = page
      .getByRole('button', { name: 'Login', exact: true });
    this.emailInputError = page
      .getByTestId(':email-error');
    this.createAccountLink = page
      .getByText('Create an account', { exact: true });
    this.forgotPasswordLink = page
      .getByText('Forgot password?', { exact: true });
  }

  async getLoginError(text) {
    return this.page
      .getByRole('alert')
      .filter({ hasText: text });
  }

  async goto() {
    await this.page
      .goto('/#/auth/login');
  }

  async enterEmail(loginEmail) {
    await this.emailInput
      .fill(loginEmail);
  }

  async enterPwd(loginPwd) {
    await this.pwdInput
      .fill(loginPwd);
  }

  async clickLoginButton() {
    await this.loginButton
      .click();
  }

  async clickPwdInput() {
    await this.pwdInput.click();
  }

  async isEmailInputErrorDisplayed(error) {
    await expect(
      this.emailInputError,
      `Email input error is displayed: ${error}`,
    ).toHaveText(error);
  }

  async isLoginButtonDisplayed() {
    await expect(this.loginButton, 'Login button is displayed')
      .toBeVisible();
  }

  async isLoginButtonDisabled() {
    await expect(this.loginButton, 'Login button is disabled')
      .toBeDisabled();
  }

  async clickHeader() {
    await this.pageTitle
      .click();
  }

  async isLoginErrorMessageDisplayed(message) {
    await expect(
      await this.getLoginError(message),
      `Login error message is visible: ${message}`,
    ).toBeVisible();
  }

  async clickOnCreateAccount() {
    await this.createAccountLink
      .click();
  }

  async clickOnForgotPassword() {
    await this.forgotPasswordLink
      .click();
  }

  async isLoginPageOpened() {
    await expect(this.pageTitle, 'Login page is opened')
      .toBeVisible();
  }

  async isEmailInputVisible() {
    await expect(this.emailInput, 'Email input is visible')
      .toBeVisible();
  }
};
