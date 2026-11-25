import { expect } from '@playwright/test';
import {
  profileTest,
  yourAccountRegisterTest,
  yourAccountTest,
} from '@tests/profile-menu/your-account/your-account-fixture';
import {
  getVerificationMessage,
  checkNewEmailText,
  waitSecondMessage,
} from 'helpers/gmail';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';

profileTest(
  qase([187], 'Edit profile: profile name and image'),
  async ({ yourAccountPage }) => {
    const newName = random();

    await profileTest.step('Change profile name and verify success', async () => {
      await yourAccountPage.profile.changeName(newName);
      await yourAccountPage.isSuccessMessageDisplayed('Profile saved successfully!');
      await yourAccountPage.profileMenu.checkAccountName(newName);
    });
  },
);

profileTest(
  qase([195, 2958], 'Upload profile image and validate'),
  async ({ yourAccountPage }) => {
    const { profile } = yourAccountPage;

    await profileTest.step(
      '(195) Upload JPEG profile image and verify screenshot',
      async () => {
        await profile.uploadImage('images/sample.jpeg');
        await yourAccountPage.waitInfoMessageHidden();
        await expect(profile.avatarBlock).toHaveScreenshot(
          'profile-avatar-block-jpeg.png',
          {
            mask: [profile.nameInput, profile.emailInput],
          },
        );
      },
    );

    await profileTest.step('(2958) Delete profile picture', async () => {
      await profile.deleteImage();
      await expect(profile.avatarBlock).toHaveScreenshot(
        'profile-avatar-deleted.png',
        {
          mask: [profile.nameInput, profile.emailInput],
        },
      );
    });
  },
);

profileTest(
  qase([205], 'Logout from Account'),
  async ({ yourAccountPage, loginPage }) => {
    await profileTest.step('Logout from account', async () => {
      await yourAccountPage.profileMenu.logout();
    });

    await profileTest.step('Verify login page is displayed', async () => {
      await loginPage.isLoginPageOpened();
    });
  },
);

// yourAccountTest rather than profileTest: no need to rename the user,
// and `demoAccount` gives the credentials to check they no longer work.
yourAccountTest(
  qase([211], 'Delete account'),
  async ({ yourAccountPage, loginPage, demoAccount }) => {
    await yourAccountTest.step('Open Your account', async () => {
      await yourAccountPage.open();
    });

    await yourAccountTest.step(
      'Click "Want to remove your account?" → confirmation modal with "Cancel and keep my account" and "Yes, delete my account"',
      async () => {
        await yourAccountPage.profile.openDeleteAccountModal();
        await yourAccountPage.profile.checkDeleteAccountModalButtonsAreVisible();
      },
    );

    await yourAccountTest.step(
      'Click "Yes, delete my account" → redirected to the login page',
      async () => {
        await yourAccountPage.profile.confirmDeleteAccount();
        await loginPage.isLoginPageUrlShown();
        await loginPage.isLoginPageOpened();
      },
    );

    await yourAccountTest.step(
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

yourAccountRegisterTest(
  qase([190], 'Change email to valid'),
  async ({ page, name, email, yourAccountPage, loginPage, dashboardPage }) => {
    await yourAccountRegisterTest.slow();
    const newEmail = `${process.env.GMAIL_NAME}+${random().concat(
      'autotest',
    )}${process.env.GMAIL_DOMAIN}`;

    await yourAccountRegisterTest.step(
      'Request email change and wait for confirmation email',
      async () => {
        await yourAccountPage.open();
        await yourAccountPage.profile.changeEmail(newEmail);
        await waitSecondMessage(page, email, 40);
      },
    );

    await yourAccountRegisterTest.step(
      'Verify confirmation email content and follow the link',
      async () => {
        const changeEmail = await getVerificationMessage(email);
        if (!changeEmail) throw new Error('Email confirmation not received');
        await checkNewEmailText(changeEmail.inviteText, name, newEmail);
        await page.goto(changeEmail.inviteUrl);
      },
    );

    await yourAccountRegisterTest.step(
      'Logout and login with new email',
      async () => {
        await yourAccountPage.profileMenu.logout();
        await loginPage.enterEmailAndClickOnContinue(newEmail);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
      },
    );

    await yourAccountRegisterTest.step('Verify dashboard is opened', async () => {
      await dashboardPage.isDashboardOpenedAfterLogin();
      await dashboardPage.isHeaderDisplayed('Personal Projects');
    });
  },
);
