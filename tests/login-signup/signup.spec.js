const { test } = require('@playwright/test');
const { LoginPage } = require('../../pages/login-page.js');
const { RegisterPage } = require('../../pages/register-page.js');
const { updateTestResults } = require('../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { random } = require('../../helpers/string-generator.js');
const { checkRegisterText, waitMessage } = require('../../helpers/gmail.js');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page.js');
const { TeamPage } = require('../../pages/dashboard/team-page.js');

let loginPage, registerPage, dashboardPage, teamPage;

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
  let randomName, email, invite;
  test.beforeEach('Create a new account', async ({ page }) => {
    randomName = random().concat('autotest');
    email = `${process.env.GMAIL_NAME}+${randomName}${process.env.GMAIL_DOMAIN}`;
    await registerPage.registerAccount(randomName, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
    invite = await waitMessage(page, email, 40);
  });

  test(qase(28, 'Sign up with an email address'), async ({ page }) => {
    await checkRegisterText(invite.inviteText, randomName);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingFirstQuestions();
  });

  test(
    qase(46, 'Add multiple members to your team from Onboarding modal'),
    async ({ page }) => {
      await page.goto(invite.inviteUrl);
      await dashboardPage.fillOnboardingFirstQuestions();
      await dashboardPage.skipWhatNewsPopUp();
      await dashboardPage.enterOnboardingTeamName(randomName);
      const rand1 = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${rand1}${process.env.GMAIL_DOMAIN}`;
      const rand2 = random().concat('autotest');
      const secondEmail = `${process.env.GMAIL_NAME}+${rand2}${process.env.GMAIL_DOMAIN}`;
      const emails = `${firstEmail}, ${secondEmail}`;
      await dashboardPage.enterOnboardingInviteEmails(emails);
      await dashboardPage.clickOnOnboardingCreateTeamButton();
      await teamPage.isTeamSelected(randomName);
    },
  );

  test(
    qase([2245], 'Creating a team without member invitation after first login'),
    async ({ page }) => {
      await page.goto(invite.inviteUrl);
      await dashboardPage.fillOnboardingFirstQuestions();
      await dashboardPage.skipWhatNewsPopUp();
      await dashboardPage.enterOnboardingTeamName(randomName);
      await dashboardPage.clickOnOnboardingCreateEmptyTeamButton();
      await teamPage.isTeamSelected(randomName);
    },
  );
});

test.describe('Create Account form negative cases', () => {
  test(qase(32, 'Sign up with invalid email address'), async () => {
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmailAndClickOnContinue('test.com');
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.isEmailInputErrorDisplayed('Enter a valid email please');
    await registerPage.isCreateAccountButtonVisible();
    await registerPage.isCreateAccountButtonDisabled();
  });

  test(qase(33, 'Sign up with no password'), async () => {
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
    await registerPage.clickOnPasswordInput();
    await registerPage.clickOnHeader();
    await registerPage.isPasswordInputHintVisible();
    await registerPage.isCreateAccountButtonVisible();
    await registerPage.isCreateAccountButtonDisabled();
  });

  test(qase(34, 'Sign up with incorrect password'), async () => {
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
    await registerPage.enterPassword('1234');
    await registerPage.isPasswordInputErrorDisplayed(
      'Password should at least be 8 characters',
    );
    await registerPage.isCreateAccountButtonVisible();
    await registerPage.isCreateAccountButtonDisabled();
  });
});

test(qase(36, 'Create demo account'), async () => {
  await registerPage.isRegisterPageOpened();
  await registerPage.clickOnCreateDemoAccountButton();
  await dashboardPage.fillOnboardingQuestions();
  await dashboardPage.isHeaderDisplayed('Projects');
});

test(qase(54, 'Sign up with email of existing user'), async () => {
  const email = process.env.LOGIN_EMAIL;
  await registerPage.registerAccount('test', email, process.env.LOGIN_PWD);
  await registerPage.isRegisterEmailCorrect(email);
});

test.afterEach(async ({}, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry);
});
