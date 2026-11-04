import {
  checkRecoveryText,
  checkLastMessageSubject,
  getVerificationMessage,
  waitForMessageCount,
  waitSecondMessage,
} from 'helpers/gmail';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { ForgotPasswordPage } from '@pages/forgot-password-page';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { RegisterPage } from '@pages/register-page';
import { registerTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoCredentialsTest } from './login-signup-fixtures';

let forgotPasswordPage: ForgotPasswordPage;
let loginPage: LoginPage;

demoCredentialsTest.describe('Forgot password form validations', () => {
  demoCredentialsTest.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    forgotPasswordPage = new ForgotPasswordPage(page);

    await loginPage.goto();
    await loginPage.clickOnForgotPassword();
  });

  demoCredentialsTest(
    qase([50], 'Forgot password flow with invalid email'),
    async () => {
      await demoCredentialsTest.step(
        'Verify invalid email prevents password recovery',
        async () => {
          await forgotPasswordPage.enterEmail('xxx');
          await forgotPasswordPage.isRecoverPasswordButtonDisabled();
        },
      );
    },
  );
});

registerTest.describe(() => {
  let dashboardPage: DashboardPage;
  let profilePage: ProfilePage;
  let registerPage: RegisterPage;
  let newPwd: string;

  registerTest.beforeEach(
    'Click on Forgot Password, receive password recovery email, change password and login',
    async ({ page, name, email }) => {
      await registerTest.slow();
      loginPage = new LoginPage(page);
      registerPage = new RegisterPage(page);
      dashboardPage = new DashboardPage(page);
      profilePage = new ProfilePage(page);
      forgotPasswordPage = new ForgotPasswordPage(page);
      newPwd = 'TestForgotPassword123#';

      await profilePage.logout();
      await loginPage.clickOnForgotPassword();
      await forgotPasswordPage.enterEmail(email);
      await forgotPasswordPage.clickRecoverPasswordButton();
      await waitSecondMessage(page, email, 60);

      const forgotPass = await getVerificationMessage(email);
      if (!forgotPass) {
        throw new Error('Password recovery email was not received');
      }

      await checkRecoveryText(forgotPass.inviteText, name);
      await page.goto(forgotPass.inviteUrl);
      await forgotPasswordPage.enterNewPassword(newPwd);
      await forgotPasswordPage.enterConfirmPassword(newPwd);
      await forgotPasswordPage.clickOnChangePasswordButton();
      await loginPage.isLoginPageOpened();
    },
  );

  registerTest(qase([49], 'Forgot password flow'), async ({ page, email }) => {
    await registerTest.step(
      'Verify "Password changed" email is received',
      async () => {
        await waitForMessageCount(page, email, 3, 60);
        await checkLastMessageSubject(email, 'Password changed');
      },
    );

    await registerTest.step('Login with new password after recovery', async () => {
      await loginPage.enterEmailAndClickOnContinue(email);
      await loginPage.enterPwd(newPwd);
      await loginPage.clickLoginButton();
    });

    await registerTest.step('Verify successful login to dashboard', async () => {
      await dashboardPage.isDashboardOpenedAfterLogin();
    });
  });

  registerTest(qase([52], 'Login with old password'), async ({ email }) => {
    await registerTest.step('Attempt to login with old password', async () => {
      await loginPage.enterEmailAndClickOnContinue(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
    });

    await registerTest.step('Verify login fails with old password', async () => {
      await loginPage.isLoginErrorMessageDisplayed(
        'Email or password is incorrect.',
      );
    });
  });
});
