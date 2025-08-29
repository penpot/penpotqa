const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { RegisterPage } = require('../pages/register-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { random } = require('../helpers/string-generator');
const { waitMessage } = require('../helpers/gmail');
const { DashboardPage } = require('../pages/dashboard/dashboard-page');

let loginPage, registerPage, dashboardPage;

test.describe(() => {
  let randomName, email, invite;
  test.beforeEach(async ({ page }) => {
    await test.slow();
    randomName = random().concat('autotest');
    email = `${process.env.GMAIL_NAME}+${randomName}@gmail.com`;
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
      [1803, 1804, 1806, 1807, 1808, 1809, 1810, 1811, 1815],
      'Question - "Other" option at final place, Click "Next" button with empty "Other" text field',
    ),
    async () => {
      await dashboardPage.checkPageNumber(1, 3);
      await dashboardPage.selectRadioButton('Work');
      await dashboardPage.selectLastDropdownOptions();
      await dashboardPage.checkDropdownValue('Other');
      await dashboardPage.isKindOfWorkOtherInputVisible();
      await dashboardPage.isNextBtnDisabled();
      await dashboardPage.enterOtherKindOfWork('test');
      await dashboardPage.clickOnNextButton();
      await dashboardPage.checkPageNumber(2, 4);
      await dashboardPage.isNextBtnDisabled();
      await dashboardPage.selectLastTool();
      await dashboardPage.isToolOtherInputVisible();
      await dashboardPage.isNextBtnDisabled();
      await dashboardPage.enterOtherToolName('test tool');
      await dashboardPage.clickOnNextButton();
      await dashboardPage.checkPageNumber(3, 4);
      await dashboardPage.selectLastKindOfWork();
      await dashboardPage.isPlaningOtherInputVisible();
      await dashboardPage.isNextBtnDisabled();
      await dashboardPage.enterPlaningOther('test');
      await dashboardPage.selectTeamSize('11-30');
      await dashboardPage.clickOnNextButton();
      await dashboardPage.checkPageNumber(4, 4);
      await dashboardPage.selectLastGetStartedQuestion();
      await dashboardPage.isStartWithOtherInputVisible();
      await dashboardPage.isStartBtnDisabled();
      await dashboardPage.enterOtherStartWith('test');
      await dashboardPage.clickOnStartButton();
      await dashboardPage.clickOnOnboardingContinueWithoutTeamButton();
    },
  );

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
    qase([1812, 1814], 'Deselect chosen option, Change chosen option'),
    async () => {
      await dashboardPage.selectRadioButton('Work');
      await dashboardPage.selectRadioButton('Work');
      await dashboardPage.checkRadioButtonLabel('Work');
      await dashboardPage.selectKindOfWork('Development');
      await dashboardPage.clickOnNextButton();
      await dashboardPage.selectFigmaTool();
      await dashboardPage.clickOnNextButton();
      await dashboardPage.selectDropdownOptions('Testing before self-hosting');
      await dashboardPage.selectTeamSize('11-30');
      await dashboardPage.clickOnNextButton();
      await dashboardPage.selectGetStartedQuestion('Wireframing');
      await dashboardPage.checkRadioImageLabel('Wireframing');
      await dashboardPage.selectGetStartedQuestion('Prototyping');
      await dashboardPage.checkRadioImageLabel('Prototyping');
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
