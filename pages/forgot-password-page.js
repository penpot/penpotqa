const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

exports.ForgotPasswordPage = class ForgotPasswordPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.emailInput = page.getByRole('textbox', { name: 'Work email' });
    this.recoverPasswordButton = page.getByRole('button', {
      name: 'Recover password',
    });
    this.recoveryPasswordInput = page.getByRole('textbox', {
      name: 'Type a new password',
    });
    this.recoveryPasswordConfirmInput = page.getByRole('textbox', {
      name: 'Confirm password',
    });
    this.changePasswordButton = page.getByRole('button', {
      name: 'Change your password',
    });
  }

  async enterEmail(loginEmail) {
    await this.emailInput.fill(loginEmail);
  }

  async clickRecoverPasswordButton() {
    await this.recoverPasswordButton.click();
  }

  async isRecoverPasswordButtonDisabled() {
    await expect(
      this.recoverPasswordButton,
      'Recover Password button is disabled',
    ).toBeDisabled();
  }

  async enterNewPassword(loginPwd) {
    await this.recoveryPasswordInput.fill(loginPwd);
  }

  async enterConfirmPassword(loginPwd) {
    await this.recoveryPasswordConfirmInput.fill(loginPwd);
  }

  async clickOnChangePasswordButton() {
    await this.changePasswordButton.click();
  }
};
