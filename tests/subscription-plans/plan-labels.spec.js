const { mainTest, registerTest } = require('../../fixtures');
const { test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { StripePage } = require('../../pages/dashboard/stripe-page');
const {
  addPaymentMethodForCustomerByCustomerEmail,
} = require('../../helpers/stripe');

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

registerTest(
  qase(2281, 'Display & Info for Enterprise Plan'),
  async ({ page, email }) => {
    const currentPlan = 'Enterprise';
    await profilePage.tryTrialForPlan('Unlimited');
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await addPaymentMethodForCustomerByCustomerEmail(page, email);
    await stripePage.reloadPage();
    await stripePage.isVisaCardAdded(true);
    await stripePage.changeSubscription();
    await stripePage.checkCurrentSubscription(currentPlan);
    await stripePage.clickOnReturnToPenpotButton();

    await profilePage.isSubscriptionNameVisible();
    await dashboardPage.reloadPage();
    await profilePage.checkSubscriptionName(currentPlan);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(currentPlan + ' plan');
    await teamPage.isSubscriptionIconVisible(true, currentPlan);
    await teamPage.isSubscriptionIconVisibleInTeamDropdown(true);
    await teamPage.openTeamSettingsPageViaOptionsMenu();
    await teamPage.checkSubscriptionName(currentPlan);
  },
);

registerTest(qase(2283, 'Display & Info for Professional Plan'), async () => {
  const currentPlan = 'Professional';
  await profilePage.openYourAccountPage();
  await profilePage.openSubscriptionTab();
  await profilePage.checkSubscriptionName(currentPlan);
  await profilePage.backToDashboardFromAccount();
  await dashboardPage.checkSubscriptionName(currentPlan + ' plan');
  await teamPage.isSubscriptionIconVisible(false);
  await teamPage.isSubscriptionIconVisibleInTeamDropdown(false);
  await teamPage.openTeamSettingsPageViaOptionsMenu();
  await teamPage.checkSubscriptionName(currentPlan);
});
