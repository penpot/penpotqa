# JS to TS Migration Guide

Steps to migrate a `.spec.js` test file to `.spec.ts`:

## 1. Convert imports

Replace `require` with `import`:

```js
// Before
const { mainTest } = require('../../fixtures');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');

// After
import { mainTest } from '../../fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '../../pages/profile-page';
```

## 2. Migrate local fixture files

If the spec imports from a local fixture file (e.g. `your-account-fixture.js`), migrate that fixture to `.ts` too. Add a type for custom fixtures and pass it as a generic to `.extend<T>()`:

```ts
import { mainTest } from '../../fixtures';
import { ProfilePage } from '../../pages/profile-page';

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

## 3. Add non-null assertion operator (`!`)

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

## 4. Keep `.js` originals during migration

Do not delete the original `.js` files until the user confirms the migration is complete.

## 5. Verify

Run `npx playwright test <path-to-new-ts-file> --list` to confirm Playwright resolves all tests correctly.
