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
} from 'helpers/stripe';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let stripePage: StripePage;
let customerData: any;
let testClockId: string;

registerTest.beforeEach(async ({ page, name, email }) => {
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
