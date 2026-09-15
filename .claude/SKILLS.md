# JS to TS Migration Guide

Steps to migrate a `.spec.js` test file to `.spec.ts`.

## 1. Convert imports

Replace `require` with `import`. Always use path aliases instead of relative paths for project modules:

```js
// Before
const { mainTest } = require('../../fixtures');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');

// After
import { ProfilePage } from '@pages/profile-page';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
```

Apply this rule to all imports from project modules: `fixtures`, page objects, helpers, etc. Only third-party packages keep their original import paths.

Sort all import statements alphabetically by module path:

```typescript
// Correct — sorted alphabetically
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';
```

Before finishing a migration, remove any import or variable that is not referenced in the file. Common leftovers are page objects imported and instantiated in `beforeEach` but never used in any test:

```typescript
// Incorrect — imported and instantiated but never used in tests
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';

let assetsPanelPage: AssetsPanelPage;

mainTest.beforeEach(async ({ page }) => {
  assetsPanelPage = new AssetsPanelPage(page); // remove this too
});
```

## 2. Declare page objects and variables at file scope

Declare page object instances as `let` variables **outside** of `beforeEach`, and assign them inside `beforeEach`. This applies at every scope level: outer `describe`, inner `describe`, etc.

```typescript
// Correct
let profilePage: ProfilePage;

mainTest.beforeEach(async ({ page }) => {
  profilePage = new ProfilePage(page);
});

// Incorrect — declaring inside beforeEach makes them unavailable to tests
mainTest.beforeEach(async ({ page }) => {
  const profilePage: ProfilePage = new ProfilePage(page);
});
```

Always generate the team name using `createTeamName()` — never `random().concat('autotest')`:

```typescript
// Correct
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

// Incorrect
import { random } from 'helpers/string-generator';

const teamName = random().concat('autotest');
```

## 3. Migrate local fixture files

If the spec imports from a local fixture file (e.g. `your-account-fixture.js`), migrate that fixture to `.ts` too. Add a type for the **new** fixtures only and pass it as a generic to `.extend<T>()`:

```ts
import { ProfilePage } from '@pages/profile-page';
import { mainTest } from 'fixtures';

type YourAccountFixtures = {
  profilePage: ProfilePage;
};

export const profileTest = mainTest.extend<YourAccountFixtures>({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    // setup...
    await use(profilePage);
  },
});
```

Because `profileTest` extends `mainTest`, it automatically inherits all of `mainTest`'s fixtures (e.g. `page`). You only need to declare the **new** fixtures in the generic type. Both base and custom fixtures are available in every test:

```ts
profileTest(qase([205], 'Logout from Account'), async ({ page, profilePage }) => {
  // page comes from mainTest, profilePage comes from YourAccountFixtures
});
```

Replace `module.exports = { ... }` with named `export` on each const.

## 4. Handle nullable return values explicitly

When an async helper returns `T | null | undefined` (e.g. `getRegisterMessage`, `waitMessage`, Stripe helpers), add an explicit null guard instead of using the non-null assertion operator (`!`). A null guard narrows the type for TypeScript and produces a clear failure message if the value is missing:

```ts
// Avoid — suppresses the error but crashes at runtime with no useful message
await checkNewEmailText(changeEmail!.inviteText, name, newEmail);
await page.goto(changeEmail!.inviteUrl);

// Prefer — fails fast with an explicit message and narrows the type
const changeEmail = await getRegisterMessage(email);
if (!changeEmail) throw new Error('Email confirmation not received');
await checkNewEmailText(changeEmail.inviteText, name, newEmail);
await page.goto(changeEmail.inviteUrl);
```

## 5. Migrate test steps

When migrating a test to TypeScript, **always wrap the test body in `mainTest.step()` calls** grouping actions by logical phase. The step syntax is identical in JS and TS.

If the original JS test already has steps, keep them as-is. If it has no steps, add them during migration using descriptive names that reflect what each group of actions does:

```typescript
// JS (before) — no steps
mainTest(qase([607], 'Add flex layout to board from right click'), async () => {
  await mainPage.addFlexLayoutViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.flexLayoutSection).toBeVisible();
});

// TS (after) — steps added
mainTest(qase([607], 'Add flex layout to board from right click'), async () => {
  await mainTest.step('Add flex layout via right click', async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Verify flex layout is applied', async () => {
    await expect(mainPage.flexLayoutSection).toBeVisible();
  });
});
```

**Step naming rules:**
- Use action-oriented names: `'Add flex layout via right click'`, `'Verify flex layout is applied'`
- Group setup actions together, assertions together
- Keep step names short and descriptive — no Qase IDs in the step name unless the original JS had them

**Qase IDs:** always wrap the Qase ID(s) in an array, even for a single ID — never pass a bare number:

```typescript
// Correct
qase([607], 'Add flex layout to board from right click')
qase([2905, 2873], 'Selecting via the Token Icon and detaching via the detach button')

// Incorrect — bare number, not wrapped in an array
qase(607, 'Add flex layout to board from right click')
```

## 6. Rename snapshot folder and clean up

If a `<spec-name>.spec.js-snapshots` directory exists next to the spec file, rename it to `<spec-name>.spec.ts-snapshots`. Snapshots live directly at the root of that directory (no OS/browser subfolders) — flatten any `linux/chrome` (or other OS/browser) snapshots into the root and delete the rest:

```bash
# 1. Rename the folder
mv tests/path/to/foo.spec.js-snapshots tests/path/to/foo.spec.ts-snapshots

# 2. Flatten linux/chrome snapshots to the root and delete all other OS/browser directories
SNAPSHOTS="tests/path/to/foo.spec.ts-snapshots"
if [ -d "$SNAPSHOTS/linux/chrome" ]; then
  mv "$SNAPSHOTS/linux/chrome"/* "$SNAPSHOTS/"
fi
find "$SNAPSHOTS" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +
```

Do this as part of the migration, before confirming it is complete.

## 7. Keep `.js` originals during migration

Do not delete the original `.js` files until the user confirms the migration is complete.

## 8. Verify

Run `npx playwright test <path-to-new-ts-file> --list` to confirm Playwright resolves all tests correctly.

# Feature-Area Test Suite Patterns

Conventions for building out a Playwright test suite for a new feature area
from scratch — page objects, fixtures, and reusable helpers — distilled
from adding a large new suite of tests to this repo.

## 1. Assertions live in page objects, not spec files

Every `expect()` a test needs should be a named method on the relevant page
object — `isXVisible()`, `isXListed()`, `hasX()` — with its own descriptive
assertion message. Spec files call these methods; they don't write raw
`expect()` calls themselves.

```ts
// Correct — page object owns the assertion
// pages/some-feature/some-feature-page.ts
async isDisplayingItem(itemName: string) {
  await expect(
    this.page.getByText(itemName, { exact: true }),
    `Page is displaying "${itemName}"`,
  ).toBeVisible();
}

// spec file
await featurePage.isDisplayingItem(itemName);
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
