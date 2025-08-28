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

  await loginPage.goto();
  await loginPage.acceptCookie();
  await loginPage.clickOnCreateAccount();
});

test.afterEach(async ({ page }, testInfo) => {
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

test(qase(2302, 'Switch from Unlimited → Enterprise'), async ({ page }) => {
  const currentPlan = 'Unlimited';
  const newPlan = 'Enterprise';
  const name = random().concat('autotest');
  const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;
  let date = new Date();

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
  await skipSubscriptionByDays(email, testClockId, 15, date);

  await stripePage.waitTrialEndsDisappear();
  await profilePage.reloadPage();
  await stripePage.checkCurrentSubscription(currentPlan);
  await stripePage.checkLastInvoiceName(`Penpot ${currentPlan} (per editors)`);
  await stripePage.checkLastInvoiceAmount(`$7.00`);
  await stripePage.changeSubscription();
  await stripePage.checkCurrentSubscription(newPlan);
  await page.waitForTimeout(1000);
  await profilePage.reloadPage();
  await stripePage.checkLastInvoiceName(`Penpot ${newPlan}`);
  await stripePage.checkLastInvoiceStatus(`Paid`);
  await stripePage.clickOnReturnToPenpotButton();
  await profilePage.checkSubscriptionName(newPlan);
  await profilePage.backToDashboardFromAccount();
  await dashboardPage.checkSubscriptionName(newPlan + ' plan');
});

test(qase(2303, 'Switch from Enterprise → Unlimited'), async ({ page }) => {
  const currentPlan = 'Enterprise';
  const newPlan = 'Unlimited';
  const name = random().concat('autotest');
  const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;

  await registerPage.registerAccount(name, email, process.env.LOGIN_PWD);
  await registerPage.isRegisterEmailCorrect(email);
  const invite = await waitMessage(page, email, 40);
  await page.goto(invite.inviteUrl);
  await dashboardPage.fillOnboardingQuestions();
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);

  await profilePage.tryTrialForPlan(newPlan);
  await profilePage.openYourAccountPage();
  await profilePage.openSubscriptionTab();
  await profilePage.clickOnAddPaymentMethodButton();
  await stripePage.addDefaultCard();
  await stripePage.isVisaCardAdded(true);
  await stripePage.changeSubscription();
  await stripePage.checkCurrentSubscription(currentPlan);

  await stripePage.waitTrialEndsDisappear();
  await profilePage.reloadPage();
  await stripePage.changeSubscription();
  await stripePage.checkCurrentSubscription(newPlan);
  await stripePage.checkLastInvoiceName(`Penpot ${newPlan}`);
  await stripePage.checkLastInvoiceAmount(`$0.00`);
  await stripePage.clickOnReturnToPenpotButton();
  await profilePage.checkSubscriptionName(newPlan);
  await profilePage.backToDashboardFromAccount();
  await dashboardPage.checkSubscriptionName(newPlan + ' plan');
});

test(qase(2304, 'Switch from Unlimited → Professional'), async ({ page }) => {
  const currentPlan = 'Unlimited';
  const defaultPlan = 'Professional';
  const name = random().concat('autotest');
  const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;
  let date = new Date();

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
  await skipSubscriptionByDays(email, testClockId, 15, date);

  await stripePage.waitTrialEndsDisappear();
  await profilePage.reloadPage();

  await stripePage.cancelSubscription();
  await skipSubscriptionByDays(email, testClockId, 40, date);
  await stripePage.waitCancelsEndsDisappear();

  await stripePage.clickOnReturnToPenpotButton();

  await profilePage.checkSubscriptionName(defaultPlan);
  await profilePage.backToDashboardFromAccount();
  await dashboardPage.checkSubscriptionName(defaultPlan + ' plan');
});
