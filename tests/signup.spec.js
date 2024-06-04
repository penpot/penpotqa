const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { RegisterPage } = require('../pages/register-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { random } = require('../helpers/string-generator');
const { getRegisterMessage, checkRegisterText, checkRecoveryText } = require('../helpers/gmail');
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
    await page.waitForTimeout(30000);
    invite = await getRegisterMessage(email);
    console.log(invite.inviteUrl);
  });

  test(qase(28,'ON-1 Sign up with an email address'), async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await checkRegisterText(invite.inviteText, randomName);
    await page.goto(invite.inviteUrl);
    await dashboardPage.isOnboardingNextBtnDisplayed();
  });

  test(qase([43,44],'ON-16,17 Onboarding questions flow'), async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const teamPage = new TeamPage(page);
    await page.goto(invite.inviteUrl);
    await dashboardPage.isOnboardingNextBtnDisplayed();
    await dashboardPage.clickOnOnboardingNextBtn();
    await dashboardPage.checkOnboardingWelcomeHeader('Before you start');
    await dashboardPage.clickOnOnboardingNextBtn();
    await dashboardPage.selectPlaningToUsing('Start to work on my project');
    await dashboardPage.clickOnNextButton();
    await dashboardPage.fillSecondOnboardPage('none', 'some', 'a-lot');
    await dashboardPage.selectFigmaTool();
    await dashboardPage.clickOnNextButton();
    await dashboardPage.selectOnboardingOtherRole('QA');
    await dashboardPage.selectTeamSize('11-30');
    await dashboardPage.clickOnStartButton();
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
  await dashboardPage.isOnboardingNextBtnDisplayed();
  await dashboardPage.clickOnOnboardingNextBtn();
  await dashboardPage.checkOnboardingWelcomeHeader('Before you start');
  await dashboardPage.clickOnOnboardingNextBtn();
  await dashboardPage.reloadPage();
  await dashboardPage.isHeaderDisplayed('Projects');
});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry)
});
