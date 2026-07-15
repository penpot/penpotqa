import { registerTest } from 'fixtures';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '@pages/profile-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import { updateSubscriptionTrialEnd } from 'helpers/stripe';
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
  await teamPage.isTeamSelected(teamName);
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
