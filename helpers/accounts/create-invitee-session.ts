import type { Browser, Page } from '@playwright/test';
import { random } from 'helpers/string-generator';
import { registerNewAccount } from './register-new-account';
import { InvitationRole } from 'helpers/teams/invitation-role';

export type InviteeSession = {
  page: Page;
  name: string;
  email: string;
  close: () => Promise<void>;
};

/** Shared by `createOrgInviteeSession`/`createTeamInviteeSession` — a real
 * account (Gmail-alias, own inbox) in its own browser context, since a demo
 * account can't accept an invite (unreadable inbox, see the
 * enterprise-demo-account-email memory). `label` (already lowercased),
 * if any, folds into the generated name/email for logs/traces. */
async function createSession(
  browser: Browser,
  label: string,
): Promise<InviteeSession> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const name = random().concat(label).concat('autotest');
  const email = `${process.env.GMAIL_NAME}+${name}${process.env.GMAIL_DOMAIN}`;

  await registerNewAccount(page, name, email, process.env.LOGIN_PWD!);

  return { page, name, email, close: () => context.close() };
}

/**
 * Creates a real, invitable second account for an ORG-level invite
 * (`AdminConsolePage.invitePersonToOrganization()`) — unlike a team
 * invite, an org invite carries no role at all, so there's no `role`
 * param here (see `createTeamInviteeSession` for that). Doesn't accept
 * any invite itself; call `OrganizationPage.acceptOrgInviteFromInbox()`
 * after.
 *
 * Prefer `enterprise-fixtures.ts`'s `ownerAndInviteeTest` in tests — its
 * `invitee` fixture also closes the context for you. Call this directly
 * only outside a test context.
 *
 * Pass `ordinal` when a test creates more than one, e.g. `(browser, 1)` /
 * `(browser, 2)`.
 */
export async function createOrgInviteeSession(
  browser: Browser,
  ordinal?: number,
): Promise<InviteeSession> {
  return createSession(browser, ordinal != null ? String(ordinal) : '');
}

/**
 * Creates a real, invitable second account for a TEAM-level invite
 * (`TeamPage.selectInvitationRoleInPopUp()` et al.) — `role` is required
 * since a team invite always has one, even if it's just the UI's own
 * default (`InvitationRole.Editor`) left unchanged.
 *
 * Add `ordinal` too when a test creates more than one of the same role,
 * e.g. `(browser, InvitationRole.Viewer, 1)` /
 * `(browser, InvitationRole.Viewer, 2)` → "viewer1"/"viewer2". Lowercased
 * — the app itself normalizes the email to lowercase, and an exact-case
 * mismatch fails registration's own check.
 */
export async function createTeamInviteeSession(
  browser: Browser,
  role: InvitationRole,
  ordinal?: number,
): Promise<InviteeSession> {
  return createSession(
    browser,
    role.toLowerCase().concat(ordinal != null ? String(ordinal) : ''),
  );
}
