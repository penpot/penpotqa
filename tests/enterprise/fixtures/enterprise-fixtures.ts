/**
 * Every Enterprise-specific Playwright test object and what it extends:
 *
 *   test (@playwright/test)
 *     ├─ demoAccountApiFixture (root fixtures.ts)
 *     │   └─ enterprisePageTest          — adds the 5 page objects most
 *     │                                    Enterprise specs need. Default
 *     │                                    choice.
 *     ├─ enterpriseDemoAccountApiFixture — Enterprise counterpart to
 *     │   │                                demoAccountApiFixture: an
 *     │   │                                API-created demo account,
 *     │   │                                Enterprise-entitled via the
 *     │   │                                activation-code RPC path instead
 *     │   │                                of a real Stripe checkout.
 *     │   │                                PRE/dev environments only — skips
 *     │   │                                otherwise.
 *     │   └─ enterpriseActivatedPageTest — adds the same 5 page objects,
 *     │                                    plus `createDemoMember()` for
 *     │                                    extra demo accounts and
 *     │                                    `buildOrgMatrix()` for whole
 *     │                                    set-ups of orgs, teams and
 *     │                                    attributes.
 *     ├─ ownerAndInviteeTest             — owner + a second, real invitee
 *     │                                    account, as sibling fixtures.
 *     │                                    Owner entitled via Stripe. Also
 *     │                                    carries the same 5 page objects,
 *     │                                    bound to `ownerPage`.
 *     └─ ownerAndInviteeActivatedTest    — same as ownerAndInviteeTest, but
 *                                          the owner uses the activation-code path.
 *
 * Use `demoAccountApiFixture`/`enterpriseDemoAccountApiFixture` directly
 * only when a case needs none of the 5 page objects.
 */
import { test as base } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import { demoAccountApiFixture } from 'fixtures';
import { loginAsDemoAccount } from 'helpers/accounts/login-as-demo-account';
import { createActivatedDemoUser } from 'helpers/accounts/create-activated-demo-user';
import {
  createOrgInviteeSession,
  InviteeSession,
} from 'helpers/accounts/create-invitee-session';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { AuditLogsPage } from '@pages/admin-console/audit-logs-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { AdvancedPermissionsPage } from '@pages/admin-console/advanced-permissions-page';
import { OrganizationSsoPage } from '@pages/admin-console/organization-sso-page';
import { AttributesPage } from '@pages/admin-console/attributes-page';
import {
  createDemoUserSession,
  type DemoUserSession,
  type DemoUserSessionOptions,
} from 'helpers/accounts/create-demo-user-session';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';
import { createOrgMatrix } from 'helpers/org-matrix/create-org-matrix';
import type { BuiltOrgMatrix, OrgMatrix } from 'helpers/org-matrix/org-matrix-types';

type EnterprisePageFixtures = {
  orgPage: OrganizationPage;
  adminConsolePage: AdminConsolePage;
  stripePage: StripePage;
  teamPage: TeamPage;
  advancedPermissionsPage: AdvancedPermissionsPage;
  ssoPage: OrganizationSsoPage;
  auditLogsPage: AuditLogsPage;
  attributesPage: AttributesPage;
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
    ssoPage: async ({ page }, use) => {
      await use(new OrganizationSsoPage(page));
    },
    auditLogsPage: async ({ page }, use) => {
      await use(new AuditLogsPage(page));
    },
    attributesPage: async ({ page }, use) => {
      await use(new AttributesPage(page));
    },
  });

// --- enterpriseDemoAccountApiFixture -------------------------------------------

/**
 * Enterprise counterpart to root fixtures.ts's `demoAccountApiFixture`: the
 * same API-created demo account (`createDemoUser`), but
 * `activateEnterpriseLicense` runs before the first navigation, so it's
 * already Enterprise-entitled via the licenses-manager activation-code RPC
 * path — instead of a real Stripe checkout — by the time the dashboard ever
 * renders. Deliberately not `loginAsDemoAccount(page)` + reload: activation
 * is pure API calls with no UI to go stale, so there's no ordering
 * invariant to maintain and no extra page load.
 *
 * Extends `base` directly, not `demoAccountApiFixture` — this `page`
 * override needs full control of its own login. Extending
 * `demoAccountApiFixture` instead previously caused a real bug:
 * destructuring `{ page }` as this override's own dependency resolved to
 * the parent's already-overridden `page`, so every test silently logged
 * into a demo account via `loginAsDemoAccount` first, then logged into a
 * *second* one on top of it — doubling setup work on every run.
 *
 * Only works where `LICENSES_MANAGER_URL` is set to a reachable
 * licenses-manager — PRE/developer environments, not the default CI
 * target. `test.skip()`s automatically when unset (with a `console.warn`
 * explaining why, since the `list` reporter alone gives no visibility into
 * a skip's reason), so specs using this stay green in normal CI runs
 * rather than failing.
 *
 * Use directly only for a case needing none of the 5 page objects (mirrors
 * `demoAccountApiFixture`'s own guidance below); `enterpriseActivatedPageTest`
 * is the default choice otherwise.
 */
export const enterpriseDemoAccountApiFixture = base.extend({
  page: async ({ page }, use) => {
    if (!process.env.LICENSES_MANAGER_URL) {
      console.warn(
        'enterpriseDemoAccountApiFixture: skipping — LICENSES_MANAGER_URL is not ' +
          'set. This activation-code licensing path only works on ' +
          'PRE/developer environments; see tests/enterprise/README.md § ' +
          '"How Enterprise entitlement actually works" to configure it.',
      );
    }
    base.skip(
      !process.env.LICENSES_MANAGER_URL,
      'LICENSES_MANAGER_URL is not set — activation-code licensing is only available on PRE/developer environments.',
    );

    await createActivatedDemoUser(page);

    await use(page);
  },
});

// --- enterpriseActivatedPageTest ----------------------------------------------

/** An extra demo account logged in in its own browser context (see `createDemoMember`). */
export type DemoMember = DemoUserSession & {
  /** Display name, as the Admin Console lists it. */
  name: string;
  /** API session of the account. */
  request: APIRequestContext;
};

type DemoMemberFixtures = {
  /**
   * Creates a demo account in its own browser context, on its dashboard, with this
   * display name, e.g. to make it a member of an organization with
   * `joinOrganization()` (no email involved). Every account it creates is closed
   * when the test ends, even if it fails.
   *
   * Pass `{ openDashboard: false }` when the account only needs its API session
   * for now: its `page` stays blank, saving a page load per account.
   */
  createDemoMember: (
    name: string,
    options?: DemoUserSessionOptions,
  ) => Promise<DemoMember>;
  /**
   * Builds the users, organizations, teams, roles and attributes an `OrgMatrix`
   * describes, with demo accounts only (no email), each phase as its own report
   * step. Call it inside a `Setup:` step:
   *
   * ```ts
   * const matrix = await enterpriseActivatedPageTest.step(
   *   'Setup: OrgA users, teams and attributes',
   *   () =>
   *     buildOrgMatrix({
   *       users: ['User1', 'User2', 'User3'],
   *       loggedInUser: 'User1',
   *       orgs: {
   *         orgA: {
   *           teams: { apple: { User2: 'owner', User3: 'admin' } },
   *           attributes: { Legal: ['User2'] },
   *         },
   *         orgB: { owner: 'User2', members: ['User3'] },
   *       },
   *     }),
   * );
   * await openDashboardAfterApiLogin(matrix.users.User3.page); // blank until opened
   * matrix.orgs.orgA.teams.apple.name;
   * ```
   *
   * `page` is the `loggedInUser`, left in the Admin Console of the first
   * organization they own. The other users are `createDemoMember()` accounts
   * whose pages stay blank until opened (see `MatrixUser.page`).
   * How each part is built: `createOrgMatrix()` in
   * `helpers/org-matrix/create-org-matrix.ts`.
   */
  buildOrgMatrix: (matrix: OrgMatrix) => Promise<BuiltOrgMatrix>;
};

/**
 * Same 5 page objects as `enterprisePageTest`, but built on
 * `enterpriseDemoAccountApiFixture` above instead of `demoAccountApiFixture`
 * — skips the ~15-20s Stripe checkout UI entirely for cases that only need
 * an Enterprise-entitled account and don't care how it got that way. Not a
 * fit for cases exercising the checkout/trial UI itself, or Qase 3437
 * ("...with a valid manual activation code"), which specifically tests
 * pasting the code into that UI — use `enterprisePageTest` for those.
 */
export const enterpriseActivatedPageTest = enterpriseDemoAccountApiFixture.extend<
  EnterprisePageFixtures & DemoMemberFixtures
>({
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
  ssoPage: async ({ page }, use) => {
    await use(new OrganizationSsoPage(page));
  },
  auditLogsPage: async ({ page }, use) => {
    await use(new AuditLogsPage(page));
  },
  attributesPage: async ({ page }, use) => {
    await use(new AttributesPage(page));
  },
  createDemoMember: async ({ browser }, use) => {
    const members: DemoMember[] = [];
    await use(async (name, options) => {
      const session = await createDemoUserSession(browser, options);
      const request = session.page.context().request;
      await setDemoUserName(request, name);
      const member = { ...session, name, request };
      members.push(member);
      return member;
    });
    await Promise.all(members.map((member) => member.close()));
  },
  buildOrgMatrix: async ({ page, createDemoMember }, use) => {
    await use((matrix) => createOrgMatrix(matrix, page, createDemoMember));
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
 * `invitee` — a REAL account (`createOrgInviteeSession()`), not a demo one: a
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
      () => createOrgInviteeSession(browser),
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
  ssoPage: async ({ ownerPage }, use) => {
    await use(new OrganizationSsoPage(ownerPage));
  },
  auditLogsPage: async ({ ownerPage }, use) => {
    await use(new AuditLogsPage(ownerPage));
  },
  attributesPage: async ({ ownerPage }, use) => {
    await use(new AttributesPage(ownerPage));
  },
});

// --- ownerAndInviteeActivatedTest ---------------------------------------------

/** Same as `ownerAndInviteeTest`, but `ownerPage` uses the activation-code
 * path — pair with `createOrgForLicensedAccount()`, not `subscribeAndCreateOrg()`.
 * Overrides only `ownerPage`; `invitee` and the 5 page objects are
 * inherited unchanged (safe here since, unlike `enterpriseActivatedPageTest`
 * overriding `page` itself, `ownerPage` isn't self-referential). */
export const ownerAndInviteeActivatedTest = ownerAndInviteeTest.extend({
  ownerPage: async ({ page }, use) => {
    if (!process.env.LICENSES_MANAGER_URL) {
      console.warn(
        'ownerAndInviteeActivatedTest: skipping — LICENSES_MANAGER_URL is not ' +
          'set. This activation-code licensing path only works on ' +
          'PRE/developer environments; see tests/enterprise/README.md § ' +
          '"How Enterprise entitlement actually works" to configure it.',
      );
    }
    base.skip(
      !process.env.LICENSES_MANAGER_URL,
      'LICENSES_MANAGER_URL is not set — activation-code licensing is only available on PRE/developer environments.',
    );

    await createActivatedDemoUser(page);
    await use(page);
  },
});
