import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { expect } from '@playwright/test';
import { registerTest } from 'fixtures';
import {
  checkPasswordChangedText,
  getMessageSubject,
  getMessageText,
  waitForMessageCount,
} from 'helpers/gmail';
import { qase } from 'playwright-qase-reporter/playwright';
import { passwordTest } from './your-account-fixture';

passwordTest(
  qase(198, 'Change password to invalid'),
  async ({ profilePage, demoAccountPassword }) => {
    const newPassword = '1234567';

    await passwordTest.step('Enter current and new invalid password', async () => {
      await profilePage.enterCurrentPassword(demoAccountPassword);
      await profilePage.enterNewPassword(newPassword);
      await profilePage.enterConfirmPassword(newPassword);
    });

    await passwordTest.step(
      'Verify change password button is disabled and error is shown',
      async () => {
        await profilePage.isChangePasswordButtonDisabled();
        await profilePage.isPasswordInputErrorDisplayed(
          'Password should at least be 8 characters',
        );
      },
    );
  },
);

// Uses a freshly registered account: changing the password of the shared
// LOGIN_EMAIL account would break the other tests, and demo accounts can't
// receive the "Password changed" email.
registerTest(
  qase([199], 'Change password to valid'),
  async ({ page, name, email }) => {
    registerTest.slow();
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    const newPassword = 'TestChangePassword123#';

    await registerTest.step('Open Your account > Password', async () => {
      await profilePage.openYourAccountPage();
      await profilePage.isHeaderDisplayed('Your account');
      await profilePage.openPasswordPageInAccount();
    });

    await registerTest.step('Enter current and new valid password', async () => {
      await profilePage.enterCurrentPassword(process.env.LOGIN_PWD);
      await profilePage.enterNewPassword(newPassword);
      await profilePage.enterConfirmPassword(newPassword);
    });

    await registerTest.step(
      'Click "Change password" → success notification is shown',
      async () => {
        await profilePage.clickChangePasswordButton();
        await profilePage.isSuccessMessageDisplayed('Password saved successfully!');
      },
    );

    await registerTest.step('A "Password changed" email is received', async () => {
      // The first email is the registration one.
      await waitForMessageCount(page, email, 2, 60);
      const subject = await getMessageSubject(email);
      expect(subject, 'Last email subject should be "Password changed"').toContain(
        'Password changed',
      );
      await checkPasswordChangedText(await getMessageText(email), name);
    });

    await registerTest.step(
      'Log out and log in with the new password → dashboard opens',
      async () => {
        await profilePage.logout();
        await loginPage.enterEmailAndClickOnContinue(email);
        await loginPage.enterPwd(newPassword);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();
      },
    );
  },
);

passwordTest(
  qase(200, 'Show/hide password'),
  async ({ profilePage, demoAccountPassword }) => {
    const newPassword = '1234567890';

    await passwordTest.step('Enter current and new passwords', async () => {
      await profilePage.enterCurrentPassword(demoAccountPassword);
      await profilePage.enterNewPassword(newPassword);
      await profilePage.enterConfirmPassword(newPassword);
    });

    await passwordTest.step(
      'Show passwords and verify they are visible',
      async () => {
        await profilePage.clickOnShowPasswordIcon(profilePage.oldPasswordContainer);
        await profilePage.isPasswordShown(
          profilePage.passwordOldInput,
          demoAccountPassword,
        );
        await profilePage.clickOnShowPasswordIcon(profilePage.newPasswordContainer);
        await profilePage.isPasswordShown(profilePage.passwordNewInput, newPassword);
        await profilePage.clickOnShowPasswordIcon(
          profilePage.confirmPasswordContainer,
        );
        await profilePage.isPasswordShown(
          profilePage.passwordConfirmInput,
          newPassword,
        );
      },
    );

    await passwordTest.step(
      'Hide passwords and verify they are hidden',
      async () => {
        await profilePage.clickOnHidePasswordIcon(profilePage.oldPasswordContainer);
        await profilePage.isPasswordHidden(profilePage.passwordOldInput);
        await profilePage.clickOnHidePasswordIcon(profilePage.newPasswordContainer);
        await profilePage.isPasswordHidden(profilePage.passwordNewInput);
        await profilePage.clickOnHidePasswordIcon(
          profilePage.confirmPasswordContainer,
        );
        await profilePage.isPasswordHidden(profilePage.passwordConfirmInput);
      },
    );
  },
);

passwordTest(
  qase(202, 'Fail to change password confirmation does not match'),
  async ({ profilePage, demoAccountPassword }) => {
    await passwordTest.step(
      'Enter current password and non-matching new passwords',
      async () => {
        await profilePage.enterCurrentPassword(demoAccountPassword);
        await profilePage.enterNewPassword('test12345');
        await profilePage.enterConfirmPassword('test54321');
      },
    );

    await passwordTest.step(
      'Verify change password button is disabled and error is shown',
      async () => {
        await profilePage.isChangePasswordButtonDisabled();
        await profilePage.isPasswordInputErrorDisplayed(
          'Confirmation password must match',
        );
      },
    );
  },
);
