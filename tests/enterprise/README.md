# Enterprise Plan test suite

Playwright specs for Penpot's Enterprise plan: organizations, Admin Console,
advanced permissions, SSO and billing. They run in their own `enterprise`
project, separate from the default `chrome` one.

**Status: 75 cases automated, 1 `test.skip` stub (3664).**

## Running

- `npm run test:enterprise` runs the whole suite locally with `--workers=8`.
  Higher counts start failing from dev-server load.
- `.github/workflows/playwright_enterprise_manual.yml` runs it in CI (manual
  trigger only, since some cases delete orgs and accounts). It needs
  `BASE_URL`, the Qase secrets and the Gmail ones (`LOGIN_PWD`, `GMAIL_NAME`,
  `GMAIL_DOMAIN`, `REFRESH_TOKEN`, `CLIENT_ID`, `CLIENT_SECRET`) for the
  cases with a real second account.

## Fixtures

All in `fixtures/enterprise-fixtures.ts`. Each one carries the shared page
objects (`orgPage`, `adminConsolePage`, `stripePage`, `teamPage`,
`advancedPermissionsPage`):

| Fixture                        | Accounts                                           | Enterprise via  |
| ------------------------------ | -------------------------------------------------- | --------------- |
| `enterprisePageTest`           | one demo account                                   | Stripe checkout |
| `enterpriseActivatedPageTest`  | one demo account                                   | activation code |
| `ownerAndInviteeTest`          | demo owner + real invitee (`ownerPage`, `invitee`) | Stripe checkout |
| `ownerAndInviteeActivatedTest` | demo owner + real invitee                          | activation code |

- **Stripe checkout** drives the real test-mode checkout in the UI (~15-20s).
  Keep it for cases that test the checkout or trial itself.
- **Activation code** grants Enterprise through the licenses-manager API, with
  no checkout. It needs `LICENSES_MANAGER_URL` (PRE/dev only); without it,
  these fixtures skip instead of failing. Pair it with
  `createOrgForLicensedAccount()` instead of `subscribeAndCreateOrg()`.
- **Demo accounts can't read email**, so any actor that has to accept an
  invite must be the real `invitee` account.
- Demo profiles and everything they own are purged after 7 days, so no
  cleanup is needed.

## Helpers

- `helpers/organizations/`: `createOrgName()`, `subscribeAndCreateOrg()`,
  `createOrgForLicensedAccount()`, `createSecondOrgFromAdminConsole()`,
  `activateEnterpriseLicense()`
- `helpers/accounts/`: demo users, real accounts and invitee sessions
  (prefer the `ownerAndInvitee*` fixtures over calling these directly)
- `helpers/teams/go-to-other-team.ts`: reach an org-less team once the
  account belongs to an org
- `helpers/gmail.js`: inbox polling and enterprise invite email checks
- `helpers/stripe-test-cards.ts`: named Stripe test card numbers

## Conventions

- Assertions live in page objects (`isX()`/`hasX()` methods with a
  descriptive message), not in spec files.
- Spec files are grouped by Qase suite (see each file's header comment).
  `destructive/` and `billing-ui-flow/` are the exception: they hold cases
  that permanently change plan/org state or drive the Stripe UI.

## Cases

| Qase IDs                                       | File                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| **Admin Console**                              |                                                                  |
| 3328, 3329, 3332, 3333, 3334                   | `admin-console/advanced-permissions-create-teams.spec.ts`        |
| 3342, 3343, 3344, 3345, 3346, 3348, 3349, 3626 | `admin-console/advanced-permissions-move-teams.spec.ts`          |
| 3569, 3571, 3573, 3574, 3576, 3577, 3579       | `admin-console/advanced-permissions-new-team-members.spec.ts`    |
| 3359, 3360, 3361, 3362, 3364                   | `admin-console/advanced-permissions-send-invitations.spec.ts`    |
| 3093, 3094, 3097, 3180, 3182, 3184             | `admin-console/navigation.spec.ts`                               |
| 3527, 3535, 3587                               | `admin-console/organization-sso.spec.ts`                         |
| 3302, 3308                                     | `admin-console/people-members-invite.spec.ts`                    |
| 3143, 3145, 3152                               | `admin-console/people-members-remove.spec.ts`                    |
| 3185                                           | `admin-console/people-pending-cancel-invitation.spec.ts`         |
| 3240                                           | `admin-console/settings-organization-logo.spec.ts`               |
| 3165, 3166                                     | `admin-console/settings-rename-organization.spec.ts`             |
| 3630                                           | `admin-console/teams-list.spec.ts`                               |
| 3894, 3895, 3897                               | `admin-console/teams-move-team.spec.ts`                          |
| 3099                                           | `admin-console/user-menu.spec.ts`                                |
| **Enterprise Dashboard**                       |                                                                  |
| 3120, 3123, 3127                               | `dashboard-enterprise/organization-management-leave-org.spec.ts` |
| 3239                                           | `dashboard-enterprise/organizations-dropdown.spec.ts`            |
| 3192, 3198                                     | `dashboard-enterprise/team-settings-add-remove-org.spec.ts`      |
| 3211, 3212, 3213                               | `dashboard-enterprise/team-settings-change-org.spec.ts`          |
| 3106                                           | `dashboard-enterprise/teams-dropdown-create-new-team.spec.ts`    |
| 3133                                           | `dashboard-enterprise/teams-dropdown-delete-team.spec.ts`        |
| 3078, 3079, 3080, 3081                         | `dashboard-enterprise/teams-dropdown-invitations.spec.ts`        |
| **Cross-cutting**                              |                                                                  |
| 3235, 3236, 3324, 3336, 3413, 3437, 3664       | `billing-ui-flow/subscribe-and-trial-flow.spec.ts`               |
| 3223, 3226, 3353, 3434, 3555, 3592             | `destructive/plan-destructive-and-cross-plan.spec.ts`            |
