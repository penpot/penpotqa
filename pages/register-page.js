const { BasePage } = require("./base-page");
const { expect } = require("@playwright/test");

exports.RegisterPage = class RegisterPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.pageTitle = page.locator('h1[data-test="registration-title"]');
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.createAccountBtn = page.locator('input[value="Create an account"]');
    this.emailInputError = page.locator('span[data-test="email-input-error"]');
    this.passwordInputError = page.locator('span[data-test="-error"]');
  }

  async isRegisterPageOpened() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toHaveText("Create an account");
  }

  async enterEmail(email) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password) {
    await this.passwordInput.fill(password);
  }

  async clickOnCreateAccount() {
    await this.createAccountBtn.click();
  }

  async isCreateAccountBtnDisplayed() {
    await expect(this.createAccountBtn).toBeVisible();
  }

  async isCreateAccountBtnDisabled() {
    await expect(this.createAccountBtn).toBeDisabled();
  }

  async isEmailInputErrorDisplayed(error) {
    await expect(this.emailInputError).toBeVisible;
    await expect(this.emailInputError).toHaveText(error);
  }

  async isPasswordInputErrorDisplayed(error) {
    await expect(this.passwordInput).toBeVisible;
    await expect(this.passwordInputError).toHaveText(error);
  }

  async clickOnPasswordInput() {
    await this.passwordInput.click();
  }

  async clickOnHeader() {
    await this.pageTitle.click();
  }
};
