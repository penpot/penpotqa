import { test } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { waitMessage } from 'helpers/gmail';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';

type InviteMessage = {
  inviteUrl: string;
};

let dashboardPage: DashboardPage;
let loginPage: LoginPage;
let registerPage: RegisterPage;

test.describe(() => {
  let email: string;
  let invite: InviteMessage;
  let randomName: string;

  test.beforeEach(async ({ page }) => {
    await test.slow();
    randomName = random().concat('autotest');
    email = `${process.env.GMAIL_NAME}+${randomName}${process.env.GMAIL_DOMAIN}`;
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    dashboardPage = new DashboardPage(page);

    await test.step('Create account and open onboarding survey', async () => {
      await loginPage.goto();
      await loginPage.acceptCookie();
      await loginPage.clickOnCreateAccount();
      await registerPage.registerAccount(randomName, email, process.env.LOGIN_PWD);
      await registerPage.isRegisterEmailCorrect(email);
      const inviteMessage = await waitMessage(page, email, 40);
      if (!inviteMessage?.inviteUrl) {
        throw new Error('Survey invitation email was not received');
      }
      invite = { inviteUrl: inviteMessage.inviteUrl };
      await page.goto(invite.inviteUrl);
    });
  });

  test(
    qase(
      [1802, 1813],
      'Reload the page while questions survey is opened, Press "ESC" button to close question slides',
    ),
    async () => {
      await test.step('Answer onboarding questions and reload page', async () => {
        await dashboardPage.selectRadioButton('Work');
        await dashboardPage.selectLastDropdownOptions();
        await dashboardPage.reloadPage();
      });

      await test.step('Verify survey remains visible and ESC does not close it', async () => {
        await dashboardPage.isOnboardingFirstQuestionsVisible();
        await dashboardPage.clickOnESC();
        await dashboardPage.isOnboardingFirstQuestionsVisible();
      });
    },
  );

  test(
    qase(
      [1805],
      'Select any option, click "Next" button and comebacks to previous question',
    ),
    async () => {
      await test.step('Select options and navigate to the next question', async () => {
        await dashboardPage.selectRadioButton('Work');
        await dashboardPage.selectKindOfWork('Development');
        await dashboardPage.clickOnNextButton();
      });

      await test.step('Go back and verify previous selections are preserved', async () => {
        await dashboardPage.clickOnPrevButton();
        await dashboardPage.checkRadioButtonLabel('Work');
        await dashboardPage.checkDropdownValue('Development');
      });
    },
  );
});
