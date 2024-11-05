const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

exports.ProfilePage = class ProfilePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.profileSection = page.locator('.main_ui_settings__dashboard-content');

    //Account
    this.profileMenuButton = page.getByTestId('profile-btn');
    this.yourAccountMenuItem = page.getByTestId('profile-profile-opt');
    this.logoutMenuItem = page.getByTestId('logout-profile-opt');
    this.giveFeedbackMenuItem = page.getByTestId('feedback-profile-opt');
    this.backToDashboardBtn = page.getByRole('button', { name: 'Dashboard' });

    //Profile
    this.profileNameInput = page.locator('#fullname');
    this.profileEmailInput = page.locator('#email');
    this.saveSettingsButton = page.getByRole('button', { name: 'Save settings' });
    this.profileImageInput = page.getByTestId('profile-image-input');
    this.profileAvatarBlock = page.locator(
      'div.main_ui_settings_profile__form-container',
    );
    this.changeEmailBtn = page.locator('div[class="change-email"]');
    this.newEmailInput = page.locator('#email-1');
    this.confirmNewEmailInput = page.locator('#email-2');
    this.confirmChangeEmailBtn = page
      .getByRole('button')
      .filter({ hasText: 'Change email' });

    //Feedback
    this.feedbackSubjectInput = page.locator('#subject');
    this.feedbackDescriptionInput = page.locator('textarea');
    this.sendFeedbackButton = page.getByRole('button', { name: 'Send' });

    //Password
    this.passwordSidebarOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Password' });
    this.passwordFormHeader = page.locator(
      'div[class*="password__form-container"] h2',
    );
    this.passwordOldInput = page.locator('#password-old');
    this.passwordNewInput = page.getByPlaceholder('New password');
    this.passwordConfirmInput = page.getByPlaceholder('Confirm password');
    this.changePasswordButton = page.getByTestId('submit-password');
    this.passwordInputError = page.getByTestId('-error');

    //Settings
    this.settingsMenuButton = page.getByTestId('settings-profile');
    this.darkThemeOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Penpot Dark (default)' });
    this.lightThemeOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Penpot Light' });
    this.uiThemeDropdown = page.locator('[class*="select-wrapper"] >>nth=1');
    this.updateSettingsButton = page.getByTestId('submit-lang-change');
  }

  async openYourAccountPage() {
    await this.profileMenuButton.click();
    await this.yourAccountMenuItem.click();
  }

  async goToAccountPage() {
    const baseUrl = process.env.BASE_URL;
    await this.page.goto(baseUrl.concat('#/settings/profile'));
  }

  async openGiveFeedbackPage() {
    await this.profileMenuButton.click();
    await this.giveFeedbackMenuItem.click();
  }

  async clickOnProfileTab() {
    await this.profileMenuButton.click();
  }

  async openPasswordPageInAccount() {
    await this.passwordSidebarOption.click();
    await expect(this.passwordFormHeader).toHaveText('Change password');
  }

  async enterCurrentPassword(value) {
    await this.passwordOldInput.fill(value);
  }

  async enterNewPassword(value) {
    await this.passwordNewInput.fill(value);
  }

  async enterConfirmPassword(value) {
    await this.passwordConfirmInput.fill(value);
  }

  async isPasswordInputErrorDisplayed(error) {
    await expect(this.passwordInputError.first()).toHaveText(error);
  }

  async isChangePasswordButtonDisabled() {
    await expect(this.changePasswordButton).toBeDisabled();
  }

  async logout() {
    await this.profileMenuButton.click();
    await this.logoutMenuItem.click();
  }

  async changeProfileName(newName) {
    await this.clearInput(this.profileNameInput);
    await this.profileNameInput.fill(newName);
    await this.saveSettingsButton.click();
  }

  async changeEmail(newEmail) {
    await this.profileMenuButton.click();
    await this.yourAccountMenuItem.click();
    await this.changeEmailBtn.click();
    await this.newEmailInput.fill(newEmail);
    await this.confirmNewEmailInput.fill(newEmail);
    await this.confirmChangeEmailBtn.click();
  }

  async enterSubjectToGiveFeedbackForm(text) {
    await this.feedbackSubjectInput.fill(text);
  }

  async enterDescriptionToGiveFeedbackForm(text) {
    await this.feedbackDescriptionInput.fill(text);
  }

  async clearSubjectInputInGiveFeedbackForm() {
    await this.clearInput(this.feedbackSubjectInput);
  }

  async clickSendFeedbackButton() {
    await this.sendFeedbackButton.click();
  }

  async isSendFeedbackButtonDisabled() {
    await expect(this.sendFeedbackButton).toBeDisabled();
  }

  async isAccountNameDisplayed(name) {
    await expect(this.profileMenuButton).toHaveText(name);
  }

  async uploadProfileImage(filePath) {
    await this.profileImageInput.setInputFiles(filePath);
  }

  async backToDashboardFromAccount() {
    await this.backToDashboardBtn.click();
    await this.isHeaderDisplayed('Projects');
  }

  async selectLightTheme() {
    await this.uiThemeDropdown.click();
    await this.lightThemeOption.click();
    await this.updateSettingsButton.click();
    await this.isSuccessMessageDisplayed('Profile saved successfully!');
  }

  async selectDarkTheme() {
    await this.uiThemeDropdown.click();
    await this.darkThemeOption.click();
    await this.updateSettingsButton.click();
    await this.isSuccessMessageDisplayed('Profile saved successfully!');
  }

  async openSettingsTab() {
    await this.settingsMenuButton.click();
  }
};
