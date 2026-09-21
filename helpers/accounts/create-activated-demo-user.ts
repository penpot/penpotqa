import type { Page } from '@playwright/test';
import { createDemoUser } from './create-demo-user';
import { activateEnterpriseLicense } from 'helpers/organizations/activate-enterprise-license';
import { DashboardPage } from '@pages/dashboard/dashboard-page';

/** Grants Enterprise entitlement via `activateEnterpriseLicense` instead
 * of Stripe, landing the demo account on its dashboard ready to use. */
export async function createActivatedDemoUser(page: Page) {
  const dashboardPage = new DashboardPage(page);
  await createDemoUser(page.context().request);
  await activateEnterpriseLicense(page.context().request);

  await page.goto('/');
  await dashboardPage.isDashboardOpenedAfterLogin();
  await dashboardPage.acceptCookie();
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.skipWhatNewsPopUp();
  await dashboardPage.skipPluginsPopUp();
}
