const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

exports.ForgotPasswordPage = class ForgotPasswordPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.emailInput = page.getByRole('textbox', { name: 'Work email' });
    this.recoverPasswordButton = page.getByTestId('recovery-resquest-submit');
    this.recoveryPwdInput = page.locator('#password-1');
    this.recoveryPwdConfirmInput = page.locator('#password-2');
    this.changePwdButton = page.getByRole('button', {
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
    await expect(this.recoverPasswordButton).toBeDisabled();
  }

  async enterNewPwd(loginPwd) {
    await this.recoveryPwdInput.fill(loginPwd);
  }

  async enterConfirmPwd(loginPwd) {
    await this.recoveryPwdConfirmInput.fill(loginPwd);
  }

  async clickOnChangePwdButton() {
    await this.changePwdButton.click();
  }
};
