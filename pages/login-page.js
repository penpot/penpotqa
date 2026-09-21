const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

exports.LoginPage = class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.pageTitle = page.getByRole('heading', {
      name: 'Log into my account',
      exact: true,
    });
    this.emailInput = page.getByPlaceholder('Work email', { exact: true });
    this.pwdInput = page.getByPlaceholder('Password', { exact: true });
    this.loginButton = page.getByTestId('login-submit');
    this.emailInputError = page.getByTestId(':email-error');
    this.createAccountLink = page.getByText('Create an account', { exact: true });
    this.forgotPasswordLink = page.getByText('Forgot password?', { exact: true });
  }

  async getLoginError(text) {
    return this.page.getByRole('alert').filter({ hasText: text });
  }

  /** Builds the URL explicitly from BASE_URL rather than a relative
   * goto() — this runs on manually-created contexts too (see
   * registerNewAccount(), used by createTeamInviteeSession()/
   * createOrgInviteeSession()). Playwright Test's own `browser` fixture
   * does thread baseURL through to those contexts' relative gotos
   * (confirmed directly), but that's a fixture-specific nuance this
   * doesn't need to depend on. */
  async goto() {
    await this.page.goto(`${process.env.BASE_URL}#/auth/login`);
  }

  async enterEmail(loginEmail) {
    await this.emailInput.fill(loginEmail);
  }

  async enterEmailAndClickOnContinue(loginEmail) {
    await this.emailInput.fill(loginEmail);
    await this.clickLoginButton();
  }

  async enterPwd(loginPwd) {
    await this.pwdInput.fill(loginPwd);
  }

  async clickLoginButton() {
    await this.loginButton.waitFor({ state: 'visible' });
    await this.loginButton.click();
  }

  async clickPwdInput() {
    await this.pwdInput.click();
  }

  async isEmailInputErrorVisible(error) {
    await expect(
      this.emailInputError,
      `Email input error is displayed: ${error}`,
    ).toHaveText(error);
  }

  async isLoginButtonDisplayed() {
    await expect(this.loginButton, 'Login button is displayed').toBeVisible();
  }

  async isLoginButtonDisabled() {
    await expect(
      this.loginButton,
      'Login button has disabled attribute',
    ).toHaveJSProperty('disabled', true);
  }

  async isLoginButtonEnabled() {
    await expect(this.loginButton, 'Login button is enabled').toBeEnabled();
  }

  async clickHeader() {
    await this.pageTitle.click();
  }

  async isLoginErrorMessageDisplayed(message) {
    await expect(
      await this.getLoginError(message),
      `Login error message is visible: ${message}`,
    ).toBeVisible();
  }

  async clickOnCreateAccount() {
    await this.createAccountLink.click();
  }

  async clickOnForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async isLoginPageOpened() {
    await expect(this.pageTitle, 'Login page is opened').toBeVisible();
  }

  /** Checks the URL itself, in addition to isLoginPageOpened() checking the
   * heading — use when a case cares specifically about being redirected to
   * /#/auth/login (e.g. after hitting a protected page while logged out). */
  async isLoginPageUrlShown() {
    await expect(this.page, 'Redirected to the login page').toHaveURL(
      /\/#\/auth\/login/,
    );
  }

  async isEmailInputVisible() {
    await expect(this.emailInput, 'Email input is visible').toBeVisible();
  }
};
