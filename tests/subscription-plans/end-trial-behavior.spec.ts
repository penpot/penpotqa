import { registerTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '@pages/profile-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import {
  createCustomerWithTestClock,
  skipSubscriptionByDays,
  getProfileIdByEmail,
  addPaymentMethodForCustomer,
} from 'helpers/stripe';

const teamName: string = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let stripePage: StripePage;
let customerData: any;
let testClockId: string;

registerTest.beforeEach(async ({ page, name, email }) => {
  await registerTest.slow();
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  stripePage = new StripePage(page);

  const penpotId: string = await getProfileIdByEmail(email);
  customerData = await createCustomerWithTestClock(page, name, email, penpotId);
  testClockId = customerData.testClockId;

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

registerTest.afterEach(async () => {
  if (teamPage && teamName) {
    await teamPage.deleteTeam(teamName);
  }
});

registerTest(
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
