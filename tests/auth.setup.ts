import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard/dashboard-page';
import fs from 'fs';

setup('authenticate as owner', async ({ page }) => {
  // Ensure storageState folder exists
  if (!fs.existsSync('storageState')) {
    fs.mkdirSync('storageState');
  }

  // Go to login page
  const loginPage = new LoginPage(page);
  await loginPage.goto(); // BASE_URL/login
  await loginPage.acceptCookie();
  await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();

  // Verify redirect to Dashboard page
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.isDashboardOpenedAfterLogin();
  await dashboardPage.isHeaderDisplayed('Projects');

  // Save session state for reuse
  await page.context().storageState({ path: 'storageState/owner.json' });
});
