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

    await profileTest.step('Change profile name and verify success', async () => {
      await profilePage.changeProfileName(newName);
      await profilePage.isSuccessMessageDisplayed('Profile saved successfully!');
      await profilePage.isAccountNameDisplayed(newName);
    });

    await profileTest.step('Restore profile name and verify success', async () => {
      await profilePage.changeProfileName(oldName);
      await profilePage.isSuccessMessageDisplayed('Profile saved successfully!');
      await profilePage.isAccountNameDisplayed(oldName);
    });
  },
);

profileTest(
  qase(195, 'Upload profile image and validate'),
  async ({ profilePage }) => {
    await profileTest.step(
      'Upload PNG profile image and verify screenshot',
      async () => {
        await profilePage.uploadProfileImage('images/images.png');
        await profilePage.waitInfoMessageHidden();
        await expect(profilePage.profileAvatarBlock).toHaveScreenshot(
          'profile-avatar-block-png.png',
          {
            mask: [profilePage.profileNameInput, profilePage.profileEmailInput],
          },
        );
      },
    );

    await profileTest.step(
      'Upload JPEG profile image and verify screenshot',
      async () => {
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
  },
);

profileTest(qase(205, 'Logout from Account'), async ({ page, profilePage }) => {
  const loginPage = new LoginPage(page);

  await profileTest.step('Logout from account', async () => {
    await profilePage.logout();
  });

  await profileTest.step('Verify login page is displayed', async () => {
    await loginPage.isLoginPageOpened();
  });
});

registerTest(qase(190, 'Change email to valid'), async ({ page, name, email }) => {
  await registerTest.slow();
  const newEmail = `${process.env.GMAIL_NAME}+${random().concat(
    'autotest',
  )}${process.env.GMAIL_DOMAIN}`;
  const dashboardPage = new DashboardPage(page);
  const loginPage = new LoginPage(page);
  const profilePage = new ProfilePage(page);

  await registerTest.step(
    'Request email change and wait for confirmation email',
    async () => {
      await profilePage.changeEmail(newEmail);
      await waitSecondMessage(page, email, 40);
    },
  );

  await registerTest.step(
    'Verify confirmation email content and follow the link',
    async () => {
      const changeEmail = await getRegisterMessage(email);
      if (!changeEmail) throw new Error('Email confirmation not received');
      await checkNewEmailText(changeEmail.inviteText, name, newEmail);
      await page.goto(changeEmail.inviteUrl);
    },
  );

  await registerTest.step('Logout and login with new email', async () => {
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(newEmail);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
  });

  await registerTest.step('Verify dashboard is opened', async () => {
    await dashboardPage.isDashboardOpenedAfterLogin();
  });
});
