import { chromium } from '@playwright/test';
import { randomUUID } from 'crypto';
import fs from 'fs';

import { LoginPage } from '@pages/login-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';

export default async function globalSetup() {
  const runId = randomUUID().slice(0, 8);

  process.env.TEST_RUN_ID = runId;

  console.log(`🧪 Test Run ID: ${runId}`);

  fs.mkdirSync('storageState', { recursive: true });

  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      baseURL: process.env.BASE_URL,
    });

    const page = await context.newPage();

    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.acceptCookie();
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL!);
    await loginPage.enterPwd(process.env.LOGIN_PWD!);
    await loginPage.clickLoginButton();

    const dashboardPage = new DashboardPage(page);

    await dashboardPage.isDashboardOpenedAfterLogin();
    await dashboardPage.isHeaderDisplayed('Projects');

    await context.storageState({
      path: 'storageState/owner.json',
    });

    console.log('✅ Authentication state saved to storageState/owner.json');
  } finally {
    await browser.close();
  }
}
