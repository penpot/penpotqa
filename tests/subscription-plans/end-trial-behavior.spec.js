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
} = require('../../helpers/stripe');

let teamPage, dashboardPage, profilePage, loginPage, registerPage, stripePage;
const teamName = random().concat('autotest');
let testClockId, penpotId;

registerTest.beforeEach(async ({ page, name, email }) => {
  await registerTest.slow();
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  stripePage = new StripePage(page);

  penpotId = await getProfileIdByEmail(email);
  testClockId = await createCustomerWithTestClock(page, name, email, penpotId);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

registerTest.afterEach(async () => {
  await teamPage.deleteTeam(teamName);
});

registerTest(
  qase([2297, 2344], 'Trial ends, payment method added → switch to Unlimited'),
  async ({ email }) => {
    registerTest.fixme(
      "Confirm button getByTestId('confirm') remains disabled during card addition - possible validation or timing issues in payment form",
    );

    const currentPlan = 'Unlimited';

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

registerTest(
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

registerTest(
  qase(2337, 'Trial ends, no payment method → remains in Enterprise Trial (PAUSED)'),
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
