import type { Page } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { createDemoUser } from './create-demo-user';

/**
 * Logs the page in as a fresh demo account and lands on its dashboard, past
 * the cookie banner and onboarding popups. Shared by `demoAccountApiFixture`
 * (fixtures.ts) and `ownerAndInviteeTest`'s `ownerPage` (enterprise-fixtures.ts),
 * so both stay in sync.
 *
 * @returns email + password — password only matters for tests that log back
 * in through the UI after logging out, or that need the account's real
 * current password (e.g. a change-password flow).
 */
export async function loginAsDemoAccount(page: Page) {
  const dashboardPage = new DashboardPage(page);

  const credentials = await createDemoUser(page.context().request);

  await page.goto('/');
  await dashboardPage.isDashboardOpenedAfterLogin();
  await dashboardPage.acceptCookie();
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.skipWhatNewsPopUp();
  await dashboardPage.skipPluginsPopUp();

  return credentials;
}
