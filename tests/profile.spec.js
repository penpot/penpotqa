const { mainTest } = require('../fixtures');
const { ProfilePage } = require('../pages/profile-page');
const { random } = require('../helpers/string-generator');
const { LoginPage } = require('../pages/login-page');
const { expect, test } = require('@playwright/test');
const { updateTestResults } = require('./../helpers/saveTestResults.js');

mainTest('PR-1 Edit profile name', async ({ page }) => {
  const newName = random();
  const profilePage = new ProfilePage(page);
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.changeProfileName(newName);
  await profilePage.isSuccessMessageDisplayed('Profile saved successfully!');
  await profilePage.isAccountNameDisplayed(newName);
});

mainTest('PR-9 Add profile picture jpeg', async ({ page }) => {
  const profilePage = new ProfilePage(page);
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.uploadProfileImage('images/images.png');
  await profilePage.waitInfoMessageHidden();
  await expect(profilePage.profileAvatarBlock).toHaveScreenshot(
    'profile-avatar-block-png.png',
    {
      mask: [profilePage.profileNameInput, profilePage.profileEmailInput],
    },
  );
  await profilePage.uploadProfileImage('images/sample.jpeg');
  await profilePage.waitInfoMessageHidden();
  await expect(profilePage.profileAvatarBlock).toHaveScreenshot(
    'profile-avatar-block-jpeg.png',
    {
      mask: [profilePage.profileNameInput, profilePage.profileEmailInput],
    },
  );
});

mainTest('PR-12 Change password to invalid', async ({ page }) => {
  const newPassword = '1234567';
  const profilePage = new ProfilePage(page);
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.openPasswordPageInAccount();
  await profilePage.enterCurrentPassword(process.env.LOGIN_PWD);
  await profilePage.enterNewPassword(newPassword);
  await profilePage.enterConfirmPassword(newPassword);
  await profilePage.isUpdateSettingsBtnDisabled();
  await profilePage.isPasswordInputErrorDisplayed(
    'Password should at least be 8 characters',
  );
});

mainTest(
  'PR-16 Fail to change password confirmation does not match',
  async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');
    await profilePage.openPasswordPageInAccount();
    await profilePage.enterCurrentPassword(process.env.LOGIN_PWD);
    await profilePage.enterNewPassword('test12345');
    await profilePage.enterConfirmPassword('test54321');
    await profilePage.isUpdateSettingsBtnDisabled();
    await profilePage.isPasswordInputErrorDisplayed(
      'Confirmation password must match',
    );
  },
);

mainTest('PR-19 Logout from Account', async ({ page }) => {
  const profilePage = new ProfilePage(page);
  const loginPage = new LoginPage(page);
  await profilePage.logout();
  await loginPage.isLoginPageOpened();
});

mainTest('PR-21 Send feedback email with empty fields', async ({ page }) => {
  const profilePage = new ProfilePage(page);
  await profilePage.openGiveFeedbackPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.isSendFeedbackButtonDisabled();
  await profilePage.enterSubjectToGiveFeedbackForm('QA Test');
  await profilePage.isSendFeedbackButtonDisabled();
  await profilePage.clearSubjectInputInGiveFeedbackForm();
  await profilePage.enterDescriptionToGiveFeedbackForm(
    'This is a test feedback triggered by QA team',
  );
  await profilePage.isSendFeedbackButtonDisabled();
});

mainTest('PR-22 Send feedback email with valid data', async ({ page }) => {
  const profilePage = new ProfilePage(page);
  await profilePage.openGiveFeedbackPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.enterSubjectToGiveFeedbackForm('QA Test');
  await profilePage.enterDescriptionToGiveFeedbackForm(
    'This is a test feedback triggered by QA team',
  );
  await profilePage.clickSendFeedbackButton();
  await profilePage.isSuccessMessageDisplayed('Feedback sent');
});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry)
});
