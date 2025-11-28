const { LoginPage } = require('../pages/login-page.js');
const { DashboardPage } = require('../pages/dashboard/dashboard-page.js');

async function loginAsSecondUser(page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.isEmailInputVisible();
  await loginPage.isLoginPageOpened();
  await loginPage.enterEmailAndClickOnContinue(process.env.SECOND_EMAIL);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  await dashboardPage.isDashboardOpenedAfterLogin();
}

module.exports = {
  loginAsSecondUser,
};
