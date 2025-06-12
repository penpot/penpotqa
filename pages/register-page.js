const { BasePage } = require('./base-page');
const { expect } = require('@playwright/test');

exports.RegisterPage = class RegisterPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.pageTitle = page.getByTestId('registration-title');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.createAccountBtn = page.getByTestId('register-form-submit');
    this.createAccountSecondBtn = page.getByRole('button', {
      name: 'Create an account',
    });
    this.emailInputError = page.getByTestId('email-input-error');
    this.passwordInputHint = page.locator('div.main_ui_components_forms__hint');
    this.passwordInputError = page.getByTestId(':password-error');
    this.fullnameInput = page.getByPlaceholder('Full Name');
    this.acceptTermsCheckbox = page.locator(
      'label[for="accept-terms-and-privacy"] span',
    );
    this.regEmailNotification = page.locator(
      'div[class*="notification-text-email"]',
    );
    this.createDemoAccountBtn = page.locator(
      'div[class*="auth_register__demo-account"]',
    );
  }

  async isRegisterPageOpened() {
    await expect(this.pageTitle).toBeVisible({ timeout: 30000 });
    await expect(this.pageTitle).toHaveText('Create an account');
  }

  async enterEmail(email) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password) {
    await this.passwordInput.fill(password);
  }

  async enterFullName(name) {
    await this.fullnameInput.fill(name);
  }

  async isFullNameFieldDisplayed() {
    await expect(this.fullnameInput).toBeVisible();
  }

  async clickOnAcceptTermsCheckbox() {
    await this.acceptTermsCheckbox.click();
  }

  async clickOnCreateAccountBtn() {
    await this.createAccountBtn.click();
  }

  async clickOnCreateAccountSecondBtn() {
    await this.createAccountSecondBtn.click();
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

  async isRegisterEmailCorrect(email) {
    await expect(this.regEmailNotification).toBeVisible();
    await expect(this.regEmailNotification).toHaveText(email);
  }

  async clickOnCreateDemoAccountBtn() {
    await this.createDemoAccountBtn.click();
  }

  async registerAccount(fullName, email, password) {
    await this.isRegisterPageOpened();
    await this.enterFullName(fullName);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickOnAcceptTermsCheckbox();
    await this.clickOnCreateAccountBtn();
  }
};
