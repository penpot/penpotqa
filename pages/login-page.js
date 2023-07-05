const { expect } = require("@playwright/test");
const { BasePage } = require("./base-page");
exports.LoginPage = class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.pageTitle = page.locator('h1[data-test="login-title"]');
    this.emailInput = page.locator("#email");
    this.pwdInput = page.locator("#password");
    this.loginButton = page.locator('input[name="submit"]');
    this.emailInputError = page.locator(
      'div[class=" invalid with-icon custom-input"] #email'
    );
    this.pwdInputError = page.locator(
      'div[class=" invalid empty with-icon custom-input"] #password'
    );
    this.section = page.locator('section[class="auth-content"]');
    this.loginErrorBanner = page.locator('div[data-test="login-banner"]');
    this.createAccountLink = page.locator('a:has-text("Create an account")');
  }

  async goto() {
    await this.page.goto("/#/auth/login");
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

  async isEmailInputErrorDisplayed() {
    await expect(this.emailInputError).toBeVisible();
  }

  async isPwdInputErrorDisplayed() {
    await expect(this.pwdInputError).toBeVisible();
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
    await expect(this.loginErrorBanner).toHaveText(message);
  }

  async isHeaderDisplayed(title) {
    await expect(this.header).toBeVisible();
    await expect(this.header).toHaveText(title);
  }

  async clickOnCreateAccount() {
    await this.createAccountLink.click();
  }
};
