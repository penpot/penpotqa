import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { checkRegisterText, waitMessage } from 'helpers/gmail';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoCredentialsTest } from './login-signup-fixtures';

type InviteMessage = {
  inviteText: string;
  inviteUrl: string;
};

let dashboardPage: DashboardPage;
let loginPage: LoginPage;
let registerPage: RegisterPage;

demoCredentialsTest.beforeEach(
  'Navigate to "Create an account page"',
  async ({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
  },
);

demoCredentialsTest.describe('Sign up via email invitation', () => {
  let email: string;
  let invite: InviteMessage;
  let randomName: string;

  demoCredentialsTest.beforeEach('Create a new account', async ({ page }) => {
    randomName = createTeamName();
    email = `${process.env.GMAIL_NAME}+${randomName}${process.env.GMAIL_DOMAIN}`;

    await registerPage.registerAccount(randomName, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);

    const registerInvite = await waitMessage(page, email, 40);
    if (!registerInvite?.inviteText || !registerInvite?.inviteUrl) {
      throw new Error('Registration email confirmation was not received');
    }

    invite = {
      inviteText: registerInvite.inviteText,
      inviteUrl: registerInvite.inviteUrl,
    };
  });

  demoCredentialsTest(
    qase([28], 'Sign up with an email address'),
    async ({ page }) => {
      await demoCredentialsTest.step(
        'Verify registration email content',
        async () => {
          await checkRegisterText(invite.inviteText, randomName);
        },
      );

      await demoCredentialsTest.step(
        'Open invitation link and complete onboarding',
        async () => {
          await page.goto(invite.inviteUrl);
          await dashboardPage.fillOnboardingFirstQuestions();
        },
      );
    },
  );
});

demoCredentialsTest.describe('Create Account form negative cases', () => {
  demoCredentialsTest(qase([32], 'Sign up with invalid email address'), async () => {
    await demoCredentialsTest.step('Enter an invalid email address', async () => {
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmailAndClickOnContinue('test.com');
      await registerPage.enterPassword(process.env.LOGIN_PWD);
    });

    await demoCredentialsTest.step(
      'Verify validation prevents account creation',
      async () => {
        await registerPage.isEmailInputErrorVisible('Enter a valid email please');
        await registerPage.isCreateAccountButtonVisible();
        await registerPage.isCreateAccountButtonDisabled();
      },
    );
  });

  demoCredentialsTest(
    qase([33], 'Sign up with no password'),
    async ({ demoAccount }) => {
      await demoCredentialsTest.step(
        'Leave password empty after entering a valid email',
        async () => {
          await registerPage.isRegisterPageOpened();
          await registerPage.enterEmailAndClickOnContinue(demoAccount.email);
          await registerPage.clickOnPasswordInput();
          await registerPage.clickOnHeader();
        },
      );

      await demoCredentialsTest.step(
        'Verify password hint and disabled submit button',
        async () => {
          await registerPage.isPasswordInputHintVisible();
          await registerPage.isCreateAccountButtonVisible();
          await registerPage.isCreateAccountButtonDisabled();
        },
      );
    },
  );

  demoCredentialsTest(
    qase([34], 'Sign up with incorrect password'),
    async ({ demoAccount }) => {
      await demoCredentialsTest.step(
        'Enter a password shorter than the minimum length',
        async () => {
          await registerPage.isRegisterPageOpened();
          await registerPage.enterEmailAndClickOnContinue(demoAccount.email);
          await registerPage.enterPassword('1234');
        },
      );

      await demoCredentialsTest.step(
        'Verify password validation prevents account creation',
        async () => {
          await registerPage.isPasswordInputErrorDisplayed(
            'Password should at least be 8 characters',
          );
          await registerPage.isCreateAccountButtonVisible();
          await registerPage.isCreateAccountButtonDisabled();
        },
      );
    },
  );
});

demoCredentialsTest(qase([36], 'Create demo account'), async () => {
  await demoCredentialsTest.step(
    'Create a demo account from the register page',
    async () => {
      await registerPage.isRegisterPageOpened();
      await registerPage.clickOnCreateDemoAccountButton();
      await dashboardPage.fillOnboardingQuestions();
    },
  );

  await demoCredentialsTest.step('Verify the dashboard is opened', async () => {
    await dashboardPage.isHeaderDisplayed('Personal Projects');
  });
});

demoCredentialsTest(
  qase([54], 'Sign up with email of existing user'),
  async ({ demoAccount }) => {
    const { email } = demoAccount;

    await demoCredentialsTest.step(
      'Attempt to register with an existing email',
      async () => {
        await registerPage.registerAccount('test', email, process.env.LOGIN_PWD);
      },
    );

    await demoCredentialsTest.step(
      'Verify the existing user error is displayed',
      async () => {
        await registerPage.isEmailInputErrorVisible('Email already used');
        await registerPage.isToastNotDisplayed();
        await registerPage.isCreateAccountButtonDisabled();
      },
    );

    await demoCredentialsTest.step(
      'Change the email and verify the error disappears',
      async () => {
        await registerPage.enterEmail(`changed.${email}`);
        await registerPage.isEmailInputErrorNotVisible();
        await registerPage.isCreateAccountButtonEnabled();
      },
    );
  },
);
