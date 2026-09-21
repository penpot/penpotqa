# Enterprise Plan test suite

Playwright specs for Penpot's Enterprise-plan.

**Status: 41 implemented and passing live, 33 still `test.skip` stubs.**

| Qase IDs                           | Qase suite                                                                                                                            | File                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 3235, 3236, 3336, 3324, 3413       | Cross-cutting: Enterprise Dashboard (direct) / Admin Console > Subscriptions & Billing / Admin Console (direct)                       | `billing-ui-flow/subscribe-and-trial-flow.spec.ts`            |
| 3239                               | Enterprise Dashboard > Organizations Dropdown                                                                                         | `dashboard-enterprise/organizations-dropdown.spec.ts`         |
| 3165, 3166                         | Admin Console > Settings > Rename organization                                                                                        | `admin-console/settings-rename-organization.spec.ts`          |
| 3240                               | Admin Console > Settings > Organization logo > Update logo                                                                            | `admin-console/settings-organization-logo.spec.ts`            |
| 3223, 3226                         | Cross-cutting: Admin Console > Settings > Delete organization; Admin Console > Subscriptions & Billing; Enterprise Dashboard (direct) | `destructive/plan-destructive-and-cross-plan.spec.ts`         |
| 3093, 3094, 3097, 3180, 3182, 3184 | Admin Console (direct cases) / Subscriptions & Billing                                                                                | `admin-console/navigation.spec.ts`                            |
| 3099                               | Admin Console > User menu (Organization owner)                                                                                        | `admin-console/user-menu.spec.ts`                             |
| 3630                               | Admin Console > Sidebar Menu > Teams                                                                                                  | `admin-console/teams-list.spec.ts`                            |
| 3106                               | Enterprise Dashboard > Teams Dropdown > Create new team                                                                               | `dashboard-enterprise/teams-dropdown-create-new-team.spec.ts` |
| 3133                               | Enterprise Dashboard > Teams Dropdown > Team Management Options > Delete Team                                                         | `dashboard-enterprise/teams-dropdown-delete-team.spec.ts`     |
| 3328, 3329, 3332, 3333, 3334       | Admin Console > Sidebar Menu > Advanced Permissions > Create Teams (Permission)                                                       | `admin-console/advanced-permissions-create-teams.spec.ts`     |
| 3192, 3198                         | Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Add/Remove team from organization                 | `dashboard-enterprise/team-settings-add-remove-org.spec.ts`   |
| 3302, 3308                         | Admin Console > Sidebar Menu > People > Members (tab) > Invite People (Button & Modal)                                                | `admin-console/people-members-invite.spec.ts`                 |
| 3185                               | Admin Console > Sidebar Menu > People > Pending (tab) > Cancel Invitation                                                             | `admin-console/people-pending-cancel-invitation.spec.ts`      |
| 3143, 3145, 3152                   | Admin Console > Sidebar Menu > People > Members (tab) > Remove                                                                        | `admin-console/people-members-remove.spec.ts`                 |
| 3078, 3079, 3080, 3081             | Enterprise Dashboard > Teams Dropdown > Team Management Options > Invitations (Enterprise)                                            | `dashboard-enterprise/teams-dropdown-invitations.spec.ts`     |
| 3211, 3212, 3213                   | Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Change team organization                          | `dashboard-enterprise/team-settings-change-org.spec.ts`       |

## How Enterprise entitlement actually works

There are two ways to get an Enterprise-entitled account for a test:

- **Real Stripe test-mode checkout in the UI** — the only path before this
  was introduced, and still what most specs use.
  `StripePage.completeEnterpriseTrialCheckout()` drives it end-to-end
  (~15-20s), fully automated, not a blocker. `enterprisePageTest` uses this.
- **Penpot's activation-code RPCs** (request + redeem; see
  `helpers/organizations/activate-enterprise-license.ts` for the exact
  endpoints) against a reachable licenses-manager instance — that machine
  needs its own activation-codes flag enabled first (see `.env.example`'s
  `LICENSES_MANAGER_URL` comment; a config flag on that machine, not
  something this repo sets or checks). Grants the same entitlement without
  touching Stripe — the resulting subscription state is the same either
  way, just flagged as manually granted rather than through the checkout.
  `enterpriseActivatedPageTest` uses this;
  `admin-console/settings-rename-organization.spec.ts` is the first spec
  migrated to it, as a proof of concept.
  `ownerAndInviteeActivatedTest` is the two-actor counterpart (owner
  activated, invitee still a real account) —
  `admin-console/people-members-remove.spec.ts` uses it, pairing
  `createOrgForLicensedAccount()` in place of `subscribeAndCreateOrg()`.

**This is a migration in progress, not a settled split.** The intent is
for the activation-code path to become the default wherever a case doesn't
specifically need to exercise the checkout/trial UI itself, keeping Stripe
for the cases that do (the `billing-ui-flow/` files, Qase 3437) — but how
much of the suite migrates, and when, is still being decided. One
consequence once more of the suite depends on it: `LICENSES_MANAGER_URL`
(currently optional, PRE/developer environments only) would need to become
a required part of running this suite, not just an opt-in extra a handful
of specs skip without. For now it stays unset by default, so
`enterpriseActivatedPageTest` `test.skip()`s automatically rather than
failing wherever it isn't configured.

`tests/enterprise/fixtures/enterprise-fixtures.ts` is the one place to look
for every Enterprise-specific test object and what it extends (its own
top-of-file comment maps the hierarchy):

- `enterprisePageTest` — the default: extends `demoAccountApiFixture` with
  the 5 page objects (`orgPage`, `adminConsolePage`, `stripePage`,
  `teamPage`, `advancedPermissionsPage`) nearly every case needs,
  pre-instantiated against `page`.
- `enterpriseActivatedPageTest` — extends `enterpriseDemoAccountApiFixture`
  (Enterprise counterpart to `demoAccountApiFixture`) with the same 5 page
  objects; the account is already Enterprise-entitled via the
  activation-code RPC path above instead of a Stripe checkout.
  `test.skip()`s automatically when `LICENSES_MANAGER_URL` is unset, so
  specs using it stay green outside PRE/dev rather than failing.
- `ownerAndInviteeTest` — two independent, simultaneously logged-in
  accounts as sibling fixtures (`ownerPage`, `invitee`), for cases needing
  a real non-owner org member. Owner entitled via Stripe. Also carries the
  same 5 page objects, bound to `ownerPage`.
- `ownerAndInviteeActivatedTest` — extends `ownerAndInviteeTest`, overriding
  only `ownerPage` to use the activation-code path instead; `invitee` and
  the 5 page objects are inherited as-is. Same `LICENSES_MANAGER_URL`-gated
  auto-skip as `enterpriseActivatedPageTest`.

Use `demoAccountApiFixture`/`enterpriseDemoAccountApiFixture` directly only
for a case needing none of the 5 page objects.

Demo profiles (and anything solely owned by them) are purged automatically
after 7 days — no manual cleanup needed for enterprise test data.

## Page objects

| File                                                       | Covers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/dashboard/organization-page.ts`                     | Dashboard-side entry points: sidebar "+ Create org" button/promo widget, "Unlock Enterprise features" modal, org switcher dropdown, "Create organization" naming modal. Also `acceptOrgInviteFromInbox(email, orgName)` — see `helpers/accounts/` below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `pages/admin-console/admin-console-page.ts`                | The Admin Console app (`/admin-console/...`): welcome/empty state, its own "Unlock Enterprise Features" modal (a different component from the dashboard's), org settings modal (rename/delete), its own org switcher and user menu, Teams tab table (`TeamsTableColumn`), People tab's Members (`PeopleTableColumn`) and Pending (`PendingTableColumn`) sub-tables, org-level "Invite people" modal.                                                                                                                                                                                                                                                                                                                                                                   |
| `pages/dashboard/stripe-page.ts`                           | `completeEnterpriseTrialCheckout(cardNumber?, taxId?, expectSuccess?)` drives the real hosted Stripe Checkout page. Also has the older embedded add-card-iframe methods used by `tests/subscription-plans/*`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `helpers/stripe-test-cards.ts`                             | Named Stripe test-mode card numbers instead of magic strings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `helpers/organizations/create-org-name.ts`                 | `createOrgName()` — mirrors `createTeamName()`'s shape.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `helpers/organizations/subscribe-and-create-org.ts`        | `subscribeAndCreateOrg(orgPage, adminConsolePage, stripePage, orgName)` — the "+ Create org" → checkout → name sequence, deduplicated from 17 call sites. Cases exercising a different entry point keep their own inline steps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `helpers/organizations/activate-enterprise-license.ts`     | `activateEnterpriseLicense(request)` — the RPC → licenses-manager `/api/activation-codes/create` → RPC path that grants Enterprise without Stripe. PRE/dev only (`LICENSES_MANAGER_URL`); see "How Enterprise entitlement actually works" above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `helpers/organizations/create-org-for-licensed-account.ts` | `createOrgForLicensedAccount(orgPage, orgName)` — `subscribeAndCreateOrg`'s counterpart for `enterpriseActivatedPageTest`/`ownerAndInviteeActivatedTest`: the sidebar promo button already reads "Create organization" once entitled, so it's a single click straight to the naming modal, no checkout step.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `helpers/accounts/`                                        | Every "get a logged-in session" primitive: `create-demo-user.ts` (`createDemoUser`, API-only), `create-activated-demo-user.ts` (`createActivatedDemoUser`, wraps it with `activateEnterpriseLicense` — shared by `enterpriseDemoAccountApiFixture` and `ownerAndInviteeActivatedTest`'s `ownerPage`), `login-as-demo-account.ts` (`loginAsDemoAccount`), `register-new-account.ts` (`registerNewAccount`, real Gmail-alias account), `create-invitee-session.ts` (`createInviteeSession`, a real second account in its own context — not a demo one, since a demo profile's inbox is unreadable and can't accept an org invite). Prefer `ownerAndInviteeTest`/`ownerAndInviteeActivatedTest` over calling `createInviteeSession()` directly — it also handles cleanup. |
| `pages/admin-console/advanced-permissions-page.ts`         | The Advanced Permissions tab — 4 policy radio groups sharing one self-healing `selectPermission()`/`isPermissionSelected()` pair typed against `AdvancedPermissionValue`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pages/admin-console/admin-console-page.ts` (logo section) | The org settings modal's logo upload, sharing the rename flow's Save button/toast. `isOrgLogoShown(orgName)` matches by alt text, only present once a real logo is chosen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `pages/dashboard/team-page.js` (Enterprise additions)      | Team Settings' "Team organization" section — add/remove a team from an org.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `helpers/gmail.js` (Enterprise additions)                  | `getMessageSubject()`, plus `checkEnterpriseInviteText`/`checkEnterpriseInviteSubject` for the org-scoped invite template.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Assertions live in the page objects, not spec files — every `expect()` a
case needs is a named `isXVisible()`/`isXListed()`/`hasX()` method with its
own descriptive message. A spec reading its own domain's raw state (an HTTP
status, say) is the one exception.

## Running the suite

Priority tags (`@critical`/`@high`/`@medium`, Qase priority) are still on
each case, but there's no automation-tier tagging for now — every case
(implemented or `test.skip` stub) runs together in one go:

- `npm run test:enterprise` — local run, `--workers=8` (global default is 3) — roughly halves wall-clock time here without the flakiness seen at
  higher counts on local dev hardware (genuine dev-server strain, not a
  bug). `BasePage.acceptCookie()` (shared repo-wide) was hardened with a
  retry-until-succeeds loop after a still-loading page image was found
  intercepting its click under load.
- `.github/workflows/playwright_enterprise_manual.yml` (manual
  `workflow_dispatch` only — the suite still has unimplemented stubs, and
  some cases genuinely delete orgs/accounts) runs the same thing in CI.
  Needs `BASE_URL` and the Qase secrets — `demoAccountApiFixture` is
  API-based and Stripe checkout is UI-driven with hardcoded test cards, so
  most of the other Playwright workflows' secrets don't apply — except the
  Gmail ones (`LOGIN_PWD`, `GMAIL_NAME`, `GMAIL_DOMAIN`, `REFRESH_TOKEN`,
  `CLIENT_ID`, `CLIENT_SECRET`), still needed for `ownerAndInviteeTest`'s
  real second account and any case using `createInviteEmail()`. `--workers` stays
  at the config default rather than the `--workers=8` tuned for local dev
  hardware — a GitHub runner needs its own calibration first.

Some cases (in `destructive/` and `billing-ui-flow/`) permanently mutate
plan/org state, need a non-Enterprise starting plan, or drive the real
Stripe checkout/trial UI itself — kept in their own files per the
automation plan (section 2.6), not because they're excluded from a run.

## Layout

```
dashboard-enterprise/  cases from the "Enterprise Dashboard" Qase suite
admin-console/         cases from the "Admin Console" Qase suite
destructive/           the 7 cases that permanently mutate plan/org state or need a non-Enterprise starting plan
billing-ui-flow/       the 7 cases that drive the real Stripe checkout/trial UI itself
fixtures/              enterprisePageTest/enterpriseActivatedPageTest/ownerAndInviteeTest and the 5 shared page objects
```

Spec files group cases by Qase suite (see each file's header comment)
except `destructive/` and `billing-ui-flow/`, which pull cases out
because of what they do to plan/org state, not which Qase suite they
belong to.
