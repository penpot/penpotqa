import { test } from '@playwright/test';
import {
  checkRecoveryText,
  getVerificationMessage,
  waitSecondMessage,
} from 'helpers/gmail';
import { random } from 'helpers/string-generator';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { ForgotPasswordPage } from '@pages/forgot-password-page';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { RegisterPage } from '@pages/register-page';
import { registerTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let forgotPasswordPage: ForgotPasswordPage;
let loginPage: LoginPage;

test.describe('Forgot password form validations', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    forgotPasswordPage = new ForgotPasswordPage(page);

    await loginPage.goto();
    await loginPage.clickOnForgotPassword();
  });

  test(qase([50], 'Forgot password flow with invalid email'), async () => {
    await test.step('Verify invalid email prevents password recovery', async () => {
      await forgotPasswordPage.enterEmail('xxx');
      await forgotPasswordPage.isRecoverPasswordButtonDisabled();
    });
  });

  test(qase([51], 'Forgot password flow with non existed email'), async () => {
    const email = `${process.env.GMAIL_NAME}autotest+${random()}${process.env.GMAIL_DOMAIN}`;

    await test.step('Verify non-existent email prevents password recovery', async () => {
      await forgotPasswordPage.enterEmail(email);
      await forgotPasswordPage.clickRecoverPasswordButton();
      await forgotPasswordPage.isRecoverPasswordButtonDisabled();
    });
  });
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
      newPwd = 'TestForgotPassword123';

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
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

  registerTest(qase([49], 'Forgot password flow'), async ({ email }) => {
    await test.step('Login with new password after recovery', async () => {
      await loginPage.enterEmailAndClickOnContinue(email);
      await loginPage.enterPwd(newPwd);
      await loginPage.clickLoginButton();
    });

    await test.step('Verify successful login to dashboard', async () => {
      await dashboardPage.isDashboardOpenedAfterLogin();
    });
  });

  registerTest(qase([52], 'Login with old password'), async ({ email }) => {
    await test.step('Attempt to login with old password', async () => {
      await loginPage.enterEmailAndClickOnContinue(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
    });

    await test.step('Verify login fails with old password', async () => {
      await loginPage.isLoginErrorMessageDisplayed(
        'Email or password is incorrect.',
      );
    });
  });
});
