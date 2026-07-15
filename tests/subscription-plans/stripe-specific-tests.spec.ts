import { registerTest } from 'fixtures';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '@pages/profile-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import {
  createCustomerWithTestClock,
  skipSubscriptionByDays,
  skipSubscriptionByMonths,
  getProfileIdByEmail,
  addPaymentMethodForCustomer,
} from 'helpers/stripe';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let stripePage: StripePage;

registerTest.describe(() => {
  let testClockId: string;
  let penpotId: string;
  let customerData: any;

  registerTest.beforeEach(async ({ page, name, email }) => {
    teamPage = new TeamPage(page);
    dashboardPage = new DashboardPage(page);
    profilePage = new ProfilePage(page);
    stripePage = new StripePage(page);

    penpotId = await getProfileIdByEmail(email);
    customerData = await createCustomerWithTestClock(page, name, email, penpotId);
    testClockId = customerData.testClockId;

    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);
  });

  registerTest.afterEach(async () => {
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.backToDashboardFromAccount();
  });

  registerTest(
    qase(2346, 'Invoices capped at $7 (Unlimited)'),
    async ({ email }) => {
      const currentPlan = 'Unlimited';
      const date = new Date();

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

      await skipSubscriptionByMonths(email, testClockId, 1, date);
      await profilePage.reloadPage();

      await skipSubscriptionByMonths(email, testClockId, 1, date);
      await profilePage.reloadPage();

      await skipSubscriptionByMonths(email, testClockId, 1, date);
      await profilePage.reloadPage();

      await stripePage.checkLastInvoiceStatus(`Paid`);
      await stripePage.waitInvoiceAmountCount(`$7.00`, 3);
    },
  );

  registerTest(qase(2514, 'Maximum billing $175 (Unlimited)'), async ({ email }) => {
    const currentPlan = 'Unlimited';
    const date = new Date();

    await profilePage.tryTrialForPlan(currentPlan, '100');
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await addPaymentMethodForCustomer(customerData.customerId);
    await stripePage.reloadPage();
    await stripePage.isVisaCardAdded(true);
    await skipSubscriptionByDays(email, testClockId, 20, date);

    await stripePage.waitTrialEndsDisappear();
    await profilePage.reloadPage();
    await stripePage.checkCurrentSubscription(currentPlan);
    await stripePage.checkLastInvoiceName(`Penpot ${currentPlan} (per editors)`);
    await stripePage.checkLastInvoiceAmount(`175.00`);

    await skipSubscriptionByMonths(email, testClockId, 1, date);
    await profilePage.reloadPage();

    await skipSubscriptionByMonths(email, testClockId, 1, date);
    await profilePage.reloadPage();

    await skipSubscriptionByMonths(email, testClockId, 1, date);
    await profilePage.reloadPage();

    await stripePage.checkLastInvoiceStatus(`Paid`);
    await stripePage.waitInvoiceAmountCount(`$175.00`, 3);
  });
});
