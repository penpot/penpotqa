const { passwordTest } = require('./your-account-fixture');
const { qase } = require('playwright-qase-reporter/playwright');

passwordTest(qase(198, 'Change password to invalid'), async ({ profilePage }) => {
  const newPassword = '1234567';
  await profilePage.enterCurrentPassword(process.env.LOGIN_PWD);
  await profilePage.enterNewPassword(newPassword);
  await profilePage.enterConfirmPassword(newPassword);
  await profilePage.isChangePasswordButtonDisabled();
  await profilePage.isPasswordInputErrorDisplayed(
    'Password should at least be 8 characters',
  );
});

passwordTest(qase(200, 'Show/hide password'), async ({ profilePage }) => {
  const newPassword = '1234567890';
  await profilePage.enterCurrentPassword(process.env.LOGIN_PWD);
  await profilePage.enterNewPassword(newPassword);
  await profilePage.enterConfirmPassword(newPassword);

  // Show passwords
  await profilePage.clickOnShowPasswordIcon(profilePage.oldPasswordContainer);
  await profilePage.isPasswordShown(
    profilePage.passwordOldInput,
    process.env.LOGIN_PWD,
  );
  await profilePage.clickOnShowPasswordIcon(profilePage.newPasswordContainer);
  await profilePage.isPasswordShown(profilePage.passwordNewInput, newPassword);
  await profilePage.clickOnShowPasswordIcon(profilePage.confirmPasswordContainer);
  await profilePage.isPasswordShown(profilePage.passwordConfirmInput, newPassword);

  // Hide passwords
  await profilePage.clickOnHidePasswordIcon(profilePage.oldPasswordContainer);
  await profilePage.isPasswordHidden(profilePage.passwordOldInput);
  await profilePage.clickOnHidePasswordIcon(profilePage.newPasswordContainer);
  await profilePage.isPasswordHidden(profilePage.passwordNewInput);
  await profilePage.clickOnHidePasswordIcon(profilePage.confirmPasswordContainer);
  await profilePage.isPasswordHidden(profilePage.passwordConfirmInput);
});

passwordTest(
  qase(202, 'Fail to change password confirmation does not match'),
  async ({ profilePage }) => {
    await profilePage.enterCurrentPassword(process.env.LOGIN_PWD);
    await profilePage.enterNewPassword('test12345');
    await profilePage.enterConfirmPassword('test54321');
    await profilePage.isChangePasswordButtonDisabled();
    await profilePage.isPasswordInputErrorDisplayed(
      'Confirmation password must match',
    );
  },
);
