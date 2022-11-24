const base = require("@playwright/test");
const { LoginPage } = require("./pages/login-page.js");
const { DashboardPage } = require("./pages/dashboard-page.js");

const mainTest = base.test.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForPageLoaded();
    await dashboardPage.isHeaderDisplayed("Projects");
    await dashboardPage.deleteProjectsIfExist();
    await dashboardPage.deleteFilesIfExist();
    await dashboardPage.createFileViaPlaceholder();
    await use(page);
  },
});

const dashboardTest = base.test.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForPageLoaded();
    await dashboardPage.isHeaderDisplayed("Projects");
    await dashboardPage.deleteProjectsIfExist();
    await dashboardPage.deleteFilesIfExist();
    await use(page);
  },
});

exports.mainTest = mainTest;
exports.dashboardTest = dashboardTest;
