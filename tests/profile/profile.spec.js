const { mainTest, registerTest } = require('../../fixtures');
const { ProfilePage } = require('../../pages/profile-page');
const { random } = require('../../helpers/string-generator');
const { LoginPage } = require('../../pages/login-page');
const { expect } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter/playwright');
const {
  getRegisterMessage,
  checkNewEmailText,
  waitSecondMessage,
} = require('../../helpers/gmail');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');

mainTest(qase(187, 'PR-1 Edit profile name'), async ({ page }) => {
  const newName = random();
  const profilePage = new ProfilePage(page);
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.changeProfileName(newName);
  await profilePage.isSuccessMessageDisplayed('Profile saved successfully!');
  await profilePage.isAccountNameDisplayed(newName);
});

mainTest(qase(195, 'PR-9 Add profile picture jpeg'), async ({ page }) => {
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

mainTest(qase(198, 'PR-12 Change password to invalid'), async ({ page }) => {
  const newPassword = '1234567';
  const profilePage = new ProfilePage(page);
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.openPasswordPageInAccount();
  await profilePage.enterCurrentPassword(process.env.LOGIN_PWD);
  await profilePage.enterNewPassword(newPassword);
  await profilePage.enterConfirmPassword(newPassword);
  await profilePage.isChangePasswordButtonDisabled();
  await profilePage.isPasswordInputErrorDisplayed(
    'Password should at least be 8 characters',
  );
});

mainTest(qase(200, 'Show/hide password'), async ({ page }) => {
  const newPassword = '1234567890';
  const profilePage = new ProfilePage(page);
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.openPasswordPageInAccount();
  await profilePage.enterCurrentPassword(process.env.LOGIN_PWD);
  await profilePage.enterNewPassword(newPassword);
  await profilePage.enterConfirmPassword(newPassword);

  await profilePage.clickOnShowPasswordIcon(profilePage.oldPasswordContainer);
  await profilePage.isPasswordShown(
    profilePage.passwordOldInput,
    process.env.LOGIN_PWD,
  );
  await profilePage.clickOnShowPasswordIcon(profilePage.newPasswordContainer);
  await profilePage.isPasswordShown(profilePage.passwordNewInput, newPassword);
  await profilePage.clickOnShowPasswordIcon(profilePage.confirmPasswordContainer);
  await profilePage.isPasswordShown(profilePage.passwordConfirmInput, newPassword);

  await profilePage.clickOnHidePasswordIcon(profilePage.oldPasswordContainer);
  await profilePage.isPasswordHidden(profilePage.passwordOldInput);
  await profilePage.clickOnHidePasswordIcon(profilePage.newPasswordContainer);
  await profilePage.isPasswordHidden(profilePage.passwordNewInput);
  await profilePage.clickOnHidePasswordIcon(profilePage.confirmPasswordContainer);
  await profilePage.isPasswordHidden(profilePage.passwordConfirmInput);
});

mainTest(
  qase(202, 'PR-16 Fail to change password confirmation does not match'),
  async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');
    await profilePage.openPasswordPageInAccount();
    await profilePage.enterCurrentPassword(process.env.LOGIN_PWD);
    await profilePage.enterNewPassword('test12345');
    await profilePage.enterConfirmPassword('test54321');
    await profilePage.isChangePasswordButtonDisabled();
    await profilePage.isPasswordInputErrorDisplayed(
      'Confirmation password must match',
    );
  },
);

mainTest(qase(205, 'PR-19 Logout from Account'), async ({ page }) => {
  const profilePage = new ProfilePage(page);
  const loginPage = new LoginPage(page);
  await profilePage.logout();
  await loginPage.isLoginPageOpened();
});

mainTest(
  qase(207, 'PR-21 Send feedback email with empty fields'),
  async ({ page }) => {
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
  },
);

mainTest(
  qase(208, 'PR-22 Send feedback email with valid data'),
  async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.openGiveFeedbackPage();
    await profilePage.isHeaderDisplayed('Your account');
    await profilePage.enterSubjectToGiveFeedbackForm('QA Test');
    await profilePage.enterDescriptionToGiveFeedbackForm(
      'This is a test feedback triggered by QA team',
    );
    await profilePage.clickSendFeedbackButton();
    await profilePage.isSuccessMessageDisplayed('Feedback sent');
  },
);

registerTest(
  qase(190, 'PR-4 Change email to valid'),
  async ({ page, name, email }) => {
    await registerTest.slow();
    const newEmail = `${process.env.GMAIL_NAME}+${random().concat(
      'autotest',
    )}@gmail.com`;
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    await profilePage.changeEmail(newEmail);
    await waitSecondMessage(page, email, 40);
    const changeEmail = await getRegisterMessage(email);
    await checkNewEmailText(changeEmail.inviteText, name, newEmail);
    await page.goto(changeEmail.inviteUrl);
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(newEmail);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  },
);
