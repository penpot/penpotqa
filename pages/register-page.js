const { BasePage } = require('./base-page');
const { expect } = require('@playwright/test');

exports.RegisterPage = class RegisterPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.pageTitle = page.locator('h1[data-test="registration-title"]');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.createAccountBtn = page.locator('button[data-test="register-form-submit"]');
    this.emailInputError = page.locator('div[data-test="email-input-error"]');
    this.passwordInputHint = page.locator('div.main_ui_components_forms__hint');
    this.passwordInputError = page.locator('div[data-test="-error"]');
  }

  async isRegisterPageOpened() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toHaveText('Create an account');
  }

  async enterEmail(email) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password) {
    await this.passwordInput.fill(password);
  }

  async isCreateAccountBtnDisplayed() {
    await expect(this.createAccountBtn).toBeVisible();
  }

  async isCreateAccountBtnDisabled() {
    await expect(this.createAccountBtn).toBeDisabled();
  }

  async isEmailInputErrorDisplayed(error) {
    await expect(this.emailInputError).toHaveText(error);
  }

  async isPasswordInputHintDisplayed(error) {
    await expect(this.passwordInputHint).toHaveText(error);
  }

  async isPasswordInputErrorDisplayed(error) {
    await expect(this.passwordInputError).toHaveText(error);
  }

  async clickOnPasswordInput() {
    await this.passwordInput.click();
  }

  async clickOnHeader() {
    await this.pageTitle.click();
  }
};
