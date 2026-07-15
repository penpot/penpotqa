import { test } from '@playwright/test';
import { LoginPage } from '@pages/login-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { RegisterPage } from '@pages/register-page';
import { random } from './helpers/string-generator';
import { waitMessage } from './helpers/gmail';

export const mainTest = test.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL!);
    await loginPage.enterPwd(process.env.LOGIN_PWD!);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.skipWhatNewsPopUp();
    await dashboardPage.skipPluginsPopUp();
    await use(page);
  },
});

type RegisterTestFixtures = {
  name: string;
  email: string;
};

export const registerTest = test.extend<RegisterTestFixtures>({
  name: async ({}, use) => {
    const name = random().concat('autotest');
    await use(name);
  },
  email: async ({ name }, use) => {
    const email = `${process.env.GMAIL_NAME}+${name}${process.env.GMAIL_DOMAIN}`;
    await use(email);
  },
  page: async ({ page, name, email }, use) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const registerPage = new RegisterPage(page);

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();
    await registerPage.registerAccount(name, email, process.env.LOGIN_PWD!);
    await registerPage.isRegisterEmailCorrect(email);
    const invite = await waitMessage(page, email, 40);
    await page.goto(invite!.inviteUrl);
    await dashboardPage.fillOnboardingQuestions();
    await use(page);
  },
});
