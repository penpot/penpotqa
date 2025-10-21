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
    this.helpLearningMenuItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Help & Learning' });
    this.giveFeedbackMenuItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Give feedback' });
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

    this.oldPasswordContainer = this.page
      .locator('.main_ui_components_forms__input-wrapper')
      .getByText('Old password', { exact: true });
    this.newPasswordContainer = this.page
      .locator('.main_ui_components_forms__input-wrapper')
      .getByText('New password', { exact: true });
    this.confirmPasswordContainer = this.page
      .locator('.main_ui_components_forms__input-wrapper')
      .getByText('Confirm password', { exact: true });

    this.passwordOldInput = page.getByPlaceholder('Old password');
    this.passwordNewInput = page.getByPlaceholder('New password');
    this.passwordConfirmInput = page.getByPlaceholder('Confirm password');
    this.changePasswordButton = page.getByTestId('submit-password');
    this.passwordInputError = page.locator('[id*=":password"]');

    //Settings
    this.settingsMenuButton = page.getByTestId('settings-profile');
    this.darkThemeOption = page
      .getByRole('option')
      .filter({ hasText: 'Penpot Dark (default)' });
    this.lightThemeOption = page
      .getByRole('option')
      .filter({ hasText: 'Penpot Light' });
    this.uiThemeDropdown = page.locator('[class*="select-wrapper"] >>nth=1');
    this.updateSettingsButton = page.getByTestId('submit-lang-change');

    //Subscription
    this.subscriptionMenuButton = page.getByTestId('settings-subscription');
    this.currentPlanLabel = page
      .locator(
        'div[class*="plan-card-title-container"] h4[class*="plan-card-title"]',
      )
      .first();
    this.startFreeTrialButton = page.getByRole('button', {
      name: 'Start free trial',
    });
    this.changeSubscriptionModalHeader = page.locator(
      '[class*="subscription__modal-title"]',
    );
    this.addPaymentMethodButton = page.getByRole('button', {
      name: 'Add a payment method to continue after your trial',
    });
    this.membersInput = page.locator('input[name="min-members"]');
    this.manageSubscriptionButton = page.getByRole('button', {
      name: 'Manage your subscription',
    });
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
    await this.helpLearningMenuItem.hover();
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

  async clickOnShowPasswordIcon(passwordContainer) {
    await passwordContainer.locator('.icon-shown').click();
  }

  async clickOnHidePasswordIcon(passwordContainer) {
    await passwordContainer.locator('.icon-hide').click();
  }

  async isPasswordShown(passwordInput, passwordValue) {
    await expect(passwordInput, 'Password is shown').toHaveValue(passwordValue);
  }

  async isPasswordHidden(passwordInput) {
    // The type 'password' attribute indicates the password field is hidden (displayed as asterisks).
    await expect(passwordInput, 'Password is hidden').toHaveAttribute(
      'type',
      'password',
    );
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
    const profileImage = await this.profileImageInput.locator('../img');
    const oldSrc = await profileImage.getAttribute('src');
    await this.profileImageInput.setInputFiles(filePath);
    await expect(
      this.profileImageInput.locator(`../img[src="${oldSrc}"]`),
    ).toBeHidden();
    // Wait for the upload to complete by checking that any image is loaded
    await expect(this.profileImageInput.locator('../img').first()).toBeVisible();
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

  async openSubscriptionTab() {
    await this.subscriptionMenuButton.click();
  }

  async checkSubscriptionName(name) {
    await expect(this.currentPlanLabel).toHaveText(name);
  }

  async isSubscriptionNameVisible() {
    await expect(this.currentPlanLabel).toBeVisible();
  }

  async getUserName() {
    return await this.profileMenuButton.textContent();
  }

  async clickOnTrialButton(plan = 'Unlimited') {
    const planCardLocator = this.page.locator(
      `//*[contains(@class, "subscription__plan-card-title")][text()="${plan}"]/../../..`,
    );
    await planCardLocator
      .getByRole('button', { name: 'Try it free for 14 days' })
      .click();
  }

  async clickOnStartTrialButton() {
    await this.startFreeTrialButton.click();
  }

  async checkSubscriptionModalHeader(name) {
    await expect(this.changeSubscriptionModalHeader).toHaveText(name);
  }

  async clickOnAddPaymentMethodButton() {
    await this.addPaymentMethodButton.click();
  }

  async clickOnManageSubscriptionButton() {
    await this.manageSubscriptionButton.click();
  }

  async enterMembers(number) {
    await this.membersInput.fill(number);
  }

  async tryTrialForPlan(plan = 'Unlimited', editors) {
    await this.openYourAccountPage();
    await this.openSubscriptionTab();
    await this.clickOnTrialButton(plan);
    if (plan === 'Unlimited' && editors !== undefined) {
      await this.enterMembers(editors);
    }
    await this.clickOnStartTrialButton();
    await this.checkSubscriptionModalHeader(`You are ${plan} (trial)!`);
    await this.closeModalWindow();
    await this.checkSubscriptionName(`${plan} (trial)`);
    await this.backToDashboardFromAccount();
  }
};
