const { test } = require('@playwright/test');
const { LoginPage } = require('../../pages/login-page.js');
const { RegisterPage } = require('../../pages/register-page.js');
const { updateTestResults } = require('../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { random } = require('../../helpers/string-generator.js');
const { waitMessage } = require('../../helpers/gmail.js');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page.js');

let loginPage, registerPage, dashboardPage;

test.describe(() => {
  let randomName, email, invite;
  test.beforeEach(async ({ page }) => {
    await test.slow();
    randomName = random().concat('autotest');
    email = `${process.env.GMAIL_NAME}+${randomName}${process.env.GMAIL_DOMAIN}`;
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(randomName, email, process.env.LOGIN_PWD);
    await registerPage.isRegisterEmailCorrect(email);
    invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
  });

  test(
    qase(
      [1802, 1813],
      'Reload the page while questions survey is opened, Press "ESC" button to close question slides',
    ),
    async () => {
      await dashboardPage.selectRadioButton('Work');
      await dashboardPage.selectLastDropdownOptions();
      await dashboardPage.reloadPage();
      await dashboardPage.isOnboardingFirstQuestionsVisible();
      await dashboardPage.clickOnESC();
      await dashboardPage.isOnboardingFirstQuestionsVisible();
    },
  );

  test(
    qase(
      [1805],
      'Select any option, click "Next" button and comebacks to previous question',
    ),
    async () => {
      await dashboardPage.selectRadioButton('Work');
      await dashboardPage.selectKindOfWork('Development');
      await dashboardPage.clickOnNextButton();
      await dashboardPage.clickOnPrevButton();
      await dashboardPage.checkRadioButtonLabel('Work');
      await dashboardPage.checkDropdownValue('Development');
    },
  );

  test(
    qase([1801], 'Close and reopen penpot page while questions survey is opened'),
    async ({ page, context }) => {
      await dashboardPage.isOnboardingFirstQuestionsVisible();
      await page.close();
      const newPage = await context.newPage();
      await newPage.goto(invite.inviteUrl);
      const dashboardPage2 = new DashboardPage(newPage);
      await dashboardPage2.isOnboardingFirstQuestionsVisible();
    },
  );
});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry);
});
