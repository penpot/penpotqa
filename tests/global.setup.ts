import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { LoginPage } from '@pages/login-page';
import { chromium } from '@playwright/test';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { getStorageStatePath } from 'helpers/storageStatePath';

export default async function globalSetup() {
  const runId = randomUUID().slice(0, 8);

  process.env.TEST_RUN_ID = runId;

  console.log(`🧪 Test Run ID: ${runId}`);

  fs.mkdirSync('storageState', { recursive: true });

  const statePath = getStorageStatePath(); // IMPORTANT: inside function

  const browser = await chromium.launch();
  const context = await browser.newContext();
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

  await context.storageState({ path: statePath });

  await browser.close();

  // ✅ FIXED VALIDATION
  if (!fs.existsSync(statePath)) {
    throw new Error(`storageState not created: ${statePath}`);
  }

  console.log(`✅ storageState successfully created: ${statePath}`);
}
