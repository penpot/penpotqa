import type { Page } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { createDemoUser, type DemoUserOptions } from './create-demo-user';

/**
 * Logs the page in as a fresh demo account and lands on its dashboard, past
 * the cookie banner and onboarding popups. Shared by `demoAccountApiFixture`
 * (fixtures.ts) and `ownerAndInviteeTest`'s `ownerPage` (enterprise-fixtures.ts),
 * so both stay in sync. Returns the demo profile's email + password.
 */
export async function loginAsDemoAccount(page: Page, options: DemoUserOptions = {}) {
  const credentials = await createDemoUser(page.context().request, options);
  await openDashboardAfterApiLogin(page);
  return credentials;
}

/**
 * Opens the dashboard of an account already logged in via the API (session
 * cookie in the page's context), past the cookie banner and onboarding popups.
 */
export async function openDashboardAfterApiLogin(page: Page) {
  const dashboardPage = new DashboardPage(page);

  await page.goto('/');
  await dashboardPage.isDashboardOpenedAfterLogin();
  await dashboardPage.acceptCookie();
  await dashboardPage.isHeaderDisplayed('Personal Projects');
  await dashboardPage.skipWhatNewsPopUp();
  await dashboardPage.skipPluginsPopUp();
}
