import { expect } from '@playwright/test';
import { mainTest, registerTest } from 'fixtures';
import { profileTest } from './your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';
import { random } from 'helpers/string-generator';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import {
  getRegisterMessage,
  checkNewEmailText,
  waitSecondMessage,
} from 'helpers/gmail';
import { DashboardPage } from '@pages/dashboard/dashboard-page';

profileTest(
  qase(187, 'Edit profile: profile name and image'),
  async ({ profilePage }) => {
    const newName = random();
    const oldName = 'QA Engineer';

    await profilePage.changeProfileName(newName);
    await profilePage.isSuccessMessageDisplayed('Profile saved successfully!');
    await profilePage.isAccountNameDisplayed(newName);
    await profilePage.changeProfileName(oldName);
    await profilePage.isSuccessMessageDisplayed('Profile saved successfully!');
    await profilePage.isAccountNameDisplayed(oldName);
  },
);

profileTest(
  qase(195, 'Upload profile image and validate'),
  async ({ profilePage }) => {
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
  },
);

profileTest(qase(205, 'Logout from Account'), async ({ page, profilePage }) => {
  const loginPage = new LoginPage(page);
  await profilePage.logout();
  await loginPage.isLoginPageOpened();
});

registerTest(qase(190, 'Change email to valid'), async ({ page, name, email }) => {
  await registerTest.slow();
  const newEmail = `${process.env.GMAIL_NAME}+${random().concat(
    'autotest',
  )}${process.env.GMAIL_DOMAIN}`;
  const dashboardPage = new DashboardPage(page);
  const loginPage = new LoginPage(page);
  const profilePage = new ProfilePage(page);
  await profilePage.changeEmail(newEmail);
  await waitSecondMessage(page, email, 40);
  const changeEmail = await getRegisterMessage(email);
  await checkNewEmailText(changeEmail!.inviteText, name, newEmail);
  await page.goto(changeEmail!.inviteUrl);
  await profilePage.logout();
  await loginPage.isLoginPageOpened();
  await loginPage.enterEmailAndClickOnContinue(newEmail);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  await dashboardPage.isDashboardOpenedAfterLogin();
});
