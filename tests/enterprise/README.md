# Enterprise Plan test suite

Playwright specs for Penpot's Enterprise-plan.

**Status: 31 implemented and passing live, 43 still `test.skip` stubs.**
Implemented so far: PENPOT-3235, 3236, 3324, 3336, 3239 (in
`billing-ui-flow/subscribe-and-trial-flow.spec.ts` and
`dashboard-enterprise/organizations-dropdown.spec.ts`), 3165/3166/3240 (in
`admin-console/settings-rename-organization.spec.ts` and
`admin-console/settings-organization-logo.spec.ts`), 3223/3226 (in
`destructive/plan-destructive-and-cross-plan.spec.ts`), 3093/3094/3097/3180/3182/3184
(in `admin-console/navigation.spec.ts`), 3099 (in
`admin-console/user-menu.spec.ts`), 3630 (in
`admin-console/teams-list.spec.ts`), 3106/3133 (in
`dashboard-enterprise/teams-dropdown-create-new-team.spec.ts` and
`dashboard-enterprise/teams-dropdown-delete-team.spec.ts`), 3328/3329/3332/3333/3334
(in `admin-console/advanced-permissions-create-teams.spec.ts`), 3192/3198 (in
`dashboard-enterprise/team-settings-add-remove-org.spec.ts`), 3302/3308/3185
(People tab invite/pending flows, in
`admin-console/people-members-invite.spec.ts` and
`admin-console/people-pending-cancel-invitation.spec.ts`), and 3143 (member
removal consequences, in `admin-console/people-members-remove.spec.ts`).

Run with the dedicated `enterprise` Playwright project (kept out of the
default `chrome` project so these stubs don't show up in every-day `npm test`
runs):

```bash
npx playwright test --project=enterprise --list
npx playwright test --project=enterprise -g "3235|3236|3324|3336|3239|3165|3166|3223|3226|3093|3094|3097|3180|3182|3184|3099|3630|3106|3133|3328|3329|3240|3192|3198|3302|3308|3185|3332|3333|3334|3143"  # the 31 real ones
```

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

| File                                                       | Covers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/dashboard/organization-page.ts`                     | Dashboard-side entry points: sidebar "+ Create org" button/promo widget, "Unlock Enterprise features" modal, org switcher dropdown, "Create organization" naming modal. Also `acceptOrgInviteFromInbox(email, orgName)` — see `helpers/accounts/` below.                                                                                                                                                                                                                                                                                  |
| `pages/admin-console/admin-console-page.ts`                | The Admin Console app (`/admin-console/...`): welcome/empty state, its own "Unlock Enterprise Features" modal (a different component from the dashboard's), org settings modal (rename/delete), its own org switcher and user menu, Teams tab table (`TeamsTableColumn`), People tab's Members (`PeopleTableColumn`) and Pending (`PendingTableColumn`) sub-tables, org-level "Invite people" modal.                                                                                                                                      |
| `pages/dashboard/stripe-page.ts`                           | `completeEnterpriseTrialCheckout(cardNumber?, taxId?, expectSuccess?)` drives the real hosted Stripe Checkout page. Also has the older embedded add-card-iframe methods used by `tests/subscription-plans/*`.                                                                                                                                                                                                                                                                                                                             |
| `helpers/stripe-test-cards.ts`                             | Named Stripe test-mode card numbers instead of magic strings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `helpers/organizations/create-org-name.ts`                 | `createOrgName()` — mirrors `createTeamName()`'s shape.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `helpers/organizations/subscribe-and-create-org.ts`        | `subscribeAndCreateOrg(orgPage, adminConsolePage, stripePage, orgName)` — the "+ Create org" → checkout → name sequence, deduplicated from 17 call sites. Cases exercising a different entry point keep their own inline steps.                                                                                                                                                                                                                                                                                                           |
| `helpers/accounts/`                                        | Every "get a logged-in session" primitive: `create-demo-user.ts` (`createDemoUser`, API-only), `login-as-demo-account.ts` (`loginAsDemoAccount`), `register-new-account.ts` (`registerNewAccount`, real Gmail-alias account), `create-invitee-session.ts` (`createInviteeSession`, a real second account in its own context — not a demo one, since a demo profile's inbox is unreadable and can't accept an org invite). Prefer `ownerAndInviteeTest` in tests over calling `createInviteeSession()` directly — it also handles cleanup. |
| `pages/admin-console/advanced-permissions-page.ts`         | The Advanced Permissions tab — 4 policy radio groups sharing one self-healing `selectPermission()`/`isPermissionSelected()` pair typed against `AdvancedPermissionValue`.                                                                                                                                                                                                                                                                                                                                                                 |
| `pages/admin-console/admin-console-page.ts` (logo section) | The org settings modal's logo upload, sharing the rename flow's Save button/toast. `isOrgLogoShown(orgName)` matches by alt text, only present once a real logo is chosen.                                                                                                                                                                                                                                                                                                                                                                |
| `pages/dashboard/team-page.js` (Enterprise additions)      | Team Settings' "Team organization" section — add/remove a team from an org.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

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
  Needs only `BASE_URL` plus the Qase secrets — `demoAccountApiFixture` is
  API-based and Stripe checkout is UI-driven with hardcoded test cards, so
  none of the other Playwright workflows' secrets apply. `--workers` stays
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
