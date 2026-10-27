import type { Browser, Page } from '@playwright/test';
import { loginAsDemoAccount } from './login-as-demo-account';

export type DemoUserSession = {
  page: Page;
  email: string;
  close: () => Promise<void>;
};

/** A fresh demo account (WASM) logged in in its own browser context, on its
 * dashboard — for a second user acting alongside the test's own `page`. Call
 * `close()` when done (fixtures do it in their teardown). */
export async function createDemoUserSession(
  browser: Browser,
): Promise<DemoUserSession> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const { email } = await loginAsDemoAccount(page, { renderer: 'wasm' });
  return { page, email, close: () => context.close() };
}
