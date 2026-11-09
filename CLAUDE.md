# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Playwright E2E test suite for [Penpot](https://penpot.app), an open-source UI/UX design tool. Tests run against a live Penpot instance configured via `BASE_URL` in `.env`.

## Commands

```bash
# Install
nvm use && npm install && npx playwright install

# Run all tests (Chrome)
npm test

# Run a single test file
npx playwright test tests/dashboard/dashboard-files.spec.ts --project=chrome

# Run tests matching a title pattern
npx playwright test -g "CO-154 Transform ellipse to path" --project=chrome

# Run only changed tests (since last commit)
npm run changed

# Run in UI mode (interactive)
npm run open

# Update visual snapshots (Chrome)
npm run updateSnapshots

# Format code
npm run prettier
```

## Architecture

### Page Object Model (POM)

All page interactions are abstracted into page objects under `pages/`:

- **`base-page.js`** — Shared locators and methods (viewport, context menus, save state). All workspace page objects use these.
- **`base-component.ts`** — Base class for component composition (shared by tokens and other TS page objects).
- **`pages/workspace/`** — Editor page objects: `main-page.js` (canvas), `design-panel-page.js`, `layers-panel-page.js`, `assets-panel-page.js`, `color-palette-page.js`, `inspect-panel-page.js`, `view-mode-page.js`, `comments-panel-page.js`, `plugins-page.js`, `history-panel-page.js`
- **`pages/workspace/workspace-page.ts`** — Composes the editor by UI region: `leftSidebar` (`pages/workspace/left-sidebar/`, e.g. `layers`), `rightSidebar.design` (`pages/workspace/right-sidebar/design-tab/`: `stroke`, `blur`, `layoutContainer`, `layoutItem`, `gridCell`, `export`). New locators and methods go in the component of their region, never in the legacy `*-page.js` files, which are migrated progressively (map in `.claude/skills/page-objects/references/workspace-map.md`).
- **`pages/workspace/tokens/`** — Design tokens feature (TypeScript). Uses `BaseComponent` as base class with a component composition pattern: `TokensBasePage` composes `SetsComponent`, `ThemesComponent`, `ToolsComponent`, and token-type components.
- **`pages/dashboard/`** — Dashboard and team management: `dashboard-page.js`, `team-page.js`, `dashboard-deleted-page.ts`
- **`pages/login-page.js`**, **`register-page.js`**, **`profile-page.js`**, **`forgot-password-page.js`** — Auth flows

### Test Fixtures (`fixtures.ts`)

Every test runs on a disposable account:

- **`demoAccountApiFixture`** — Creates a demo account via the API and lands on the dashboard. Default choice.
- **`demoAccountFileTest`** — Demo account with a blank (or imported, via `penpotFile`) file open in the editor.
- **`demoTeamWithInviteeTest`** / **`demoTeamWithMembersTest`** — Demo owner plus demo members in a shared team.
- **`registerTest`** — Creates a fresh account via Gmail API, for flows that need to read email. Provides `name` and `email` fixtures.

Demo accounts and everything they own are purged by the server, so there's no global teardown.

### Test Organization (`tests/`)

Tests are grouped by feature area. Each spec file imports from `fixtures` and uses the `qase()` wrapper to link tests to Qase test management IDs:

```typescript
import { demoAccountApiFixture } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

demoAccountApiFixture(qase(1234, 'Test title'), async ({ page }) => {
  await demoAccountApiFixture.step('Step description', async () => {
    // test logic
  });
});
```

New spec files must be TypeScript (`.spec.ts`). Legacy files in `.spec.js` are being migrated progressively.

**`tests/enterprise/`** is a separate suite (Enterprise-plan features —
Organizations, Admin Console, advanced permissions, SSO, billing), run via
its own `enterprise` Playwright project (`npm run test:enterprise`, kept out
of the default `chrome` project). Uses its own fixtures
(`enterprisePageTest`/`ownerAndInviteeTest` in
`tests/enterprise/fixtures/enterprise-fixtures.ts`). See
`tests/enterprise/README.md` before touching anything in this directory.

### Visual Regression

Snapshots are stored at `tests/{dir}/{file}-snapshots/`. Comparison threshold for Chrome is `0.0001`. Snapshots require **Ubuntu 24.04** at **1920x969** for consistency.

### Helpers (`helpers/`)

- `string-generator.js` — `random()` generates unique names for test isolation
- `gmail.js` — Gmail API for email verification (registration, invites)
- `stripe.js` — Stripe API for subscription/payment tests
- `saveTestResults.js` — Tracks pass/fail counts
- `sample-data.ts` — Shared test data constants
- `angle.js` — Angle calculation utilities
- `rect.js` — Rectangle geometry utilities
- `get-platform.js` — Platform detection helper
- `mattermost.helper.js` — Mattermost integration helpers

## Key Conventions

- **Mixed JS/TS codebase** — New code should use TypeScript. Legacy JS files use JSDoc type annotations.
- **Test isolation** — Tests run on disposable accounts and name teams/orgs with `createTeamName()`/`createOrgName()`, which add the run's `TEST_RUN_ID` (set in `tests/global.setup.ts`).
- **Formatting** — Prettier with single quotes, trailing commas, tab width 2, print width 85. Pre-commit hook enforces this via Husky.
- **Locator style** — Prefer Playwright's `getByRole()`, `getByTestId()`, `getByText()` over CSS selectors.
- **Path aliases** — `@tests/*` and `@pages/*` are configured in `tsconfig.json`.

## Environment

Requires `.env` file (see `.env.example`). Key variables: `BASE_URL`, `LOGIN_PWD` (password for accounts that tests register). Gmail and Stripe credentials needed only for registration and payment tests.

Node.js version is pinned in `.nvmrc` (v25.2.1).
