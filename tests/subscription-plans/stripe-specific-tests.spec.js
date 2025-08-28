const { mainTest } = require('../../fixtures');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');
const {
  waitMessage,
  waitSecondMessage,
  getRegisterMessage,
} = require('../../helpers/gmail');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { StripePage } = require('../../pages/dashboard/stripe-page');
const {
  createCustomerWithTestClock,
  skipSubscriptionByDays,
  skipSubscriptionByMonths,
} = require('../../helpers/stripe');

let teamPage, dashboardPage, profilePage, loginPage, registerPage, stripePage;
const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  test.slow();
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  stripePage = new StripePage(page);
});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry);
});

test.describe(() => {
  test.afterEach(async () => {
    await stripePage.clickOnReturnToPenpotButton();
    await profilePage.backToDashboardFromAccount();
    await teamPage.deleteTeam(teamName);
  });

  test(qase(2346, 'Invoices capped at $7 (Unlimited)'), async ({ page }) => {
    const currentPlan = 'Unlimited';
    const name = random().concat('autotest');
    const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;
    let date = new Date();

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(name, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
    const invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    const testClockId = await createCustomerWithTestClock(page, name, email);

    await profilePage.tryTrialForPlan(currentPlan);
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await stripePage.addDefaultCard();
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

    await stripePage.checkLastInvoiceStatus(`Paid`);
    await stripePage.waitInvoiceAmountCount(`$7.00`, 3);
  });

  test(qase(2347, 'Invoices capped at  $950 (Enterprise)'), async ({ page }) => {
    const currentPlan = 'Enterprise';
    const name = random().concat('autotest');
    const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;
    let date = new Date();

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(name, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
    const invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    const testClockId = await createCustomerWithTestClock(page, name, email);

    await profilePage.tryTrialForPlan(currentPlan);
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await stripePage.addDefaultCard();
    await stripePage.isVisaCardAdded(true);
    await skipSubscriptionByDays(email, testClockId, 15, date);

    await stripePage.waitTrialEndsDisappear();
    await profilePage.reloadPage();
    await stripePage.checkCurrentSubscription(currentPlan);
    await stripePage.checkLastInvoiceName(`Penpot ${currentPlan} (per editors)`);
    await stripePage.checkLastInvoiceAmount(`$950.00`);

    await skipSubscriptionByMonths(email, testClockId, 1, date);
    await profilePage.reloadPage();
    await skipSubscriptionByMonths(email, testClockId, 1, date);
    await profilePage.reloadPage();

    await stripePage.checkLastInvoiceStatus(`Paid`);
    await stripePage.waitInvoiceAmountCount(`$950.00`, 3);
  });

  test(qase(2514, 'Maximum billing $175 (Unlimited)'), async ({ page }) => {
    const currentPlan = 'Unlimited';
    const name = random().concat('autotest');
    const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;
    let date = new Date();

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(name, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
    const invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    const testClockId = await createCustomerWithTestClock(page, name, email);

    await profilePage.tryTrialForPlan(currentPlan, '100');
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await stripePage.addDefaultCard();
    await stripePage.isVisaCardAdded(true);
    await skipSubscriptionByDays(email, testClockId, 15, date);

    await stripePage.waitTrialEndsDisappear();
    await profilePage.reloadPage();
    await stripePage.checkCurrentSubscription(currentPlan);
    await stripePage.checkLastInvoiceName(`Penpot ${currentPlan} (per editors)`);
    await stripePage.checkLastInvoiceAmount(`$175.00`);

    await skipSubscriptionByMonths(email, testClockId, 1, date);
    await profilePage.reloadPage();
    await skipSubscriptionByMonths(email, testClockId, 1, date);
    await profilePage.reloadPage();

    await stripePage.checkLastInvoiceStatus(`Paid`);
    await stripePage.waitInvoiceAmountCount(`$175.00`, 3);
  });
});

test(
  qase(2324, 'Owner of team changes Enterprise to Professional'),
  async ({ page }) => {
    const currentPlan = 'Enterprise';
    const firstOwner = random().concat('autotest');
    const firstEmail = `${process.env.GMAIL_NAME}+${firstOwner}@gmail.com`;
    const secondAdmin = random().concat('autotest');
    const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(
      secondAdmin,
      secondEmail,
      process.env.LOGIN_PWD,
    );
    await registerPage.isRegisterEmailCorrect(secondEmail);
    const register = await waitMessage(page, secondEmail, 40);
    await page.goto(register.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();

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
    await page.goto(register2.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();

    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    await profilePage.tryTrialForPlan('Unlimited');
    await profilePage.openYourAccountPage();
    await profilePage.openSubscriptionTab();
    await profilePage.clickOnAddPaymentMethodButton();
    await stripePage.addDefaultCard();
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
    await loginPage.enterEmail(secondEmail);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await waitSecondMessage(page, secondEmail, 40);
    const invite = await getRegisterMessage(secondEmail);
    await page.goto(invite.inviteUrl);
    await teamPage.switchTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(firstEmail);
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
    await loginPage.enterEmail(secondEmail);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await teamPage.isSubscriptionIconVisible(false, currentPlan);

    await teamPage.deleteTeam(teamName);
  },
);
