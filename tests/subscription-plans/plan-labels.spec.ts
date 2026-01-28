import { mainTest, registerTest } from 'fixtures';
import { test } from '@playwright/test';
import { random } from 'helpers/string-generator';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '@pages/profile-page';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import { addPaymentMethodForCustomerByCustomerEmail } from 'helpers/stripe';

const teamName: string = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let loginPage: LoginPage;
let registerPage: RegisterPage;
let stripePage: StripePage;

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
  if (teamPage && teamName) {
    await teamPage.deleteTeam(teamName);
  }
});

registerTest(
  qase(
    [2281, 2348],
    'Display & Info for Enterprise Plan. Enterprise badge visible immediately',
  ),
  async ({ page, email }) => {
    const trialPlan = 'Unlimited';
    const currentPlan = 'Enterprise';

    await test.step(`Subscribe for ${trialPlan} plan trial`, async () => {
      await profilePage.tryTrialForPlan(trialPlan);
    });

    await test.step(`From Subscriptions page, add payment method for ${trialPlan}`, async () => {
      await profilePage.openYourAccountPage();
      await profilePage.openSubscriptionTab();
      await profilePage.clickOnAddPaymentMethodButton();
      await addPaymentMethodForCustomerByCustomerEmail(page, email);
      await stripePage.reloadPage();
      await stripePage.isVisaCardAdded(true);
    });

    await test.step(`Change from ${trialPlan} to ${currentPlan} and return to Penpot`, async () => {
      await stripePage.changeSubscription();
      await stripePage.checkCurrentSubscription(currentPlan);
      await stripePage.clickOnReturnToPenpotButton();
    });

    await test.step(`Validate ${currentPlan} subscription name and icon`, async () => {
      await profilePage.reloadPage();
      await profilePage.checkSubscriptionName(currentPlan);
      await profilePage.backToDashboardFromAccount();
      await dashboardPage.checkSubscriptionName(currentPlan + ' plan');
      await teamPage.isSubscriptionIconVisible(currentPlan);
      await teamPage.isSubscriptionIconVisibleInTeamDropdown(true);
      await teamPage.openTeamSettingsPageViaOptionsMenu();
      await teamPage.checkSubscriptionName(currentPlan);
    });
  },
);

registerTest(qase(2283, 'Display & Info for Professional Plan'), async () => {
  const currentPlan = 'Professional';
  await profilePage.openYourAccountPage();
  await profilePage.openSubscriptionTab();
  await profilePage.checkSubscriptionName(currentPlan);
  await profilePage.backToDashboardFromAccount();
  await dashboardPage.checkSubscriptionName(currentPlan + ' plan');
  await teamPage.isSubscriptionIconNotVisible();
  await teamPage.isSubscriptionIconVisibleInTeamDropdown(false);
  await teamPage.openTeamSettingsPageViaOptionsMenu();
  await teamPage.checkSubscriptionName(currentPlan);
});
