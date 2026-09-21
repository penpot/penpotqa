import type { Browser, Page } from '@playwright/test';
import { random } from 'helpers/string-generator';
import { registerNewAccount } from './register-new-account';

export type InviteeSession = {
  page: Page;
  name: string;
  email: string;
  close: () => Promise<void>;
};

/**
 * Creates a real, invitable second account (Gmail-alias, own inbox) in its
 * own browser context — a demo account can't accept an org invite (unreadable
 * inbox, see enterprise-demo-account-email memory). Doesn't accept any
 * invite itself; call `OrganizationPage.acceptOrgInviteFromInbox()` after.
 *
 * Prefer `enterprise-fixtures.ts`'s `ownerAndInviteeTest` in tests — its
 * `invitee` fixture also closes the context for you. Call this directly
 * only outside a test context.
 *
 * Pass `role` (e.g. 'admin') to tell sessions apart in logs/traces when a
 * test creates more than one.
 */
export async function createInviteeSession(
  browser: Browser,
  role?: string,
): Promise<InviteeSession> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const name = random()
    .concat(role ?? '')
    .concat('autotest');
  const email = `${process.env.GMAIL_NAME}+${name}${process.env.GMAIL_DOMAIN}`;

  await registerNewAccount(page, name, email, process.env.LOGIN_PWD!);

  return { page, name, email, close: () => context.close() };
}
