---
name: test-suite-patterns
description: Conventions for building a Playwright test suite for a new penpotqa feature area — assertions in page objects, fixture composition, two-account tests, typed constants, self-healing retries for UI races, shared setup helpers, test data helpers, test.step grouping, debugging through the DOM, live/websocket updates, durable signals, file naming, waiting for saves, polling email and payments, slow tests, debugging tools and a do/don't list. Use this skill whenever you write a new suite or several new specs for a feature area, add fixtures or helpers for them, or fix a flaky test caused by timing, even if the user only says "add tests for this feature".
---

# Feature-Area Test Suite Patterns

Conventions for building out a Playwright test suite for a new feature area
from scratch — page objects, fixtures, and reusable helpers — distilled
from adding a large new suite of tests to this repo.

## 1. Assertions live in page objects, not spec files

Every `expect()` a test needs should be a named method on the relevant page
object, with its own descriptive assertion message. Spec files call these
methods; they don't write raw `expect()` calls themselves.

Both naming styles are valid for now:

- `check…`: `check<Thing>IsVisible()` (matching Playwright's `toBeVisible()`,
  not "Displayed"), `check<Thing>HasValue…()` (e.g.
  `checkWidthHasValueGreaterThan()`), or `check<Thing>()` for anything else
  (e.g. `checkEvenHorizontalSpacing()`).
- `is…` / `has…`: e.g. `isMemberListedInPeopleTable()`, `hasCurrentPlanSidebarText()`, as
  used in `tests/enterprise/`.

Follow the style of the file or feature area you're working in, and don't
rename existing methods just to switch style. What matters is that the
assertion lives in the page object and has a descriptive message.

```ts
// Correct — page object owns the assertion
// pages/some-feature/some-feature-page.ts
async checkItemIsVisible(itemName: string) {
  await expect(
    this.page.getByText(itemName, { exact: true }),
    `Item "${itemName}" is visible`,
  ).toBeVisible();
}

// spec file
await featurePage.checkItemIsVisible(itemName);
```

```ts
// Incorrect — raw expect() in the spec file
await expect(page.getByText(itemName, { exact: true })).toBeVisible();
```

The one exception is a spec reading its own domain's raw state that doesn't
belong to any page object (e.g. an HTTP response status).

## 2. Fixture composition for shared page objects

When most tests in a feature area need the same set of page objects, extend
the base test with a fixture that pre-instantiates them against `page`,
instead of repeating `new XPage(page)` at the top of every test:

```ts
type FeatureFixtures = {
  orgPage: OrganizationPage;
  adminConsolePage: AdminConsolePage;
};

export const featureTest = baseTest.extend<FeatureFixtures>({
  orgPage: async ({ page }, use) => use(new OrganizationPage(page)),
  adminConsolePage: async ({ page }, use) => use(new AdminConsolePage(page)),
});

// spec file — no `new XPage(page)` boilerplate
featureTest('...', async ({ orgPage, adminConsolePage }) => {
  /* ... */
});
```

Playwright fixtures are lazy — a test that destructures only `orgPage` never
pays for instantiating `adminConsolePage`.

## 3. Two-account tests: sibling fixtures, not one extending the other

For a test needing two simultaneously logged-in accounts, model them as two
**independent sibling fixtures** on one `.extend()` call — each with its own
`browser.newContext()` — rather than:

- a plain helper function called from the test body (needs manual
  `try`/`finally` cleanup), or
- one fixture `.extend()`-ing another (implies a parent/child relationship
  that doesn't actually exist).

```ts
type OwnerAndInviteeFixtures = {
  ownerPage: Page;
  invitee: InviteeSession; // { page, name, email, close }
};

export const ownerAndInviteeTest = base.extend<OwnerAndInviteeFixtures>({
  ownerPage: async ({ page }, use) => {
    /* log in as owner */
    await use(page);
  },
  invitee: async ({ browser }, use) => {
    const session = await createInviteeSession(browser); // own browser.newContext()
    await use(session);
    await session.close();
  },
});
```

This is Playwright's own documented pattern for testing multiple signed-in
roles at once. `page` itself isn't part of the intended surface — always
destructure `ownerPage`/`invitee` explicitly so there's no bare `page` to
misread.

## 4. Typed named constants instead of hardcoded strings

When a test enumerates a fixed, named set of UI labels (menu items, table
columns, radio options), define a colocated `export const X = {...} as
const` next to the page object, derive a union type from it, and type the
relevant method parameters against that union instead of `string`:

```ts
export const UserMenuItem = {
  YourAccount: 'Your account',
  HelpAndLearning: 'Help & Learning',
} as const;

export type UserMenuItemName = (typeof UserMenuItem)[keyof typeof UserMenuItem];

async isUserMenuItemVisible(name: UserMenuItemName) {
  /* ... */
}
```

A typo or stale label becomes a compile error instead of a silent runtime
miss.

## 5. Self-healing retries for real UI timing races

A single click can occasionally land before its handler has actually
attached (most common right after a fresh full-page navigation), causing a
click that's visibly valid to silently do nothing. Wrap the click and a
short-timeout check in `expect(async () => {...}).toPass({ timeout })`
instead of a single click followed by one long-timeout assertion:

```ts
async openSettings() {
  await expect(async () => {
    await this.settingsButton.click();
    await expect(this.settingsModal, '...').toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 15000 });
}
```

If an action can leave the underlying state stuck on a stale value (not just
the click missing), retry the whole action — click, reload/re-check,
confirm — not just the read; re-checking a value that's genuinely wrong
won't fix it.

## 6. Extract duplicated multi-step setup into a plain helper

When the same setup sequence is copy-pasted across many spec files, extract
it into a plain helper function taking the relevant page objects as
parameters — not a custom fixture, which would hide it from the test
report's step breakdown:

```ts
export async function subscribeAndCreateOrg(
  orgPage,
  adminConsolePage,
  stripePage,
  orgName,
) {
  /* ... */
}

// spec file — keep the explicit step wrapper for report clarity
await test.step('Setup: subscribe and create an organization', async () => {
  await subscribeAndCreateOrg(orgPage, adminConsolePage, stripePage, orgName);
});
```

## 7. Generate test data through a dedicated helper, never inline

Use a colocated `createXName()`/`createXEmail()` helper (see
`helpers/organizations/create-org-name.ts`,
`helpers/teams/create-team-name.ts`) for every generated name/email needed
for test isolation, rather than hand-rolling one inline. It keeps the
naming scheme (prefix + random + run id) consistent and in one place to
change later.

## 8. Group test bodies with `test.step()`

Every multi-action test wraps its body in `test.step('phase description',
async () => {...})` blocks, grouping setup / action / verification
separately. Step names are action-oriented and describe what happens, not
raw ticket IDs or generic labels.

## 9. Write each fact once, where it's authoritative

If a page object method or fixture already documents a behavior in its own
doc comment, don't repeat that explanation in every spec file that calls it
(or in a project README) — link/point to it by name instead. A fact
restated in three places drifts out of sync the moment only one of them
gets updated.

## 10. Debug via direct DOM inspection, not longer timeouts

When a locator/assertion behaves inconsistently — failing even though other
evidence (a screenshot, a different check) suggests the element was
actually there — drop into a direct DOM query instead of guessing at
timeout adjustments:

```ts
const info = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[class*="toast"]')).map(
    (el) => el.outerHTML,
  ),
);
console.log(info);
```

A throwaway probe test (write it, run it, delete it once you have your
answer) is usually faster than iterating on timeouts blind.

Other debugging tools:

- `npm run open`: UI mode, with time travel, watch mode, locator picker and
  trace viewer.
- `npx playwright test <spec> --project=chrome --debug`: step through one test.
- `headless: false` in `playwright.config.ts` (locally only) to watch it run.
- `npx playwright show-trace trace.zip`: open a trace from a failed run.
- Clipboard not working: check the `clipboard-read` / `clipboard-write`
  permissions of the project in `playwright.config.ts`.
- Fails only in CI: check the CI settings (retries, timeout), the trace and
  video artifacts, and the environment secrets.

## 11. A fresh connection, not just a longer wait, for live/websocket updates

Anything driven by a live push (not a page-load-time read) needs the
receiving page to have a genuinely fresh navigation right before the
triggering action, or the push can silently never arrive no matter how long
the timeout:

```ts
await page.goto('/');
await page.waitForLoadState('networkidle');
// ... now trigger the action that pushes the update
```

Increasing a timeout doesn't help if the connection itself was never
(re-)established.

## 12. Assert the durable signal, not the transient one

When two things would both prove an action succeeded — a toast/banner
that's easy to miss, and a state change you can check any time afterward (a
row gone from a table, a count updated) — assert on the durable one. Don't
build retry logic around a flaky transient signal if a more essential one
already covers what matters:

```ts
// Prefer — durable: the table's own state
await isMemberListedInPeopleTable(name, false);

// Over chasing a toast that may already be gone
await expect(page.getByText('Success')).toBeVisible();
```

## 13. Name files after what they export

Rename a helper file to match its exported function/class name exactly
(e.g. `register-account.ts` → `register-new-account.ts` for
`registerNewAccount()`). A directory listing becomes self-documenting — the
right helper is findable without opening files.

## 14. Wait for the save after every change in a file

Penpot saves file changes in the background. After an action that changes the
file, wait for the saved state before the next step or assertion:

```javascript
await mainPage.createDefaultRectangleByCoordinates(200, 300);
await mainPage.waitForChangeIsSaved();
```

`waitForChangeIsSaved()` / `waitForChangeIsUnsaved()` live in
`pages/base-page.js` and wait for the save status icon.

## 15. Poll external services with a deadline

Email (Gmail) and payments (Stripe) arrive with a delay. Poll them in a loop
with an interval and a total timeout, and fail with a clear error when the
deadline passes, as `waitMessage()` in `helpers/gmail.js` and
`waitCustomersWithPenpotId()` in `helpers/stripe.js` do. Reuse those helpers
instead of adding a fixed wait.

## 16. Mark slow tests instead of raising timeouts

For a test that is legitimately slow, mark it as slow (it multiplies the
timeout by 3) instead of hardcoding longer timeouts:

```typescript
demoAccountApiFixture.beforeEach(async () => {
  demoAccountApiFixture.slow();
});
```

This doesn't fix a timing race: for that, see sections 5, 10 and 11.

## 17. Do and don't

Do:

- Use page objects and a disposable-account fixture (one account per test).
- Name teams and organizations with `createTeamName()` / `createOrgName()`.
- Give each test a descriptive title and its Qase ID.
- Keep tests independent so they run fully in parallel.

Don't:

- Leave `test.only()` in the code (CI fails with `forbidOnly`).
- Hardcode timeouts or use `waitForTimeout` unless there's no other signal.
- Share accounts, teams or state between tests, or rely on execution order.
- Use `workers: 1` unless necessary.
- Commit with failing tests.
