const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { RegisterPage } = require('../pages/register-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { random } = require('../helpers/string-generator');
const { waitMessage } = require('../helpers/gmail');
const { DashboardPage } = require('../pages/dashboard/dashboard-page');

test.describe(() => {
  let randomName,email,invite;
  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 30000);
    randomName = random().concat('autotest');
    email = `${process.env.GMAIL_NAME}+${randomName}@gmail.com`;
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);
    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(email);
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.clickOnCreateAccountBtn();

    await registerPage.enterFullName(randomName);
    await registerPage.clickOnAcceptTermsCheckbox();
    await registerPage.clickOnCreateAccountSecondBtn();
    await registerPage.isRegisterEmailCorrect(email);
    invite = await waitMessage(page, email, 40);
    await page.goto(invite.inviteUrl);
  });

  test(qase([1803,1804,1806,1807,1808,1809,1810,1811,1815],'Question - "Other" option at final place, Click "Next" button with empty "Other" text field'), async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.checkPageNumber(1);
    await dashboardPage.selectRadioButton('Work');
    await dashboardPage.selectLastDropdownOptions();
    await dashboardPage.checkDropdownValue('Other');
    await dashboardPage.isPlaningOtherInputVisible();
    await dashboardPage.isNextBtnDisabled();
    await dashboardPage.enterPlaningOther('test');
    await dashboardPage.clickOnNextButton();
    await dashboardPage.checkPageNumber(2);
    await dashboardPage.isNextBtnDisabled();
    await dashboardPage.selectLastTool();
    await dashboardPage.isToolOtherInputVisible();
    await dashboardPage.isNextBtnDisabled();
    await dashboardPage.enterOtherToolName('test tool');
    await dashboardPage.clickOnNextButton();
    await dashboardPage.checkPageNumber(3);
    await dashboardPage.selectLastKindOfWork();
    await dashboardPage.isKindOfWorkOtherInputVisible();
    await dashboardPage.selectLastRole();
    await dashboardPage.isRoleOtherInputVisible();
    await dashboardPage.enterOtherKindOfWork('test');
    await dashboardPage.enterOtherRoleName('test role');
    await dashboardPage.selectTeamSize('11-30');
    await dashboardPage.clickOnNextButton();
    await dashboardPage.checkPageNumber(4);
    await dashboardPage.selectLastGetStartedQuestion();
    await dashboardPage.isStartWithOtherInputVisible();
    await dashboardPage.isNextBtnDisabled();
    await dashboardPage.enterOtherStartWith('test');
    await dashboardPage.clickOnNextButton();
    await dashboardPage.checkPageNumber(5);
    await dashboardPage.selectLastRadioButton();
    await dashboardPage.isReferOtherInputVisible();
    await dashboardPage.isStartBtnDisabled();
    await dashboardPage.enterOtherRefer('test');
    await dashboardPage.clickOnStartButton();
    await dashboardPage.isOnboardingNewsHeaderDisplayed();
  });

  test(qase([1802,1813],'Reload the page while questions survey is opened, Press "ESC" button to close question slides'), async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.selectRadioButton('Work');
    await dashboardPage.selectLastDropdownOptions();
    await dashboardPage.reloadPage();
    await dashboardPage.isOnboardingFirstQuestionsVisible();
    await dashboardPage.clickOnESC();
    await dashboardPage.isOnboardingFirstQuestionsVisible();
  });

  test(qase([1805],'Select any option, click "Next" button and comebacks to previous question'), async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.selectRadioButton('Work');
    await dashboardPage.selectDropdownOptions('Testing before self-hosting');
    await dashboardPage.clickOnNextButton();
    await dashboardPage.clickOnPrevButton();
    await dashboardPage.checkRadioButtonLabel('Work');
    await dashboardPage.checkDropdownValue('Testing before self-hosting');
  });

});
test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry)
});
