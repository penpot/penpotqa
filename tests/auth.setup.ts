import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
// TO DO - AUTHENTICATION UI - TO REVIEW
// setup('authenticate as owner', async ({ page }) => {
//   // Ensure storageState folder exists
//   if (!fs.existsSync('storageState')) {
//     fs.mkdirSync('storageState');
//   }

//   // Go to login page
//   const loginPage = new LoginPage(page);
//   await loginPage.goto(); // BASE_URL/login
//   await loginPage.acceptCookie();
//   await loginPage.enterEmail(process.env.LOGIN_EMAIL);
//   await loginPage.enterPwd(process.env.LOGIN_PWD);
//   await loginPage.clickLoginButton();

//   // Verify redirect to Dashboard page
//   const dashboardPage = new DashboardPage(page);
//   await dashboardPage.isDashboardOpenedAfterLogin();
//   await dashboardPage.isHeaderDisplayed('Projects');

//   // Save session state for reuse
//   await page.context().storageState({ path: 'storageState/owner.json' });
// });

// setup('authenticate API', async ({ request }) => {
//   const url = `${process.env.BASE_URL}api/rpc/command/login-with-password`;

//   const response = await request.post(url, {
//     data: {
//       email: process.env.LOGIN_EMAIL,
//       password: process.env.LOGIN_PWD,
//     },
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok()) {
//     throw new Error(
//       `Login failed with status ${response.status()}: ${await response.text()}`,
//     );
//   }

//   // Debugging: print body if needed
//   const body = await response.json();
//   console.log('Login response:', body);

//   // Save cookies & local storage state
//   await request.storageState({ path: authFile });
// });
