const { registerTest } = require('../../fixtures');
import { Page } from '@playwright/test';
import { random } from '../../helpers/string-generator';
import { TeamPage } from '../../pages/dashboard/team-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '../../pages/profile-page';
import { StripePage } from '../../pages/dashboard/stripe-page';
import {
  createCustomerWithTestClock,
  skipSubscriptionByDays,
  getProfileIdByEmail,
  addPaymentMethodForCustomer,
  addPaymentMethodForCustomerByCustomerEmail,
} from '../../helpers/stripe';

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let stripePage: StripePage;
const teamName: string = random().concat('autotest');

registerTest.beforeEach(
  async ({ page }: { page: Page; name: string; email: string }) => {
    await registerTest.slow();
    teamPage = new TeamPage(page);
    dashboardPage = new DashboardPage(page);
    profilePage = new ProfilePage(page);
    stripePage = new StripePage(page);

    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);
  },
);

registerTest.afterEach(async () => {
  if (teamPage && teamName) {
    await teamPage.deleteTeam(teamName);
  }
});

registerTest(
  qase(2302, 'Switch from Unlimited → Enterprise'),
  async ({ page, name, email }: { page: Page; name: string; email: string }) => {
    const currentPlan = 'Unlimited';
    const newPlan = 'Enterprise';
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
    await stripePage.checkCurrentSubscription(currentPlan);
    await stripePage.checkLastInvoiceName(`Penpot ${currentPlan} (per editors)`);
    await stripePage.checkLastInvoiceAmount(`$7.00`);
    await stripePage.changeSubscription();
    await stripePage.checkCurrentSubscription(newPlan);
    await page.waitForTimeout(1000);
    await profilePage.reloadPage();
    await stripePage.checkLastInvoiceName(`Penpot ${newPlan}`);
    await stripePage.checkLastInvoiceStatus(`Paid`);
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.checkSubscriptionName(newPlan);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(newPlan + ' plan');
  },
);

registerTest(
  qase(2303, 'Switch from Enterprise → Unlimited'),
  async ({ page, email }: { page: Page; email: string }) => {
    const currentPlan = 'Enterprise';
    const newPlan = 'Unlimited';

    await registerTest.slow();

    await profilePage.tryTrialForPlan(newPlan);
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await addPaymentMethodForCustomerByCustomerEmail(page, email);
    await stripePage.reloadPage();
    await stripePage.isVisaCardAdded(true);
    await stripePage.changeSubscription();
    await stripePage.checkCurrentSubscription(currentPlan);

    await stripePage.waitTrialEndsDisappear();
    await stripePage.changeSubscription();
    await stripePage.checkCurrentSubscription(newPlan);
    await stripePage.checkLastInvoiceName(`Penpot ${newPlan}`);
    await stripePage.checkLastInvoiceAmount(`$0.00`);
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.checkSubscriptionName(newPlan);
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.checkSubscriptionName(newPlan + ' plan');
  },
);

registerTest(
  qase(2304, 'Switch from Unlimited → Professional'),
  async ({ page, name, email }: { page: Page; name: string; email: string }) => {
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
    await dashboardPage.checkSubscriptionName(defaultPlan + ' plan');
  },
);
