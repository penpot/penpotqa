import { registerTest } from 'fixtures';
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
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let stripePage: StripePage;

registerTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  stripePage = new StripePage(page);

  await teamPage.createTeam(teamName);
});

// TODO: Re-do following the updated test case in Qase
registerTest.skip(
  qase(2304, 'Switch from Unlimited → Professional'),
  async ({ page, name, email }) => {
    const currentPlan = 'Unlimited';
    const defaultPlan = 'Professional';
    let date = new Date();

    const penpotId = await getProfileIdByEmail(email);
    const customerData = await createCustomerWithTestClock(
      page,
      name,
      email,
      penpotId,
    );
    const testClockId = customerData.testClockId;

    await profilePage.tryTrialForPlan(currentPlan);
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await addPaymentMethodForCustomer(customerData.customerId);
    await stripePage.reloadPage();
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
    await dashboardPage.checkSubscriptionName(defaultPlan);
  },
);
