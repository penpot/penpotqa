/**
 * Every Enterprise-specific Playwright test object and what it extends:
 *
 *   test (@playwright/test)
 *     ├─ demoAccountApiFixture (root fixtures.ts)
 *     │   └─ enterprisePageTest — adds the 5 page objects most Enterprise
 *     │                           specs need. Default choice.
 *     └─ ownerAndInviteeTest    — owner + a second, real invitee account,
 *                                 as sibling fixtures. Also carries the
 *                                 same 5 page objects, bound to `ownerPage`.
 *
 * Use `demoAccountApiFixture` directly only when a case needs none of the
 * 5 page objects.
 */
import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import { demoAccountApiFixture } from 'fixtures';
import { loginAsDemoAccount } from 'helpers/accounts/login-as-demo-account';
import {
  createInviteeSession,
  InviteeSession,
} from 'helpers/accounts/create-invitee-session';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { AdvancedPermissionsPage } from '@pages/admin-console/advanced-permissions-page';

type EnterprisePageFixtures = {
  orgPage: OrganizationPage;
  adminConsolePage: AdminConsolePage;
  stripePage: StripePage;
  teamPage: TeamPage;
  advancedPermissionsPage: AdvancedPermissionsPage;
};

// --- enterprisePageTest -------------------------------------------------------

/**
 * Extends `demoAccountApiFixture` with the 5 page objects nearly every
 * Enterprise spec needs, pre-instantiated against `page` — this
 * instantiation was duplicated across ~100 call sites in 14 spec files
 * before. Fixtures are lazy, so destructuring only the ones a test uses
 * (e.g. `{ page, orgPage, stripePage }`) never pays for the rest.
 *
 * Default choice for a single-actor case. For a second, real invitee
 * account too, use `ownerAndInviteeTest` below (same 5 fixtures, bound to
 * `ownerPage`).
 */
export const enterprisePageTest =
  demoAccountApiFixture.extend<EnterprisePageFixtures>({
    orgPage: async ({ page }, use) => {
      await use(new OrganizationPage(page));
    },
    adminConsolePage: async ({ page }, use) => {
      await use(new AdminConsolePage(page));
    },
    stripePage: async ({ page }, use) => {
      await use(new StripePage(page));
    },
    teamPage: async ({ page }, use) => {
      await use(new TeamPage(page));
    },
    advancedPermissionsPage: async ({ page }, use) => {
      await use(new AdvancedPermissionsPage(page));
    },
  });

// --- ownerAndInviteeTest -----------------------------------------------------

type OwnerAndInviteeFixtures = EnterprisePageFixtures & {
  ownerPage: Page;
  invitee: InviteeSession;
};

/**
 * Owner and invitee as two SIBLING fixtures — `ownerPage` and `invitee` —
 * not one `.extend()`-ing the other: they're peers, and this is Playwright's
 * own recommended shape for testing multiple signed-in roles together.
 * `page` isn't part of this test object's surface — destructuring it
 * directly hands you a fresh, unauthenticated page, so always use
 * `ownerPage`/`invitee`.
 *
 * `ownerPage` — a demo account (`loginAsDemoAccount()`, shared with
 * `demoAccountApiFixture`'s own `page`).
 *
 * `invitee` — a REAL account (`createInviteeSession()`), not a demo one: a
 * demo profile's email is unreadable (enterprise-demo-account-email memory)
 * and can never accept the org invite this exists for. Registration runs
 * inside its own `test.step(...)` so it's visible in the Playwright/Qase
 * report; `session.close()` runs in the fixture's teardown, always.
 *
 * Also carries the same 5 page-object fixtures as `enterprisePageTest`,
 * bound to `ownerPage`. Use this for any case needing a genuine non-owner
 * org member (e.g. PENPOT-3333/3334, and the still-stub PENPOT-3080/3081).
 */
export const ownerAndInviteeTest = base.extend<OwnerAndInviteeFixtures>({
  ownerPage: async ({ page }, use) => {
    await loginAsDemoAccount(page);
    await use(page);
  },
  invitee: async ({ browser }, use) => {
    const session = await base.step(
      'Setup: register a second, real account for the non-owner invitee',
      () => createInviteeSession(browser),
    );
    await use(session);
    await session.close();
  },
  orgPage: async ({ ownerPage }, use) => {
    await use(new OrganizationPage(ownerPage));
  },
  adminConsolePage: async ({ ownerPage }, use) => {
    await use(new AdminConsolePage(ownerPage));
  },
  stripePage: async ({ ownerPage }, use) => {
    await use(new StripePage(ownerPage));
  },
  teamPage: async ({ ownerPage }, use) => {
    await use(new TeamPage(ownerPage));
  },
  advancedPermissionsPage: async ({ ownerPage }, use) => {
    await use(new AdvancedPermissionsPage(ownerPage));
  },
});
