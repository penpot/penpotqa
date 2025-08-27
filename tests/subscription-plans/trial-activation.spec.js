const { mainTest } = require('../../fixtures');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');
const { waitMessage } = require('../../helpers/gmail');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { StripePage } = require('../../pages/dashboard/stripe-page');
const { updateSubscriptionTrialEnd } = require('../../helpers/stripe');

let teamPage, dashboardPage, profilePage, loginPage, registerPage, stripePage;
const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  stripePage = new StripePage(page);
});

test.afterEach(async ({ page }, testInfo) => {
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

test(qase(2289, 'Try it free for 14 days for Unlimited plan'), async ({ page }) => {
  const currentPlan = 'Unlimited';
  const name = random().concat('autotest');
  const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;

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

  await profilePage.tryTrialForPlan(currentPlan, '5');
  await profilePage.openYourAccountPage();
  await profilePage.openSubscriptionTab();
  await profilePage.checkSubscriptionName(currentPlan + ' (trial)');
  await profilePage.backToDashboardFromAccount();
  await dashboardPage.checkSubscriptionName(currentPlan + ' plan (trial)');
});

test(
  qase(2294, 'Verify Trial Label Behavior (for the Enterprise plan)'),
  async ({ page }) => {
    const currentPlan = 'Enterprise';
    const name = random().concat('autotest');
    const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;

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
