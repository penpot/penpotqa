import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { test } from '@playwright/test';
import { checkRegisterText, waitMessage } from 'helpers/gmail';
import { random } from 'helpers/string-generator';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

type InviteMessage = {
  inviteText: string;
  inviteUrl: string;
};

let dashboardPage: DashboardPage;
let loginPage: LoginPage;
let registerPage: RegisterPage;
let teamPage: TeamPage;

test.beforeEach('Navigate to "Create an account page"', async ({ page }) => {
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);

  await loginPage.goto();
  await loginPage.acceptCookie();
  await loginPage.clickOnCreateAccount();
});

test.describe('Sign up via email invitation', () => {
  let email: string;
  let invite: InviteMessage;
  let randomName: string;

  test.beforeEach('Create a new account', async ({ page }) => {
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

  test(qase([28], 'Sign up with an email address'), async ({ page }) => {
    await test.step('Verify registration email content', async () => {
      await checkRegisterText(invite.inviteText, randomName);
    });

    await test.step('Open invitation link and complete onboarding', async () => {
      await page.goto(invite.inviteUrl);
      await dashboardPage.fillOnboardingFirstQuestions();
    });
  });

  test(
    qase([46], 'Add multiple members to your team from Onboarding modal'),
    async ({ page }) => {
      const rand1 = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${rand1}${process.env.GMAIL_DOMAIN}`;
      const rand2 = random().concat('autotest');
      const secondEmail = `${process.env.GMAIL_NAME}+${rand2}${process.env.GMAIL_DOMAIN}`;
      const emails = `${firstEmail}, ${secondEmail}`;

      await test.step('Open invitation link and reach onboarding team step', async () => {
        await page.goto(invite.inviteUrl);
        await dashboardPage.fillOnboardingFirstQuestions();
        await dashboardPage.skipWhatNewsPopUp();
        await dashboardPage.enterOnboardingTeamName(randomName);
      });

      await test.step('Invite two members and create the team', async () => {
        await dashboardPage.enterOnboardingInviteEmails(emails);
        await dashboardPage.clickOnOnboardingCreateTeamButton();
      });

      await test.step('Verify the new team is selected', async () => {
        await teamPage.isTeamSelected(randomName);
      });
    },
  );

  test(
    qase([2245], 'Creating a team without member invitation after first login'),
    async ({ page }) => {
      await test.step('Open invitation link and reach onboarding team step', async () => {
        await page.goto(invite.inviteUrl);
        await dashboardPage.fillOnboardingFirstQuestions();
        await dashboardPage.skipWhatNewsPopUp();
        await dashboardPage.enterOnboardingTeamName(randomName);
        await dashboardPage.isOnboardingCreateTeamButtonActive();
      });

      await test.step('Create the team without invitations', async () => {
        await dashboardPage.clickOnOnboardingCreateEmptyTeamButton();
        await dashboardPage.isOnboardingTeamModalNotVisible();
      });

      await test.step('Verify the new team is selected', async () => {
        await teamPage.isTeamSelected(randomName);
      });
    },
  );
});

test.describe('Create Account form negative cases', () => {
  test(qase([32], 'Sign up with invalid email address'), async () => {
    await test.step('Enter an invalid email address', async () => {
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmailAndClickOnContinue('test.com');
      await registerPage.enterPassword(process.env.LOGIN_PWD);
    });

    await test.step('Verify validation prevents account creation', async () => {
      await registerPage.isEmailInputErrorDisplayed('Enter a valid email please');
      await registerPage.isCreateAccountButtonVisible();
      await registerPage.isCreateAccountButtonDisabled();
    });
  });

  test(qase([33], 'Sign up with no password'), async () => {
    await test.step('Leave password empty after entering a valid email', async () => {
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
      await registerPage.clickOnPasswordInput();
      await registerPage.clickOnHeader();
    });

    await test.step('Verify password hint and disabled submit button', async () => {
      await registerPage.isPasswordInputHintVisible();
      await registerPage.isCreateAccountButtonVisible();
      await registerPage.isCreateAccountButtonDisabled();
    });
  });

  test(qase([34], 'Sign up with incorrect password'), async () => {
    await test.step('Enter a password shorter than the minimum length', async () => {
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
      await registerPage.enterPassword('1234');
    });

    await test.step('Verify password validation prevents account creation', async () => {
      await registerPage.isPasswordInputErrorDisplayed(
        'Password should at least be 8 characters',
      );
      await registerPage.isCreateAccountButtonVisible();
      await registerPage.isCreateAccountButtonDisabled();
    });
  });
});

test(qase([36], 'Create demo account'), async () => {
  await test.step('Create a demo account from the register page', async () => {
    await registerPage.isRegisterPageOpened();
    await registerPage.clickOnCreateDemoAccountButton();
    await dashboardPage.fillOnboardingQuestions();
  });

  await test.step('Verify the dashboard is opened', async () => {
    await dashboardPage.isHeaderDisplayed('Projects');
  });
});

test(qase([54], 'Sign up with email of existing user'), async () => {
  const email = process.env.LOGIN_EMAIL;

  await test.step('Attempt to register with an existing email', async () => {
    await registerPage.registerAccount('test', email, process.env.LOGIN_PWD);
  });

  await test.step('Verify the existing user error is displayed', async () => {
    await registerPage.isEmailAlreadyUsedErrorDisplayed();
  });
});
