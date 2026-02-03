import { registerTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '@pages/profile-page';
import { waitMessage, waitSecondMessage, getRegisterMessage } from 'helpers/gmail';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import {
  createCustomerWithTestClock,
  skipSubscriptionByDays,
  skipSubscriptionByMonths,
  getProfileIdByEmail,
  addPaymentMethodForCustomer,
  addPaymentMethodForCustomerByCustomerEmail,
} from 'helpers/stripe';

const teamName: string = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let loginPage: LoginPage;
let registerPage: RegisterPage;
let stripePage: StripePage;

registerTest.describe(() => {
  let testClockId: string;
  let penpotId: string;
  let customerData: any;

  registerTest.beforeEach(async ({ page, name, email }) => {
    teamPage = new TeamPage(page);
    dashboardPage = new DashboardPage(page);
    profilePage = new ProfilePage(page);
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
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

  registerTest(
    qase(2347, 'Invoices capped at  $950 (Enterprise)'),
    async ({ email }) => {
      const currentPlan = 'Enterprise';
      const date = new Date();

      await profilePage.tryTrialForPlan(currentPlan);
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
      await stripePage.checkLastInvoiceAmount(`950.00`);

      await skipSubscriptionByMonths(email, testClockId, 1, date);
      await profilePage.reloadPage();

      await skipSubscriptionByMonths(email, testClockId, 1, date);
      await profilePage.reloadPage();

      await skipSubscriptionByMonths(email, testClockId, 1, date);
      await profilePage.reloadPage();

      await stripePage.checkLastInvoiceStatus(`Paid`);
      await stripePage.waitInvoiceAmountCount(`950.00`, 3);
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

registerTest(
  qase(2324, 'Owner of team changes Enterprise to Professional'),
  async ({ page, name, email }) => {
    const currentPlan = 'Enterprise';
    const firstOwner: string = random().concat('autotest');
    const firstEmail: string = `${process.env.GMAIL_NAME}+${firstOwner}${process.env.GMAIL_DOMAIN}`;
    const secondAdmin: string = name;
    const secondEmail: string = email;

    teamPage = new TeamPage(page);
    dashboardPage = new DashboardPage(page);
    profilePage = new ProfilePage(page);
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    stripePage = new StripePage(page);

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(
      firstOwner,
      firstEmail,
      process.env.LOGIN_PWD,
    );
    await registerPage.isRegisterEmailCorrect(firstEmail);
    const register2 = await waitMessage(page, firstEmail, 40);
    await page.goto(register2!.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();

    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    await profilePage.tryTrialForPlan('Unlimited');
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await addPaymentMethodForCustomerByCustomerEmail(page, firstEmail);
    await stripePage.reloadPage();
    await stripePage.isVisaCardAdded(true);
    await stripePage.changeSubscription();
    await stripePage.checkCurrentSubscription(currentPlan);
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.backToDashboardFromAccount();

    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.enterEmailToInviteMembersPopUp(secondEmail);
    await teamPage.clickSendInvitationButton();
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(secondEmail);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await waitSecondMessage(page, secondEmail, 40);
    const invite = await getRegisterMessage(secondEmail);
    await page.goto(invite!.inviteUrl);
    await teamPage.switchTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(firstEmail);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await teamPage.openMembersPageViaOptionsMenu();
    await teamPage.selectMemberRoleInPopUp(secondAdmin, 'Owner');
    await teamPage.clickOnTransferOwnershipButton();
    await teamPage.isMultipleMemberRecordDisplayed(
      secondAdmin,
      secondEmail,
      'Owner',
    );
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(secondEmail);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await teamPage.isSubscriptionIconNotVisible();
  },
);
