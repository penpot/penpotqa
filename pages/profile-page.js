const { expect } = require("@playwright/test");
const { BasePage } = require("./base-page");
exports.ProfilePage = class ProfilePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.profileMenuButton = page.locator('div[data-test="profile-btn"]');
    this.yourAccountMenuItem = page.locator('li[data-test="profile-profile-opt"]');
    this.logoutMenuItem = page.locator('li[data-test="logout-profile-opt"]');
    this.giveFeedbackMenuItem = page.locator(
      'li[data-test="feedback-profile-opt"]'
    );
    this.profileNameInput = page.locator("#fullname");
    this.saveSettingsButton = page.locator('input[value="Save settings"]');
    this.successMessage = page.locator('div[class="banner success fixed"]');
    this.feedbackSubjectInput = page.locator("#subject");
    this.feedbackDescriptionInput = page.locator("textarea");
    this.sendFeedbackButton = page.locator('input[value="Send"]');
  }

  async openYourAccountPage() {
    await this.profileMenuButton.click();
    await this.yourAccountMenuItem.click();
  }

  async openGiveFeedbackPage() {
    await this.profileMenuButton.click();
    await this.giveFeedbackMenuItem.click();
  }

  async logout() {
    await this.profileMenuButton.click();
    await this.logoutMenuItem.click();
  }

  async isHeaderDisplayed(title) {
    await expect(this.header).toBeVisible();
    await expect(this.header).toHaveText(title);
  }

  async changeProfileName(newName) {
    await this.clearInput(this.profileNameInput);
    await this.profileNameInput.fill(newName);
    await this.saveSettingsButton.click();
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

  async clearDescriptionInputInGiveFeedbackForm() {
    await this.clearInput(this.feedbackDescriptionInput);
  }

  async clickSendFeedbackButton() {
    await this.sendFeedbackButton.click();
  }

  async isSendFeedbackButtonDisabled() {
    await expect(this.sendFeedbackButton).toBeDisabled();
  }

  async isSuccessMessageDisplayed(message) {
    await expect(this.successMessage).toHaveText(message);
  }

  async isAccountNameDisplayed(name) {
    await expect(this.profileMenuButton).toHaveText(name);
  }
};
