const { registerTest } = require('../../fixtures');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { StripePage } = require('../../pages/dashboard/stripe-page');
const {
  createCustomerWithTestClock,
  skipSubscriptionByDays,
} = require('../../helpers/stripe');

let teamPage, dashboardPage, profilePage, loginPage, registerPage, stripePage;
const teamName = random().concat('autotest');

registerTest.beforeEach(async ({ page }) => {
  await registerTest.slow();
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  stripePage = new StripePage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

registerTest.afterEach(async () => {
  await teamPage.deleteTeam(teamName);
});

registerTest(
  qase(2302, 'Switch from Unlimited → Enterprise (Qase ID: 2302)'),
  async ({ page }) => {
    const timestamp = new Date().toLocaleString();
    console.log('Test Start:', timestamp);

    const currentPlan = 'Unlimited';
    const newPlan = 'Enterprise';

    await registerTest.slow();

    await profilePage.tryTrialForPlan(currentPlan);
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await stripePage.addDefaultCard();
    await stripePage.isVisaCardAdded(true);
    await stripePage.changeSubscription();
    await stripePage.checkCurrentSubscription(newPlan);

    await stripePage.waitTrialEndsDisappear();
    await stripePage.changeSubscription();
    await stripePage.checkCurrentSubscription(currentPlan);
    await stripePage.checkLastInvoiceName(`Penpot ${currentPlan}`);
    await stripePage.checkLastInvoiceAmount(`$0.00`);
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.checkSubscriptionName(currentPlan);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(currentPlan + ' plan');
  },
);

registerTest(
  qase(2303, 'Switch from Enterprise → Unlimited (Qase ID: 2303)'),
  async ({ page }) => {
    const currentPlan = 'Enterprise';
    const newPlan = 'Unlimited';

    await registerTest.slow();

    await profilePage.tryTrialForPlan(newPlan);
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await stripePage.addDefaultCard();
    await stripePage.isVisaCardAdded(true);
    await stripePage.changeSubscription();
    await stripePage.checkCurrentSubscription(currentPlan);

    await stripePage.waitTrialEndsDisappear();
    await stripePage.changeSubscription();
    await stripePage.checkCurrentSubscription(newPlan);
    await stripePage.checkLastInvoiceName(`Penpot ${newPlan}`);
    await stripePage.checkLastInvoiceAmount(`$0.00`);
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.checkSubscriptionName(newPlan);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(newPlan + ' plan');
  },
);

registerTest(
  qase(2304, 'Switch from Unlimited → Professional (Qase ID: 2304)'),
  async ({ page, name, email }) => {
    const currentPlan = 'Unlimited';
    const defaultPlan = 'Professional';
    let date = new Date();

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
  },
);
