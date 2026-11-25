import { PasswordField } from '@pages/your-account/password-section-component';
import {
  passwordTest,
  yourAccountRegisterTest,
} from '@tests/profile-menu/your-account/your-account-fixture';
import {
  checkPasswordChangedText,
  checkLastMessageSubject,
  getMessageText,
  waitForMessageCount,
} from 'helpers/gmail';
import { qase } from 'playwright-qase-reporter/playwright';

passwordTest(
  qase([198], 'Change password to invalid'),
  async ({ yourAccountPage, currentPassword }) => {
    const { password } = yourAccountPage;
    const newPassword = '1234567';

    await passwordTest.step('Enter current and new invalid password', async () => {
      await password.fillForm(currentPassword, newPassword);
    });

    await passwordTest.step(
      'Verify change password button is disabled and error is shown',
      async () => {
        await password.checkChangePasswordButtonIsDisabled();
        await password.checkError('Password should at least be 8 characters');
      },
    );
  },
);

// Uses a freshly registered account: demo accounts can't receive the
// "Password changed" email.
yourAccountRegisterTest(
  qase([199], 'Change password to valid'),
  async ({ page, name, email, yourAccountPage, loginPage, dashboardPage }) => {
    yourAccountRegisterTest.slow();
    const { password } = yourAccountPage;
    const newPassword = 'TestChangePassword123#';

    await yourAccountRegisterTest.step('Open Your account > Password', async () => {
      await yourAccountPage.open();
      await yourAccountPage.openSection('Password');
      await password.checkIsVisible();
    });

    await yourAccountRegisterTest.step(
      'Enter current and new valid password',
      async () => {
        const currentPassword = process.env.LOGIN_PWD;
        if (!currentPassword) throw new Error('LOGIN_PWD is not set');
        await password.fillForm(currentPassword, newPassword);
      },
    );

    await yourAccountRegisterTest.step(
      'Click "Change password" → success notification is shown',
      async () => {
        await password.submit();
        await yourAccountPage.isSuccessMessageDisplayed(
          'Password saved successfully!',
        );
      },
    );

    await yourAccountRegisterTest.step(
      'A "Password changed" email is received',
      async () => {
        // The first email is the registration one.
        await waitForMessageCount(page, email, 2, 60);
        await checkLastMessageSubject(email, 'Password changed');
        await checkPasswordChangedText(await getMessageText(email), name);
      },
    );

    await yourAccountRegisterTest.step(
      'Log out and log in with the new password → dashboard opens',
      async () => {
        await yourAccountPage.profileMenu.logout();
        await loginPage.enterEmailAndClickOnContinue(email);
        await loginPage.enterPwd(newPassword);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();
      },
    );
  },
);

passwordTest(
  qase([200], 'Show/hide password'),
  async ({ yourAccountPage, currentPassword }) => {
    const { password } = yourAccountPage;
    const newPassword = '1234567890';

    await passwordTest.step('Enter current and new passwords', async () => {
      await password.fillForm(currentPassword, newPassword);
    });

    await passwordTest.step(
      'Show passwords and verify they are visible',
      async () => {
        await password.showPassword(PasswordField.Old);
        await password.checkPasswordIsShown(PasswordField.Old, currentPassword);
        await password.showPassword(PasswordField.New);
        await password.checkPasswordIsShown(PasswordField.New, newPassword);
        await password.showPassword(PasswordField.Confirm);
        await password.checkPasswordIsShown(PasswordField.Confirm, newPassword);
      },
    );

    await passwordTest.step(
      'Hide passwords and verify they are hidden',
      async () => {
        await password.hidePassword(PasswordField.Old);
        await password.checkPasswordIsHidden(PasswordField.Old);
        await password.hidePassword(PasswordField.New);
        await password.checkPasswordIsHidden(PasswordField.New);
        await password.hidePassword(PasswordField.Confirm);
        await password.checkPasswordIsHidden(PasswordField.Confirm);
      },
    );
  },
);

passwordTest(
  qase([202], 'Fail to change password confirmation does not match'),
  async ({ yourAccountPage, currentPassword }) => {
    const { password } = yourAccountPage;
    await passwordTest.step(
      'Enter current password and non-matching new passwords',
      async () => {
        await password.fillForm(currentPassword, 'test12345', 'test54321');
      },
    );

    await passwordTest.step(
      'Verify change password button is disabled and error is shown',
      async () => {
        await password.checkChangePasswordButtonIsDisabled();
        await password.checkError('Confirmation password must match');
      },
    );
  },
);
