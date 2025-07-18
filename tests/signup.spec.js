const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { RegisterPage } = require('../pages/register-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { random } = require('../helpers/string-generator');
const { checkRegisterText, waitMessage } = require('../helpers/gmail');
const { DashboardPage } = require('../pages/dashboard/dashboard-page');
const { TeamPage } = require('../pages/dashboard/team-page');

let loginPage, registerPage, dashboardPage, teamPage;

test.describe(() => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    dashboardPage = new DashboardPage(page);
    teamPage = new TeamPage(page);

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
  });

  test(qase(32, 'ON-5 Sign up with invalid email address'), async () => {
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail('test.com');
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.isEmailInputErrorDisplayed('Enter a valid email please');
    await registerPage.isCreateAccountBtnDisplayed();
    await registerPage.isCreateAccountBtnDisabled();
  });

  test(qase(33, 'ON-6 Sign up with no password'), async () => {
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(process.env.LOGIN_EMAIL);
    await registerPage.clickOnPasswordInput();
    await registerPage.clickOnHeader();
    await registerPage.isPasswordInputHintDisplayed('At least 8 characters');
    await registerPage.isCreateAccountBtnDisplayed();
    await registerPage.isCreateAccountBtnDisabled();
  });

  test(qase(34, 'ON-7 Sign up with incorrect password'), async () => {
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(process.env.LOGIN_EMAIL);
    await registerPage.enterPassword('1234');
    await registerPage.isPasswordInputErrorDisplayed(
      'Password should at least be 8 characters',
    );
    await registerPage.isCreateAccountBtnDisplayed();
    await registerPage.isCreateAccountBtnDisabled();
  });

  test.describe(() => {
    let randomName, email, invite;
    test.beforeEach(async ({ page }) => {
      await test.slow();
      randomName = random().concat('autotest');
      email = `${process.env.GMAIL_NAME}+${randomName}@gmail.com`;
      await registerPage.registerAccount(randomName, email, process.env.LOGIN_PWD);
      await registerPage.isRegisterEmailCorrect(email);
      invite = await waitMessage(page, email, 40);
    });

    test(qase(28, 'ON-1 Sign up with an email address'), async ({ page }) => {
      await checkRegisterText(invite.inviteText, randomName);
      await page.goto(invite.inviteUrl);
      await dashboardPage.fillOnboardingFirstQuestions();
    });

    test(qase([43, 44], 'ON-16,17 Onboarding questions flow'), async ({ page }) => {
      await page.goto(invite.inviteUrl);
      await dashboardPage.fillOnboardingFirstQuestions();
      await dashboardPage.skipWhatNewsPopUp();
      await dashboardPage.enterOnboardingTeamName(randomName);
      const rand1 = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${rand1}@gmail.com`;
      const rand2 = random().concat('autotest');
      const secondEmail = `${process.env.GMAIL_NAME}+${rand2}@gmail.com`;
      const emails = `${firstEmail}, ${secondEmail}`;
      await dashboardPage.enterOnboardingInviteEmails(emails);
      await dashboardPage.clickOnOnboardingCreateTeamButton();
      await teamPage.isTeamSelected(randomName);
    });

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

  test(qase(36, 'ON-9 Create demo account'), async () => {
    await registerPage.isRegisterPageOpened();
    await registerPage.clickOnCreateDemoAccountBtn();
    await dashboardPage.fillOnboardingQuestions();
    await dashboardPage.isHeaderDisplayed('Projects');
  });

  test(qase(54, 'ON-27 Sign up with email of existing user'), async () => {
    const email = process.env.LOGIN_EMAIL;
    await registerPage.registerAccount('test', email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await updateTestResults(testInfo.status, testInfo.retry);
  });
});
