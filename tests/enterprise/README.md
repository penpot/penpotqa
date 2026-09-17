# Enterprise Plan test suite

Playwright specs for Penpot's Enterprise-plan.

**Status: 39 implemented and passing live, 35 still `test.skip` stubs.**

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
| 3143                               | Admin Console > Sidebar Menu > People > Members (tab) > Remove                                                                        | `admin-console/people-members-remove.spec.ts`                 |
| 3078, 3079, 3080, 3081             | Enterprise Dashboard > Teams Dropdown > Team Management Options > Invitations (Enterprise)                                            | `dashboard-enterprise/teams-dropdown-invitations.spec.ts`     |
| 3211, 3212, 3213                   | Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Change team organization                          | `dashboard-enterprise/team-settings-change-org.spec.ts`       |

## How Enterprise entitlement actually works

No DB/RPC/API bypass exists for granting Enterprise — every test goes
through a real Stripe test-mode checkout in the UI.
`StripePage.completeEnterpriseTrialCheckout()` drives it end-to-end
(~15-20s), fully automated, not a blocker.

`tests/enterprise/fixtures/enterprise-fixtures.ts` is the one place to look
for every Enterprise-specific test object and what it extends (its own
top-of-file comment maps the hierarchy):

- `enterprisePageTest` — the default: extends `demoAccountApiFixture` with
  the 5 page objects (`orgPage`, `adminConsolePage`, `stripePage`,
  `teamPage`, `advancedPermissionsPage`) nearly every case needs,
  pre-instantiated against `page`.
- `ownerAndInviteeTest` — two independent, simultaneously logged-in
  accounts as sibling fixtures (`ownerPage`, `invitee`), for cases needing
  a real non-owner org member. Also carries the same 5 page objects, bound
  to `ownerPage`.

Use `demoAccountApiFixture` directly only for a case needing none of the 5
page objects.

Demo profiles (and anything solely owned by them) are purged automatically
after 7 days — no manual cleanup needed for enterprise test data.

## Page objects

| File                                                       | Covers                                                                                                                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/dashboard/organization-page.ts`                     | Dashboard-side entry points: "+ Create org", Enterprise modal, org switcher, org naming modal. Also `acceptOrgInviteFromInbox()`.                        |
| `pages/admin-console/admin-console-page.ts`                | The Admin Console app: welcome state, its own Enterprise modal, org settings, org switcher/user menu, Teams/People tables, org-level invite modal.       |
| `pages/dashboard/stripe-page.ts`                           | `completeEnterpriseTrialCheckout()` drives the real hosted Stripe Checkout page.                                                                         |
| `helpers/stripe-test-cards.ts`                             | Named Stripe test-mode card numbers instead of magic strings.                                                                                            |
| `helpers/organizations/create-org-name.ts`                 | `createOrgName()` — mirrors `createTeamName()`'s shape.                                                                                                  |
| `helpers/organizations/subscribe-and-create-org.ts`        | `subscribeAndCreateOrg()` — the "+ Create org" → checkout → name sequence, deduplicated from 17 call sites.                                              |
| `helpers/accounts/`                                        | Every "get a logged-in session" primitive — demo, login, register, and a real invitee session. Prefer `ownerAndInviteeTest` over calling these directly. |
| `pages/admin-console/advanced-permissions-page.ts`         | The Advanced Permissions tab — 4 policy radio groups, one self-healing `selectPermission()`/`isPermissionSelected()` pair.                               |
| `pages/admin-console/admin-console-page.ts` (logo section) | The org settings modal's logo upload. `isOrgLogoShown(orgName)` matches by alt text.                                                                     |
| `pages/dashboard/team-page.js` (Enterprise additions)      | Team org section — add/remove/move (`changeTeamOrganization()`), plus `getTeamIdFromUrl()` for direct navigation.                                        |
| `helpers/gmail.js` (Enterprise additions)                  | `getMessageSubject()`, plus `checkEnterpriseInviteText`/`checkEnterpriseInviteSubject` for the org-scoped invite template.                               |

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
fixtures/              enterprisePageTest/ownerAndInviteeTest and the 5 shared page objects
```

Spec files group cases by Qase suite (see each file's header comment)
except `destructive/` and `billing-ui-flow/`, which pull cases out
because of what they do to plan/org state, not which Qase suite they
belong to.
