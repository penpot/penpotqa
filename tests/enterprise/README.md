# Enterprise Plan test suite

Playwright specs for Penpot's Enterprise plan: organizations, Admin Console,
advanced permissions, SSO and billing. They run in their own `enterprise`
project, separate from the default `chrome` one.

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
- `helpers/teams/accept-team-invite.ts`: the invitee accepts a team invite
  from their inbox and lands on the team dashboard
- `helpers/gmail.js`: inbox polling and enterprise invite email checks
- `helpers/stripe-test-cards.ts`: named Stripe test card numbers

## Conventions

- Assertions live in page objects (`isX()`/`hasX()` methods with a
  descriptive message), not in spec files.
- Spec files are grouped by Qase suite (see each file's header comment).
  `destructive/` and `billing-ui-flow/` are the exception: they hold cases
  that permanently change plan/org state or drive the Stripe UI.
