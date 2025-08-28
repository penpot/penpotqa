const { mainTest } = require('../../fixtures');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');
const { waitMessage } = require('../../helpers/gmail');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { StripePage } = require('../../pages/dashboard/stripe-page');
const {
  createCustomerWithTestClock,
  skipSubscriptionByDays,
} = require('../../helpers/stripe');

let teamPage, dashboardPage, profilePage, loginPage, registerPage, stripePage;
const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  test.slow();
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  stripePage = new StripePage(page);
});

test.afterEach(async ({ page }, testInfo) => {
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

test(
  qase([2297, 2344], 'Trial ends, payment method added → switch to Unlimited'),
  async ({ page }) => {
    const currentPlan = 'Unlimited';
    const name = random().concat('autotest');
    const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(name, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
    const invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    const testClockId = await createCustomerWithTestClock(page, name, email);

    await profilePage.tryTrialForPlan(currentPlan);
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await stripePage.addDefaultCard();
    await stripePage.isVisaCardAdded(true);

    await skipSubscriptionByDays(email, testClockId, 16);

    await stripePage.waitTrialEndsDisappear();
    await stripePage.checkCurrentSubscription(currentPlan);
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.checkSubscriptionName(currentPlan);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(currentPlan + ' plan');
  },
);

test(
  qase(
    2301,
    'Trial ends, no payment method ever added → switch to Professional (CANCELLED)',
  ),
  async ({ page }) => {
    const currentPlan = 'Unlimited';
    const defaultPlan = 'Professional';
    const name = random().concat('autotest');
    const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(name, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
    const invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    const testClockId = await createCustomerWithTestClock(page, name, email);

    await profilePage.tryTrialForPlan(currentPlan);
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnManageSubscriptionButton();
    await stripePage.isTrialEndsVisible();
    await stripePage.cancelSubscription();

    await skipSubscriptionByDays(email, testClockId, 20);

    await stripePage.waitCancelsEndsDisappear();
    await stripePage.isCancelsEndsVisible(false);
    await stripePage.clickOnReturnToPenpotButton();

    await profilePage.checkSubscriptionName(defaultPlan);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(defaultPlan + ' plan');
  },
);

test(
  qase(2337, 'Trial ends, no payment method → remains in Enterprise Trial (PAUSED)'),
  async ({ page }) => {
    const currentPlan = 'Enterprise';
    const name = random().concat('autotest');
    const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(name, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
    const invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    const testClockId = await createCustomerWithTestClock(page, name, email);

    await profilePage.tryTrialForPlan(currentPlan);
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnManageSubscriptionButton();
    await stripePage.isTrialEndsVisible();

    await skipSubscriptionByDays(email, testClockId, 20);

    await stripePage.waitTrialEndsDisappear();
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.checkSubscriptionName(currentPlan);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(currentPlan + ' plan');
  },
);
