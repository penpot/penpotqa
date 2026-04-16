# JS to TS Migration Guide

Steps to migrate a `.spec.js` test file to `.spec.ts`:

## 1. Convert imports

Replace `require` with `import`. Always use path aliases instead of relative paths for project modules:

```js
// Before
const { mainTest } = require('../../fixtures');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');

// After
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '@pages/profile-page';
```

Apply this rule to all imports from project modules: `fixtures`, page objects, helpers, etc. Only third-party packages keep their original import paths.

## 2. Declare page object instances at file scope

Declare page object instances as `let` variables **outside** of `beforeEach`, and assign them inside `beforeEach`:

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

This applies at every scope level: outer `describe`, inner `describe`, etc.

## 3. Migrate local fixture files

If the spec imports from a local fixture file (e.g. `your-account-fixture.js`), migrate that fixture to `.ts` too. Add a type for custom fixtures and pass it as a generic to `.extend<T>()`:

```ts
import { mainTest } from 'fixtures';
import { ProfilePage } from '@pages/profile-page';

type AccountFixtures = {
  profilePage: ProfilePage;
};

export const profileTest = mainTest.extend<AccountFixtures>({
  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    // setup...
    await use(profilePage);
  },
});
```

Replace `module.exports = { ... }` with named `export` on each const.

## 4. Add non-null assertion operator (`!`)

When accessing properties on values that could be `null` or `undefined` (e.g. return values from async helpers), add the `!` suffix to suppress TS null/undefined warnings:

```ts
// Before
await checkNewEmailText(changeEmail.inviteText, name, newEmail);
await page.goto(changeEmail.inviteUrl);

// After
await checkNewEmailText(changeEmail!.inviteText, name, newEmail);
await page.goto(changeEmail!.inviteUrl);
```

Common cases: return values from Gmail helpers (`getRegisterMessage`, `waitMessage`), Stripe helpers, or any function that returns `T | undefined`.

## 5. Rename snapshot folder

If a `<spec-name>.spec.js-snapshots` directory exists next to the spec file, rename it to `<spec-name>.spec.ts-snapshots`:

```bash
mv tests/path/to/foo.spec.js-snapshots tests/path/to/foo.spec.ts-snapshots
```

Do this as part of the migration, before confirming it is complete.

## 6. Keep `.js` originals during migration

Do not delete the original `.js` files until the user confirms the migration is complete.

## 7. Verify

Run `npx playwright test <path-to-new-ts-file> --list` to confirm Playwright resolves all tests correctly.
