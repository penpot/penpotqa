const { expect } = require("@playwright/test");
exports.LoginPage = class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator("h1");
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

  async clickSection() {
    await this.section.click();
  }

  async isLoginErrorBannerDisplayed() {
    await expect(this.loginErrorBanner).toBeVisible();
  }

  async isLoginErrorMessageDisplayed(message) {
    await expect(this.loginErrorBanner).toHaveText(message);
  }

  async isHeaderDisplayed(title) {
    await expect(this.header).toBeVisible();
    await expect(this.header).toHaveText(title);
  }
};
