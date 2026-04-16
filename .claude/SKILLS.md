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
