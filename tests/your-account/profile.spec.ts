import { expect } from '@playwright/test';
import { demoAccountApiFixture, registerTest } from 'fixtures';
import { profileTest } from './your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';
import { random } from 'helpers/string-generator';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import {
  getVerificationMessage,
  checkNewEmailText,
  waitSecondMessage,
} from 'helpers/gmail';
import { DashboardPage } from '@pages/dashboard/dashboard-page';

profileTest(
  qase(187, 'Edit profile: profile name and image'),
  async ({ profilePage }) => {
    const newName = random();

    await profileTest.step('Change profile name and verify success', async () => {
      await profilePage.changeProfileName(newName);
      await profilePage.isSuccessMessageDisplayed('Profile saved successfully!');
      await profilePage.isAccountNameDisplayed(newName);
    });
  },
);

profileTest(
  qase([195, 2958], 'Upload profile image and validate'),
  async ({ profilePage }) => {
    await profileTest.step(
      '(195) Upload JPEG profile image and verify screenshot',
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

    await profileTest.step('(2958) Delete profile picture', async () => {
      await profilePage.deleteProfileImage();
      await expect(profilePage.profileAvatarBlock).toHaveScreenshot(
        'profile-avatar-deleted.png',
        {
          mask: [profilePage.profileNameInput, profilePage.profileEmailInput],
        },
      );
    });
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

// Plain demoAccountApiFixture rather than profileTest: no need to rename the user,
// and `demoAccount` gives the credentials to check they no longer work.
demoAccountApiFixture(
  qase([211], 'Delete account'),
  async ({ page, demoAccount }) => {
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);

    await demoAccountApiFixture.step('Open Your account', async () => {
      await profilePage.openYourAccountPage();
      await profilePage.isHeaderDisplayed('Your account');
    });

    await demoAccountApiFixture.step(
      'Click "Want to remove your account?" → confirmation modal with "Cancel and keep my account" and "Yes, delete my account"',
      async () => {
        await profilePage.clickOnWantToRemoveAccountLink();
        await profilePage.isDeleteAccountModalButtonsVisible();
      },
    );

    await demoAccountApiFixture.step(
      'Click "Yes, delete my account" → redirected to the login page',
      async () => {
        await profilePage.clickOnConfirmDeleteAccountButton();
        await loginPage.isLoginPageUrlShown();
        await loginPage.isLoginPageOpened();
      },
    );

    await demoAccountApiFixture.step(
      'The account is deleted → logging in with its credentials fails',
      async () => {
        await loginPage.enterEmailAndClickOnContinue(demoAccount.email);
        await loginPage.enterPwd(demoAccount.password);
        await loginPage.clickLoginButton();
        await loginPage.isLoginErrorMessageDisplayed(
          'Email or password is incorrect.',
        );
      },
    );
  },
);

registerTest(
  qase(190, 'Change email to valid'),
  { tag: '@external' },
  async ({ page, name, email }) => {
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
        const changeEmail = await getVerificationMessage(email);
        if (!changeEmail) throw new Error('Email confirmation not received');
        await checkNewEmailText(changeEmail.inviteText, name, newEmail);
        await page.goto(changeEmail.inviteUrl);
      },
    );

    await registerTest.step('Logout and login with new email', async () => {
      await profilePage.logout();
      await loginPage.enterEmailAndClickOnContinue(newEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
    });

    await registerTest.step('Verify dashboard is opened', async () => {
      await dashboardPage.isDashboardOpenedAfterLogin();
      await dashboardPage.isHeaderDisplayed('Personal Projects');
    });
  },
);
