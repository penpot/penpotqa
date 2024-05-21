const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

exports.ForgotPasswordPage = class ForgotPasswordPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.emailInput = page.locator('#email');
    this.recoverPasswordButton = page.locator('data-test=recovery-resquest-submit');
  }

  async enterEmail(loginEmail) {
    await this.emailInput.fill(loginEmail);
  }

  async clickRecoverPasswordButton() {
    await this.recoverPasswordButton.click();
  }

  async isRecoverPasswordButtonDisabled() {
    await expect(this.recoverPasswordButton).toBeDisabled();
  }
};
