import type { Browser, Page } from '@playwright/test';
import { createDemoUser } from './create-demo-user';
import { loginAsDemoAccount } from './login-as-demo-account';

export type DemoUserSession = {
  page: Page;
  email: string;
  close: () => Promise<void>;
};

export type DemoUserSessionOptions = {
  /** Whether to open the dashboard (default: true). With `false` the account is
   * logged in through the API only and `page` stays blank, which saves a page
   * load; open it later with `openDashboardAfterApiLogin(page)`, which also
   * accepts the cookie banner. */
  openDashboard?: boolean;
};

/**
 * A fresh demo account (WASM) logged in in its own browser context — for a
 * second user acting alongside the test's own `page`. Call `close()` when done
 * (fixtures do it in their teardown).
 *
 * @param browser - The test's browser.
 * @param options - See `DemoUserSessionOptions` (default: open the dashboard).
 * @returns The account's page, email and a function that closes its context.
 */
export async function createDemoUserSession(
  browser: Browser,
  { openDashboard = true }: DemoUserSessionOptions = {},
): Promise<DemoUserSession> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const { email } = openDashboard
    ? await loginAsDemoAccount(page, { renderer: 'wasm' })
    : await createDemoUser(context.request, { renderer: 'wasm' });
  return { page, email, close: () => context.close() };
}
