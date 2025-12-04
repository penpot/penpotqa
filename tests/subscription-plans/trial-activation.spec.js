const { registerTest } = require('../../fixtures');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { StripePage } = require('../../pages/dashboard/stripe-page');
const { updateSubscriptionTrialEnd } = require('../../helpers/stripe');

let teamPage, dashboardPage, profilePage, loginPage, registerPage, stripePage;
const teamName = random().concat('autotest');

registerTest.beforeEach(async ({ page }) => {
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

registerTest.fixme(
  qase(2289, 'Try it free for 14 days for Unlimited plan'),
  async () => {
    const currentPlan = 'Unlimited';

    await profilePage.tryTrialForPlan(currentPlan, '5');
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.checkSubscriptionName(currentPlan + ' (trial)');
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(currentPlan + ' plan (trial)');
  },
);

registerTest.fixme(
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
