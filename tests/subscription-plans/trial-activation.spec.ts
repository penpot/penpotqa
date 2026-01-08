import { registerTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '@pages/profile-page';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import { updateSubscriptionTrialEnd } from 'helpers/stripe';

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let loginPage: LoginPage;
let registerPage: RegisterPage;
let stripePage: StripePage;
let teamName: string;

registerTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  stripePage = new StripePage(page);
  teamName = random().concat('autotest');

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

registerTest.afterEach(async () => {
  if (teamPage && teamName) {
    await teamPage.deleteTeam(teamName);
  }
});

registerTest(qase(2289, 'Try it free for 14 days for Unlimited plan'), async () => {
  const currentPlan = 'Unlimited';

  await profilePage.tryTrialForPlan(currentPlan, '5');
  await profilePage.openYourAccountPage();
  await profilePage.openSubscriptionTab();
  await profilePage.checkSubscriptionName(currentPlan + ' (trial)');
  await profilePage.backToDashboardFromAccount();
  await dashboardPage.checkSubscriptionName(currentPlan + ' plan (trial)');
});

registerTest(
  qase(2294, 'Verify Trial Label Behavior (for the Enterprise plan)'),
  async ({ page, email }) => {
    const currentPlan = 'Enterprise';

    await profilePage.tryTrialForPlan(currentPlan, '5');
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.checkSubscriptionName(currentPlan + ' (trial)');
    await updateSubscriptionTrialEnd(page, email);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(currentPlan + ' plan (trial)');
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.checkSubscriptionName(currentPlan + ' (trial)');
    await profilePage.clickOnManageSubscriptionButton();
    await stripePage.isTrialEndsVisible();
    await stripePage.isTrialEndsTomorrow();
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.backToDashboardFromAccount();
  },
);
