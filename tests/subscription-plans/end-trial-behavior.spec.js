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
  getProfileIdByEmail,
  addPaymentMethodForCustomer,
} = require('../../helpers/stripe');

let teamPage, dashboardPage, profilePage, loginPage, registerPage, stripePage;
const teamName = random().concat('autotest');
let customerData, testClockId, penpotId;

registerTest.beforeEach(async ({ page, name, email }) => {
  await registerTest.slow();
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  stripePage = new StripePage(page);

  penpotId = await getProfileIdByEmail(email);
  customerData = await createCustomerWithTestClock(page, name, email, penpotId);
  testClockId = customerData.testClockId;

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

registerTest.afterEach(async () => {
  await teamPage.deleteTeam(teamName);
});

registerTest.describe(
  'Disabled: Flaky Stripe payment tests - awaiting stable testing strategy',
  () => {
    registerTest.fixme(
      true,
      'Trial ends, payment method added → switch to Unlimited - Disabled: Flaky Stripe payment tests - awaiting stable testing strategy',
      qase([2297, 2344], 'Trial ends, payment method added → switch to Unlimited'),
      async ({ email }) => {
        const currentPlan = 'Unlimited';

        await profilePage.tryTrialForPlan(currentPlan);
        await profilePage.openYourAccountPage();
        await profilePage.openSubscriptionTab();
        await addPaymentMethodForCustomer(customerData.customerId);
        await profilePage.clickOnAddPaymentMethodButton();
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

    registerTest.fixme(
      true,
      'Trial ends, no payment method ever added → switch to Professional (CANCELLED) - Disabled: Flaky Stripe payment tests - awaiting stable testing strategy',
      qase(
        2301,
        'Trial ends, no payment method ever added → switch to Professional (CANCELLED)',
      ),
      async ({ email }) => {
        const currentPlan = 'Unlimited';
        const defaultPlan = 'Professional';

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

    registerTest.fixme(
      true,
      'Trial ends, no payment method → remains in Enterprise Trial (PAUSED) - Disabled: Flaky Stripe payment tests - awaiting stable testing strategy',
      qase(
        2337,
        'Trial ends, no payment method → remains in Enterprise Trial (PAUSED)',
      ),
      async ({ email }) => {
        const currentPlan = 'Enterprise';

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
  },
);
