const { mainTest } = require('../fixtures');
const { ProfilePage } = require('../pages/profile-page');
const { random } = require('../helpers/string-generator');
const { LoginPage } = require('../pages/login-page');
const { expect, test } = require('@playwright/test');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { RegisterPage } = require('../pages/register-page');
const { getRegisterMessage, checkNewEmailText, waitMessage, waitSecondMessage } = require('../helpers/gmail');
const { DashboardPage } = require('../pages/dashboard/dashboard-page');

mainTest(qase(187,'PR-1 Edit profile name'), async ({ page }) => {
  const newName = random();
  const profilePage = new ProfilePage(page);
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed('Your account');
  await profilePage.changeProfileName(newName);
  await profilePage.isSuccessMessageDisplayed('Profile saved successfully!');
  await profilePage.isAccountNameDisplayed(newName);
});

mainTest(qase(195,'PR-9 Add profile picture jpeg'), async ({ page }) => {
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

mainTest(qase(198,'PR-12 Change password to invalid'), async ({ page }) => {
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

mainTest(
  qase(202,'PR-16 Fail to change password confirmation does not match'),
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

mainTest(qase(205,'PR-19 Logout from Account'), async ({ page }) => {
  const profilePage = new ProfilePage(page);
  const loginPage = new LoginPage(page);
  await profilePage.logout();
  await loginPage.isLoginPageOpened();
});

mainTest(qase(207,'PR-21 Send feedback email with empty fields'), async ({ page }) => {
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

mainTest(qase(208,'PR-22 Send feedback email with valid data'), async ({ page }) => {
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

test.describe(() => {
  let randomName,email,invite;
  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 30000);
    randomName = random().concat('autotest');
    email = `${process.env.GMAIL_NAME}+${randomName}@gmail.com`;
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);
    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(email);
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.clickOnCreateAccountBtn();

    await registerPage.enterFullName(randomName);
    await registerPage.clickOnAcceptTermsCheckbox();
    await registerPage.clickOnCreateAccountSecondBtn();
    await registerPage.isRegisterEmailCorrect(email);
    invite = await waitMessage(page, email, 40);
    console.log(invite.inviteUrl);
  });

  test(qase(190,'PR-4 Change email to valid'), async ({ page }) => {
    const newEmail = `${process.env.GMAIL_NAME}+${random().concat('autotest')}@gmail.com`;
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await profilePage.changeEmail(newEmail);
    await waitSecondMessage(page, email, 40);
    const changeEmail = await getRegisterMessage(email);
    console.log(changeEmail.inviteUrl);
    await checkNewEmailText(changeEmail.inviteText, randomName, newEmail);
    await page.goto(changeEmail.inviteUrl);
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(newEmail);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  });

});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry)
});
