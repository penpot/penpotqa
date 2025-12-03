const { BasePage } = require('./base-page');
const { expect } = require('@playwright/test');

exports.RegisterPage = class RegisterPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Header
    this.pageTitle = page.getByRole('heading', { name: 'Create an account' });

    // Register form fields
    this.fullnameInput = page.getByRole('textbox', { name: 'Full Name' });
    this.emailInput = page.getByRole('textbox', { name: 'Work email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.passwordInputHint = page.getByText('At least 8 characters');

    // Create account button
    this.createAccountButton = page.getByRole('button', {
      name: 'Create an account',
    });

    // Error messages
    this.emailInputError = page.getByTestId('email-input-error');
    this.passwordInputError = page.getByTestId(':password-error');

    // Terms and conditions checkbox
    this.acceptTermsCheckbox = page
      .locator('.main_ui_components_forms__checkbox')
      .first();

    // Check your email page notification
    this.regEmailNotification = page.locator(
      '.main_ui_auth_register__notification-text-email',
    );

    // Demo Account (Only PRE)
    this.createDemoAccountButton = page.getByText('Create demo account');
  }

  async isRegisterPageOpened() {
    await expect(
      this.pageTitle,
      `"Create an account" heading is visible`,
    ).toBeVisible();
  }

  async enterEmail(email) {
    await this.emailInput.fill(email);
  }

  async enterEmailAndClickOnContinue(email) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password) {
    await this.passwordInput.fill(password);
  }

  async enterFullName(name) {
    await this.fullnameInput.fill(name);
  }

  async clickOnAcceptTermsCheckbox() {
    await this.acceptTermsCheckbox.click();
  }

  async clickOnCreateAccountButton() {
    await this.createAccountButton.click();
  }

  async isCreateAccountButtonVisible() {
    await expect(
      this.createAccountButton,
      `Create account button is visible`,
    ).toBeVisible();
  }

  async isCreateAccountButtonDisabled() {
    await expect(
      this.createAccountButton,
      `Create account button is disabled`,
    ).toBeDisabled();
  }

  async isEmailInputErrorDisplayed(error) {
    await expect(
      this.emailInputError,
      `Email input error is displayed: "${error}"`,
    ).toHaveText(error);
  }

  async isPasswordInputHintVisible() {
    await expect(
      this.passwordInputHint,
      `Password input hint "At least 8 characters" is visible`,
    ).toBeVisible();
  }

  async isPasswordInputErrorDisplayed(error) {
    await expect(
      this.passwordInputError,
      `Password input error is displayed: "${error}"`,
    ).toHaveText(error);
  }

  async clickOnPasswordInput() {
    await this.passwordInput.click();
  }

  async clickOnHeader() {
    await this.pageTitle.click();
  }

  async isRegisterEmailCorrect(email) {
    await expect(
      this.regEmailNotification,
      `Verification email sent to "${email}" is visible`,
    ).toBeVisible();
    await expect(
      this.regEmailNotification,
      `Verification email sent to has text: "${email}"`,
    ).toHaveText(email);
  }

  async clickOnCreateDemoAccountButton() {
    await this.createDemoAccountButton.click();
  }

  async registerAccount(fullName, email, password) {
    await this.isRegisterPageOpened();
    await this.enterFullName(fullName);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickOnAcceptTermsCheckbox();
    await this.clickOnCreateAccountButton();
  }
};
