const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { RegisterPage } = require('../pages/register-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { random } = require('../helpers/string-generator');
const { getRegisterMessage, checkRegisterText, waitMessage } = require('../helpers/gmail');
const { DashboardPage } = require('../pages/dashboard/dashboard-page');
const { TeamPage } = require('../pages/dashboard/team-page');
const { ProfilePage } = require('../pages/profile-page');

test(qase(32,'ON-5 Sign up with invalid email address'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.enterEmail('test.com');
  await registerPage.enterPassword(process.env.LOGIN_PWD);
  await registerPage.isEmailInputErrorDisplayed('Enter a valid email please');
  await registerPage.isCreateAccountBtnDisplayed();
  await registerPage.isCreateAccountBtnDisabled();
});

test(qase(33,'ON-6 Sign up with no password'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.enterEmail(process.env.LOGIN_EMAIL);
  await registerPage.clickOnPasswordInput();
  await registerPage.clickOnHeader();
  await registerPage.isPasswordInputHintDisplayed('At least 8 characters');
  await registerPage.isCreateAccountBtnDisplayed();
  await registerPage.isCreateAccountBtnDisabled();
});

test(qase(34,'ON-7 Sign up with incorrect password'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
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
  let randomName,email,invite;
  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 30000);
    randomName = random().concat('autotest');
    email = `${process.env.GMAIL_NAME}+${randomName}@gmail.com`;
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);
    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(email);
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.clickOnCreateAccountBtn();

    await registerPage.enterFullName(randomName);
    await registerPage.clickOnAcceptTermsCheckbox();
    await registerPage.clickOnCreateAccountSecondBtn();
    await registerPage.isRegisterEmailCorrect(email);
    invite = await waitMessage(page, email, 40);
  });

  test(qase(28,'ON-1 Sign up with an email address'), async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await checkRegisterText(invite.inviteText, randomName);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingFirstQuestions();
  });

  test(qase([43,44],'ON-16,17 Onboarding questions flow'), async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const teamPage = new TeamPage(page);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingFirstQuestions();
    await dashboardPage.isOnboardingNewsHeaderDisplayed();
    await dashboardPage.isOnboardingNewsUpdatesCheckboxDisplayed();
    await dashboardPage.isOnboardingNewsCheckboxDisplayed();
    await dashboardPage.clickOnOnboardingContinueBtn();
    await dashboardPage.enterOnboardingTeamName(randomName);
    await dashboardPage.clickOnOnboardingContinueCreateTeamButton();
    const rand1 = random().concat('autotest');
    const firstEmail = `${process.env.GMAIL_NAME}+${rand1}@gmail.com`;
    const rand2 = random().concat('autotest');
    const secondEmail = `${process.env.GMAIL_NAME}+${rand2}@gmail.com`;
    const emails = `${firstEmail}, ${secondEmail}`;
    await dashboardPage.enterOnboardingInviteEmails(emails);
    await dashboardPage.clickOnOnboardingCreateTeamButton();
    await teamPage.isTeamSelected(randomName);
  });
});

test(qase(36,'ON-9 Create demo account'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  await loginPage.goto();
  await loginPage.acceptCookie();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.clickOnCreateDemoAccountBtn();
  await dashboardPage.fillOnboardingQuestions();
  await dashboardPage.isHeaderDisplayed('Projects');
});

test(qase(54,'ON-27 Sign up with email of existing user'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.enterEmail(process.env.LOGIN_EMAIL);
  await registerPage.enterPassword(process.env.LOGIN_PWD);
  await registerPage.clickOnCreateAccountBtn();
  await registerPage.isFullNameFieldDisplayed();
});

test(
  qase(1903,'ON-28 Sign up without logging out of the previous account'),
  async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 60000);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);
    const teamPage = new TeamPage(page);

    const secondAdmin = random().concat('autotest');
    const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.waitForTeamButton();

    await loginPage.goto();
    await loginPage.clickOnCreateAccount();
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(secondEmail);
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.clickOnCreateAccountBtn();

    await registerPage.enterFullName(secondAdmin);
    await registerPage.clickOnAcceptTermsCheckbox();
    await registerPage.clickOnCreateAccountSecondBtn();
    await registerPage.isRegisterEmailCorrect(secondEmail);
    const register = await waitMessage(page, secondEmail, 40);
    await page.goto(register.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await dashboardPage.isDashboardOpenedAfterLogin();
  }
);

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry)
});
