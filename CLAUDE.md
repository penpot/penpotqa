# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Playwright E2E test suite for [Penpot](https://penpot.app), an open-source UI/UX design tool. Tests run against a live Penpot instance configured via `BASE_URL` in `.env`.

## Commands

```bash
# Install
nvm use && npm install && npx playwright install

# Run all tests (Chrome, excludes performance)
npm test

# Run a single test file
npx playwright test tests/dashboard/dashboard.spec.js --project=chrome

# Run tests matching a title pattern
npx playwright test -g "CO-154 Transform ellipse to path" --project=chrome

# Run only changed tests (since last commit)
npm run changed

# Run in UI mode (interactive)
npm run open

# Other browsers
npm run firefox
npm run webkit

# Update visual snapshots (Chrome + Firefox)
npm run updateSnapshots

# Format code
npm run prettier
```

## Architecture

### Page Object Model (POM)

All page interactions are abstracted into page objects under `pages/`:

- **`base-page.js`** — Shared locators and methods (viewport, context menus, save state). All workspace page objects use these.
- **`pages/workspace/`** — Editor page objects: `main-page.js` (canvas), `design-panel-page.js`, `layers-panel-page.js`, `assets-panel-page.js`, `color-palette-page.js`, `prototype-panel-page.js`, `inspect-panel-page.js`, `view-mode-page.js`, `comments-panel-page.js`, `plugins-page.js`
- **`pages/workspace/tokens/`** — Design tokens feature (TypeScript). Uses `BaseComponent` (`base-component.ts`) as base class with a component composition pattern: `TokensBasePage` composes `SetsComponent`, `ThemesComponent`, `ToolsComponent`, and token-type components.
- **`pages/dashboard/`** — Dashboard and team management: `dashboard-page.js`, `team-page.js`
- **`pages/login-page.js`**, **`register-page.js`**, **`profile-page.js`** — Auth flows

### Test Fixtures (`fixtures.js`)

- **`mainTest`** — Auto-logs in before each test, lands on dashboard. Used by most tests.
- **`registerTest`** — Creates a fresh account via Gmail API. Provides `name` and `email` fixtures.
- **`performanceTest`** — Logs in and imports a large `.penpot` file for perf benchmarks.

### Test Organization (`tests/`)

Tests are grouped by feature area. Each spec file imports from `fixtures.js` and uses the `qase()` wrapper to link tests to Qase test management IDs:

```javascript
const { mainTest } = require('../../fixtures');
const { qase } = require('playwright-qase-reporter/playwright');

mainTest(qase(1234, 'Test title'), async ({ page }) => {
  await mainTest.step('Step description', async () => {
    // test logic
  });
});
```

### Visual Regression

Snapshots are stored at `tests/{dir}/{file}-snapshots/linux/{browser}/`. Comparison thresholds differ per browser (Chrome: `0.0001`, WebKit: `0.01`). Snapshots require **Ubuntu 24.04** at **1920x1080** for consistency.

### Helpers (`helpers/`)

- `string-generator.js` — `random()` generates unique names for test isolation
- `gmail.js` — Gmail API for email verification (registration, invites)
- `stripe.js` — Stripe API for subscription/payment tests
- `saveTestResults.js` — Tracks pass/fail counts
- `sample-data.ts` — Shared test data constants

## Key Conventions

- **Mixed JS/TS codebase** — New code should use TypeScript. Legacy JS files use JSDoc type annotations.
- **Test isolation** — Tests create uniquely-named teams/files via `random()` to avoid conflicts across parallel workers (default: 3).
- **Global teardown** (`tests/global.teardown.ts`) — Deletes teams matching `autotest` pattern after test runs.
- **Formatting** — Prettier with single quotes, trailing commas, tab width 2, print width 85. Pre-commit hook enforces this via Husky.
- **Locator style** — Prefer Playwright's `getByRole()`, `getByTestId()`, `getByText()` over CSS selectors.
- **Path aliases** — `@tests/*` and `@pages/*` are configured in `tsconfig.json`.

## Environment

Requires `.env` file (see `.env.example`). Key variables: `LOGIN_EMAIL`, `LOGIN_PWD`, `SECOND_EMAIL`, `BASE_URL`. Gmail and Stripe credentials needed only for registration and payment tests.

Node.js version is pinned in `.nvmrc` (v25.2.1).
