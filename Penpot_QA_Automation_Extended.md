# 🛠️ Penpot QA Automation - Extended Documentation

## Introduction

This document contains comprehensive information about the Penpot QA automation project, including architecture, setup, execution, testing patterns, and maintenance guidelines. The project uses Playwright framework for end-to-end testing.

---

## 📑 Table of Contents

### 🚀 Getting Started

- [1. Initial Requirements and Configuration](#1-initial-requirements-and-configuration)
- [2. Project Structure](#2-project-structure)
- [3. Test Run: Main Notes](#3-test-run-main-notes)
- [4. Playwright Configuration Deep Dive](#4-playwright-configuration-deep-dive)

### 🏗️ Core Architecture

- [5. Custom Fixtures - The Core of Test Architecture](#5-custom-fixtures---the-core-of-test-architecture)
- [6. Test Isolation Strategy - Parallel Execution Without Conflicts](#6-test-isolation-strategy---parallel-execution-without-conflicts)
- [7. Page Object Model (POM) Architecture](#7-page-object-model-pom-architecture)

### 🧪 Testing Approaches

- [8. Visual Regression Testing with Snapshots](#8-visual-regression-testing-with-snapshots)
- [9. Wait Strategies and Timing](#9-wait-strategies-and-timing)
- [10. Gmail API Integration](#10-gmail-api-integration)
- [11. Stripe API Integration](#11-stripe-api-integration)

### 📊 Test Management

- [12. Test Management with Qase](#12-test-management-with-qase)
- [13. Test Result Tracking](#13-test-result-tracking)
- [14. CI/CD with GitHub Actions](#14-cicd-with-github-actions)
- [15. Code Quality Tools](#15-code-quality-tools)

### 📦 Test Data & Patterns

- [16. Test Data Management](#16-test-data-management)
- [17. Common Test Patterns](#17-common-test-patterns)
- [18. Debugging and Troubleshooting](#18-debugging-and-troubleshooting)
- [19. Best Practices](#19-best-practices)

### 🔧 Maintenance & Support

- [20. Maintenance Guidelines](#20-maintenance-guidelines)
- [21. Important Technical Details](#21-important-technical-details)

### 🎯 Architecture Decisions

- [23. Key Architecture Decisions](#23-key-architecture-decisions)
- [24. Summary Checklist](#24-summary-checklist)

### 📚 Resources

- [25. Additional Resources and Documentation](#25-additional-resources-and-documentation)
- [26. Contact and Support](#26-contact-and-support)

---

## 1. Initial Requirements and Configuration

### Prerequisites for Local Run

- **Operating System**: Ubuntu 24.04 (required for snapshot consistency)
- **Screen Resolution**: 1920х1080
- **Node.js**: v25.2.1
- **Penpot Account**: "Clean" account (no files/projects) with completed onboarding flow, and the account name must be 'QA Engineer'

### .env File Configuration

Create an `.env` file in the root directory with the following variables:

| Variable        | Purpose                                     |
| --------------- | ------------------------------------------- |
| `LOGIN_EMAIL`   | Email from your Penpot account              |
| `SECOND_EMAIL`  | Second email from your Penpot account       |
| `LOGIN_PWD`     | Password from your Penpot account           |
| `BASE_URL`      | Penpot URL (e.g., `http://localhost:9001/`) |
| `GMAIL_NAME`    | Gmail account name for email verification   |
| `GMAIL_DOMAIN ` | Gmail account domain for email verification |
| `REFRESH_TOKEN` | Token for Gmail API access                  |
| `CLIENT_ID`     | Client ID for Gmail API access              |
| `CLIENT_SECRET` | Client Secret for Gmail API access          |
| `STRIPE_SK`     | Stripe Secret Key for Stripe API access     |

---

## 2. Project Structure

```
penpotqa1/
├── .github/              # GitHub Actions workflows
│   ├── workflows/        # CI/CD workflow definitions
│   └── actions/          # Custom GitHub actions
├── .husky/               # Git hooks (pre-commit)
├── documents/            # Test data files (Penpot files, JSON tokens)
├── fonts/                # Font files for testing
├── helpers/              # Utility/helper functions
│   ├── gmail.js          # Gmail API integration (415 lines)
│   ├── stripe.js         # Stripe API integration (253 lines)
│   ├── saveTestResults.js # Test result tracking
│   ├── string-generator.js # Random string generation
│   ├── mattermost.helper.js # Mattermost notifications
│   ├── get-platform.js   # Platform detection
│   ├── rect.js           # DOM geometry utilities
│   └── angle.js          # Angle conversion
├── images/               # Test image assets
├── pages/                # Page Object Models
│   ├── dashboard/        # Dashboard-related pages
│   │   ├── dashboard-page.js
│   │   ├── team-page.js
│   │   └── stripe-page.js
│   ├── workspace/        # Workspace/editor pages
│   │   ├── main-page.js
│   │   ├── design-panel-page.js
│   │   ├── layers-panel-page.js
│   │   ├── assets-panel-page.js
│   │   ├── tokens-panel-page.js
│   │   ├── color-palette-page.js
│   │   ├── comments-panel-page.js
│   │   ├── prototype-panel-page.js
│   │   ├── view-mode-page.js
│   │   ├── inspect-panel-page.js
│   │   ├── history-panel-page.js
│   │   └── plugins-page.js
│   ├── base-page.js      # Base page with common functionality
│   ├── login-page.js
│   ├── register-page.js
│   ├── profile-page.js
│   └── forgot-password-page.js
├── tests/                # Test specifications (531 tests in 67 files)
│   ├── action-menu/
│   ├── assets/
│   ├── color/
│   ├── components/
│   │   ├── copy-components/
│   │   ├── main-components/
│   │   └── variants/
│   ├── composition/
│   ├── dashboard/
│   ├── login-signup/
│   ├── panels-features/
│   ├── plugins/
│   ├── profile/
│   ├── subscription-plans/
│   ├── tokens/
│   ├── ui-theme/
│   └── view-mode/
├── fixtures.js           # Custom test fixtures
├── playwright.config.js  # Playwright configuration
├── package.json          # Project dependencies
├── .env.example          # Environment variables template
├── .prettierrc           # Code formatting rules
└── .editorconfig         # Editor configuration
```

**Project Statistics:**

- **Total tests**: ~531
- **Test files**: 67 spec files
- **Test categories**: 15 folders
- **Test code**: ~18,136 lines
- **Average execution time**: 72 min (Chrome)

---

## 3. Test Run: Main Notes

### Initial Setup

```bash
# Use correct Node.js version
nvm use

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Version Check

```bash
node --version
npx playwright --version
```

### Executing Tests

| Type of Run            | Command                                 | Example                                                     |
| ---------------------- | --------------------------------------- | ----------------------------------------------------------- |
| All Tests              | `npm test`                              | Runs all tests in Chrome                                    |
| Single Test (by title) | `npx playwright test -g "<Test Title>"` | `npx playwright test -g "CO-154 Transform ellipse to path"` |
| Single Test Spec       | `npx playwright test <path>`            | `npx playwright test tests/login.spec.js`                   |
| Specific Folder        | `npx playwright test <folder>`          | `npx playwright test tests/dashboard`                       |
| Changed Tests Only     | `npm run changed`                       | Runs only changed test files                                |
| UI Mode                | `npm run open`                          | Opens Playwright UI mode for debugging                      |

---

## 4. Playwright Configuration Deep Dive

### Core Settings

| Property         | Local Value | CI Value | Description                           |
| ---------------- | ----------- | -------- | ------------------------------------- |
| `timeout`        | 80s         | 120s     | Maximum time for single test          |
| `expect.timeout` | 15s         | 15s      | Maximum time for expect() assertions  |
| `actionTimeout`  | 15s         | 15s      | Maximum time for actions like click() |
| `workers`        | 3           | 3        | Number of parallel workers            |
| `retries`        | 0           | 2        | Number of retries on failure          |
| `fullyParallel`  | true        | true     | Run tests in parallel                 |
| `forbidOnly`     | false       | true     | Fail build if test.only exists        |

### Browser Projects

#### Chrome (Primary)

```javascript
{
  name: 'chrome',
  browserName: 'chromium',
  channel: 'chrome',  // Uses Google Chrome instead of Chromium
  viewport: { width: 1920, height: 969 },
  permissions: ['clipboard-read', 'clipboard-write'],
  launchOptions: {
    ignoreDefaultArgs: ['--hide-scrollbars'],
    args: ['--headless=new']  // New headless mode
  },
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.0001  // Strictest tolerance
  }
}
```

### Snapshot Configuration

```javascript
snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}';
maxDiffPixels: 30;
maxDiffPixelRatio: 0.0001; // Strict tolerance for Chrome
```

**Example path:**

```
tests/composition/composition-rectangle.spec.js-snapshots/rectangle.png
```

### Reporters

**Local:**

- HTML report
- JSON report (`playwright-report/results.json`)

**CI:**

- HTML report
- JSON report
- Qase reporter (test management integration)

### Trace and Video

- **Local**: Collected on every run (`'on'`)
- **CI**: Collected on first retry (`'on-first-retry'`)

---

## 5. Custom Fixtures - The Core of Test Architecture

### Overview

The project uses **three specialized fixtures** that extend Playwright's base test:

### 5.1 mainTest - Authenticated User Tests

**Use Case:** Standard tests on pre-configured account

**Features:**

- ✅ Automatic login before each test
- ✅ Cookie acceptance
- ✅ Dashboard navigation
- ✅ Popup handling ("What's New", "Plugins")
- ✅ Test result tracking

**Code Structure:**

```javascript
const mainTest = base.test.extend({
  page: async ({ page }, use, testInfo) => {
    // 1. Navigate and accept cookies
    await loginPage.goto();
    await loginPage.acceptCookie();

    // 2. Login with main account
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();

    // 3. Verify dashboard and skip popups
    await dashboardPage.isDashboardOpenedAfterLogin();
    await dashboardPage.skipWhatNewsPopUp();
    await dashboardPage.skipPluginsPopUp();

    // 4. Run test
    await use(page);

    // 5. Track results
    await updateTestResults(testInfo.status, testInfo.retry);
  },
});
```

**Usage:**

```javascript
mainTest('Create rectangle', async ({ page }) => {
  // Test already logged in and ready
});
```

### 5.2 registerTest - New User Registration Tests

**Use Case:** Tests requiring fresh user accounts with email verification

**Features:**

- ✅ Random user generation
- ✅ Email verification via Gmail API
- ✅ Gmail + addressing (e.g., `user+randomname@gmail.com`)
- ✅ Onboarding completion
- ✅ Test result tracking

**Code Structure:**

```javascript
const registerTest = base.test.extend({
  // 1. Generate random name
  name: async ({}, use) => {
    const name = random().concat('autotest');
    await use(name);
  },

  // 2. Generate email with + addressing
  email: async ({ name }, use) => {
    const email = `${process.env.GMAIL_NAME}+${name}@gmail.com`;
    await use(email);
  },

  // 3. Complete registration flow
  page: async ({ page, name, email }, use, testInfo) => {
    // Navigate to registration
    await loginPage.clickOnCreateAccount();

    // Fill registration form
    await registerPage.registerAccount(name, email, process.env.LOGIN_PWD);

    // Wait for verification email (40s timeout)
    const invite = await waitMessage(page, email, 40);

    // Click verification link
    await page.goto(invite.inviteUrl);

    // Complete onboarding
    await dashboardPage.fillOnboardingQuestions();

    // Run test
    await use(page);

    await updateTestResults(testInfo.status, testInfo.retry);
  },
});
```

**Usage:**

```javascript
registerTest('Verify invitation email', async ({ page, email, name }) => {
  // Test runs with fresh registered user
  // email and name are available as fixtures
});
```

### 5.3 performanceTest - Performance Measurement Tests

**Use Case:** Performance testing with pre-loaded large files

**Features:**

- ✅ Imports large design file (`Penpot - Design System v2.0.penpot`, 9.8 MB)
- ✅ Pre-configured shape IDs for testing
- ✅ Cleanup before tests
- ✅ Configurable working file and shapes

**Code Structure:**

```javascript
const performanceTest = base.test.extend({
  workingFile: ['documents/Penpot - Design System v2.0.penpot', { option: true }],
  workingShapes: [
    {
      pageId: '582296a0-d6b1-11ec-a04a-cf2544e40df7',
      singleId: '#shape-5bb9c720-d6b1-11ec-a04a-cf2544e40df7',
      multipleIds: [/* array of shape IDs */],
    },
    { option: true },
  ],

  page: async ({ page, workingFile }, use) => {
    // Login and import file
    await dashboardPage.importAndOpenFile(workingFile);
    await use(page);
  },
});
```

**Usage:**

```javascript
performanceTest('PERF Render shapes with blur', async ({ page, workingShapes }) => {
  // Test runs with large file already loaded
});
```

---

## 6. Test Isolation Strategy - Parallel Execution Without Conflicts

### Problem

When running tests in parallel on the same account, tests can interfere with each other (e.g., deleting files, modifying teams).

### Solution: Unique Team per Test

#### Random Team Name Generation

```javascript
const { random } = require('../../helpers/string-generator');
const teamName = random().concat('autotest'); // e.g., "k8q6byzautotest"
```

#### Team Lifecycle

```javascript
mainTest.describe('Team Management Tests', () => {
  const teamName = random().concat('autotest');

  mainTest.beforeEach(async ({ page }) => {
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
  });

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
    await teamPage.deleteTeam(teamName);
  });

  mainTest('Test 1', async () => {
    /* ... */
  });
  mainTest('Test 2', async () => {
    /* ... */
  });
});
```

**Benefits:**

- ✅ Each test works in isolated environment
- ✅ No conflicts between parallel tests
- ✅ Clean state before and after each test
- ✅ Easy debugging (random names are traceable)

### Email Isolation for registerTest

Gmail's **+ addressing** allows multiple unique emails to same inbox:

```
user+k8q6byz@gmail.com → user@gmail.com
user+a7f3xyz@gmail.com → user@gmail.com
```

This enables:

- ✅ Unique user per test
- ✅ Single Gmail account for all tests
- ✅ Email verification without conflicts

---

## 7. Page Object Model (POM) Architecture

### Hierarchy

```
BasePage (base-page.js)
├── Common locators (headers, messages, modals)
├── Common actions (keyboard shortcuts, context menu)
└── Utility methods (waitForChangeIsSaved, clearInput)
    │
    ├── DashboardPage
    ├── TeamPage
    ├── MainPage
    ├── DesignPanelPage
    ├── LayersPanelPage
    └── ... (all other pages)
```

### BasePage Features

**Common Locators:**

- Context menu items (copy, paste, delete, rename)
- Headers and messages
- Modal dialogs

**Reusable Actions:**

```javascript
async deleteLayerViaRightClick() {
  await this.createdLayer.click({ button: 'right', force: true });
  await this.deleteLayerMenuItem.click();
}

async createComponentViaRightClick() {
  await this.createdLayer.click({ button: 'right', force: true });
  await this.createComponentMenuItem.click();
  await this.waitForChangeIsSaved();
}
```

### Page Objects Organization

#### Dashboard Pages (`pages/dashboard/`)

- **dashboard-page.js**: File/project management, import/export
- **team-page.js**: Team operations, member invitations, permissions
- **stripe-page.js**: Subscription management UI

#### Workspace Pages (`pages/workspace/`)

- **main-page.js**: Toolbar, viewport, main menu, file operations
- **design-panel-page.js**: Fill, stroke, shadow, blur, layout, typography
- **layers-panel-page.js**: Layer tree, visibility, locking, search
- **assets-panel-page.js**: Colors, typography, components, libraries
- **tokens-panel-page.js**: Design tokens, themes, import/export
- **color-palette-page.js**: Color picker (hex/RGB/HSL)
- **comments-panel-page.js**: Comments, replies, threads
- **prototype-panel-page.js**: Interactions, animations
- **view-mode-page.js**: View mode, sharing file
- **inspect-panel-page.js**: Code export, measurements
- **history-panel-page.js**: Version snapshots, restore

---

## 8. Visual Regression Testing with Snapshots

### Strategy

**Element-level snapshots (90%):**

```javascript
await expect(mainPage.createdLayer).toHaveScreenshot('rectangle.png');
```

- ✅ Captures only relevant element
- ✅ Minimizes false positives
- ✅ Faster comparison

**Full-page snapshots (10%):**

```javascript
await expect(page).toHaveScreenshot('rectangle-full.png', {
  mask: [mainPage.usersSection, mainPage.zoomButton, mainPage.guides],
});
```

- ✅ Captures entire viewport
- ✅ Uses masking for dynamic content

### Masking Dynamic Elements

**Common masked elements:**

```javascript
mask: [
  mainPage.usersSection, // User avatars (dynamic)
  mainPage.zoomButton, // Zoom level (changes)
  mainPage.guides, // Canvas guides (dynamic)
  mainPage.guidesFragment, // Guide fragments
  mainPage.toolBarWindow, // Toolbar state
  teamPage.teamNameLabel, // Random team names
];
```

### Snapshot Tolerance

Chrome uses a strict tolerance of **0.0001** for maximum consistency in visual regression testing.

### Updating Snapshots

**When a test fails due to intentional UI change:**

1. **Compare snapshots:**
   - Check `test-results/` folder for actual vs expected
   - Verify the difference is intended

2. **Isolate the test requiring an update by adding the .only modifier (or isolate the entire feature if multiple snapshots need updating)**

3. **Run test in headless mode:**

   ```bash
   npm run updateSnapshots
   ```

   - This captures new expected snapshot

4. **Remove the .only modifier**

5. **Commit and push:**
   ```bash
   git add tests/composition/composition-rectangle.spec.js-snapshots/
   git commit -m "fix(test): updated snapshots"
   git push
   ```

**Important:** Always run in **headless mode** with `headless: true` for snapshot updates to ensure consistency.

---

## 9. Wait Strategies and Timing

### Explicit Waits for Save Status

```javascript
async waitForChangeIsSaved() {
  await this.savedChangesIcon.waitFor({ state: 'visible' });
}

async waitForChangeIsUnsaved() {
  await this.unSavedChangesIcon.waitFor({ state: 'visible' });
}
```

**Usage:**

```javascript
await mainPage.createDefaultRectangleByCoordinates(200, 300);
await mainPage.waitForChangeIsSaved(); // Wait for auto-save
```

### Polling Strategies

#### Gmail Message Polling

```javascript
async function waitMessage(page, email, timeoutSec = 40) {
  const timeout = timeoutSec * 1000;
  const interval = 4000; // Check every 4 seconds
  const startTime = Date.now();
  let invite;

  await page.waitForTimeout(interval);
  while (Date.now() - startTime < timeout) {
    invite = await getRegisterMessage(email);
    if (invite) return invite;
    await page.waitForTimeout(interval);
  }

  throw new Error('Timeout reached: invite is still undefined');
}
```

#### Stripe Customer Polling

```javascript
async function waitCustomersWithPenpotId(page, penpotId, timeout = 40000) {
  const interval = 2000; // Check every 2 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const customers = await findCustomersByPenpotId(penpotId);
    if (customers && customers.length > 0) return customers;
    await page.waitForTimeout(interval);
  }

  console.error(`Timeout for searching customers by penpotId "${penpotId}"`);
}
```

### Slow Test Marking

For tests that need more time:

```javascript
mainTest.beforeEach(async () => {
  await mainTest.slow(); // Multiplies timeout by 3
});
```

---

## 10. Gmail API Integration

### Purpose

Automated email verification for:

- User registration
- Team invitations
- Password recovery
- Email change notifications
- File access requests

### Setup

**OAuth2 Credentials Required:**

- `GMAIL_NAME`: Gmail account username
- `GMAIL_DOMAIN `: Gmail account domain (e.g. @gmail.com)
- `REFRESH_TOKEN`: OAuth refresh token
- `CLIENT_ID`: OAuth client ID
- `CLIENT_SECRET`: OAuth client secret

### Key Functions

#### Wait for Email

```javascript
const invite = await waitMessage(page, email, 40);
// Returns: { inviteUrl: string, inviteText: string }
```

#### Get Specific Email Types

```javascript
const registerEmail = await getRegisterMessage(email);
const inviteEmail = await getInviteMessage(email);
const recoveryEmail = await getRecoveryMessage(email);
const accessRequestEmail = await getRequestAccessMessage(email);
```

#### Validate Email Content

```javascript
await checkRegisterText(invite.inviteText, userName);
await checkInviteText(invite.inviteText, teamName, inviterName);
await checkRecoveryText(recovery.inviteText, userName);
```

### Email Content Validation Example

```javascript
async function checkRegisterText(text, name) {
  const messageText =
    `Hello ${name}!\r\n` +
    '\r\n' +
    'Thanks for signing up for your Penpot account! Please verify your email using the\r\n' +
    'link below and get started building mockups and prototypes today!\r\n';

  await expect(text).toBe(messageText);
}
```

---

## 11. Stripe API Integration

### Purpose

Testing subscription and payment functionality:

- Plan upgrades/downgrades
- Trial periods
- Recurring billing
- Payment methods
- Invoice verification

### Setup

**Required:**

- `STRIPE_SK`: Stripe secret key (test mode)

Setup instruction: https://docs.stripe.com/keys

### Architecture and Tools

**Test Goal:** Ensure that user actions in the Penpot UI (e.g., "Start Trial," adding a card) are correctly reflected in Stripe, and that changes in Stripe's status (e.g., trial expiration) are correctly synchronized with the Penpot UI.

**Core Tools:**

- **Stripe API**: Source of truth for all financial operations (accessed via `stripe.js` library using `STRIPE_SK`)
- **Penpot API**: Used for initial registration and retrieving user ID (`getProfileIdByEmail`)
- **Playwright/JS**: Test execution environment for UI interactions
- **Stripe Helper**: Custom abstractions to avoid repetitive code

### Core Test Flow (From Registration to Subscription Testing)

Our standard test scenario follows the logic of creating a user and transitioning them to a "subscriber" status:

| Step                  | Actions (UI and API)                               | Purpose                                                                            |
| --------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1. Initialization     | `getProfileIdByEmail(email)`                       | Registration and retrieval of `penpotId`                                           |
| 2. Test Clock         | `createTestClock()`                                | Creation of independent "clock" for simulating time (instead of waiting 30 days)   |
| 3. Customer Creation  | `createCustomer(..., testClockId, penpotId)`       | Creating customer in Stripe with attached `testClockId` and `penpotId` in metadata |
| 4. Sync Wait          | `waitCustomersWithPenpotId(page, penpotId)`        | Wait until Stripe API confirms customer is visible                                 |
| 5. Start Trial        | Click 'Start Trial' in Penpot UI                   | User action that triggers Stripe Subscription with trial period                    |
| 6. Time Simulation    | `skipSubscriptionByDays(email, testClockId, days)` | Advance "clock" forward (e.g., 30 days) to expire trial                            |
| 7. Final Verification | Check Penpot UI                                    | Verify trial disappeared or user transitioned to "payment required" state          |

### Critical Asynchronicity Issues

Our tests often encounter asynchronicity in the Stripe API and UI delays.

#### A. The Test Clock Problem

When we call `advanceTestClock(testClockId, time)`, the Stripe API returns "successfully accepted" status immediately. However, Stripe needs time to asynchronously update all associated resources (subscriptions, invoices, trial status).

**Wrong Approach:** Checking the UI immediately after calling `advanceTestClock`. This leads to test failures due to 10-30 second delay.

**Correct Solution:** After calling `advanceTestClock`, we must call `waitTestClockReady(testClockId)`. This function cyclically polls Stripe, waiting for the Test Clock status to change from `transitioning` to `ready`. This ensures all time-related operations have been completed.

#### B. The UI Delay / Card Linking Problem

There are cases where a Penpot UI action (e.g., linking a test card) completes successfully, but the state update in the UI takes too long, leading to Playwright timeouts.

**Solution:** If the UI flow is too slow or unstable, we should bypass the UI and use the Stripe API to attach a test card to the customer. This is much more reliable for tests as it eliminates the slow frontend process.

### Key Helper Functions

| Function                                                  | What It Does                                                            | Where It Is Used                           |
| --------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------ |
| `createCustomerWithTestClock()`                           | Creates the clock, the customer with metadata, and waits for visibility | Customer setup                             |
| `findCustomersByPenpotId()`                               | Searches for Stripe customer by Penpot user ID                          | Verifying link between systems             |
| `skipSubscriptionByDays()` / `skipSubscriptionByMonths()` | Calculates time and initiates time advancement                          | Simulating end of trial period             |
| `waitTestClockReady()`                                    | **Crucial:** Guarantees Stripe has finished processing time advancement | Called after `skipSubscriptionBy...`       |
| `updateSubscriptionTrialEnd()`                            | Manually sets trial end date for subscription                           | Scenarios with flexible trial date control |

### Test Clock Feature

**Stripe Test Clocks** allow time manipulation for subscription testing without waiting for real time.

#### Creating Test Clock

```javascript
const testClockId = await createCustomerWithTestClock(page, name, email, penpotId);
```

#### Time Advancement

```javascript
// Advance by days
await skipSubscriptionByDays(email, testClockId, 15, date);

// Advance by months
await skipSubscriptionByMonths(email, testClockId, 3, date);

// CRITICAL: Always wait for Test Clock to be ready
await waitTestClockReady(testClockId);
```

### Common Workflows

#### Test Trial Expiration (Complete Example)

```javascript
registerTest('Test trial expiration', async ({ page, email, name }) => {
  // 1. Create customer with test clock
  const penpotId = await getProfileIdByEmail(email);
  const testClockId = await createCustomerWithTestClock(page, name, email, penpotId);

  // 2. Subscribe to plan
  await profilePage.clickOnAddPaymentMethodButton();
  await stripePage.addDefaultCard();
  await stripePage.selectPlan('Professional');

  // 3. Advance time by 14 days (trial period)
  await skipSubscriptionByDays(email, testClockId, 14, new Date());
  await waitTestClockReady(testClockId); // CRITICAL: Wait for async processing

  // 4. Verify trial ends soon
  await stripePage.isTrialEndsSoonVisible();

  // 5. Advance time by 1 more day
  await skipSubscriptionByDays(email, testClockId, 1, new Date());
  await waitTestClockReady(testClockId); // CRITICAL: Wait again

  // 6. Verify first invoice is created
  await stripePage.checkLastInvoiceStatus('Paid');
});
```

### Best Practices for Stripe Testing

✅ **DO:**

- Always call `waitTestClockReady()` after time advancement
- Use API for card attachment when UI is slow
- Store `penpotId` in Stripe customer metadata for linking
- Use Test Clocks for all time-dependent tests

❌ **DON'T:**

- Check UI immediately after `advanceTestClock()`
- Rely on UI for setup operations (use API)
- Share Test Clocks between tests
- Skip polling waits for Stripe operations

---

## 12. Test Management with Qase

### Integration

Tests are integrated with **Qase Test Management System** for tracking.

### Usage

**Single test case:**

```javascript
const { qase } = require('playwright-qase-reporter/playwright');

mainTest(qase(1162, 'Create a team'), async () => {
  // Test implementation
});
```

**Multiple test case IDs:**

```javascript
mainTest(qase([274, 275], 'Create Rectangle'), async () => {
  // Test implementation
});
```

### Configuration

**Enabled only in CI:**

```javascript
reporter: process.env.CI
  ? [['html'], ['json'], ['playwright-qase-reporter', { logging: true }]]
  : [['html'], ['json']];
```

---

## 13. Test Result Tracking

### Custom Tracking System

**File:** `helpers/saveTestResults.js`

Tracks test outcomes:

- **Passed**: Test passed on first attempt
- **Failed**: Test failed after all retries
- **Flaky**: Test passed after retry
- **PercentPassed**: Success rate

### Result File

**Output:** `playwright-report/results.json`

```json
{
  "Passed": 520,
  "Failed": 5,
  "Flaky": 6,
  "PercentPassed": 99.06
}
```

### Integration

The reporting summary is now derived directly from Playwright's JSON report.

### Mattermost Notification

Results are posted to Mattermost channel:

```javascript
await sendMessage({
  passed: testResults.Passed,
  failed: testResults.Failed,
  flaky: testResults.Flaky,
  browser: 'Chrome',
  environment: 'PRE',
  runUrl: githubRunUrl,
});
```

---

## 14. CI/CD with GitHub Actions

### Workflows

**Location:** `.github/workflows/`

#### Available Workflows

1. **playwright_pr_manual.yml** - Manual test execution for PRs
   - Options: all tests, changed only, by folder
   - OS: Ubuntu 24.04

2. **playwright_pre_daily.yml** - Daily Chrome tests on PRE
3. **playwright_tests_manual.yml** - Manual Penpot Tests (TESTS environment)
   - Options: all tests, changed only, by folder
   - OS: Ubuntu 24.04

### Custom GitHub Actions

**Location:** `.github/actions/`

1. **setup-playwright**: Install Node, dependencies, browsers
2. **upload-reports**: Upload to AWS S3, generate public URLs
3. **send-notification**: Post results to Mattermost
4. **run-tests-by-folder**: Execute specific test folder

### Environments

**PRE (Pre-production):**

- Scheduled: Every Thursday at 6:00 AM UTC
- Manual trigger: Available
- Purpose: Testing before production deployment

**PRO (Production):**

- Manual trigger only
- Purpose: Verification after production deployment
- **Note:** Must manually login and close "Release Notes" popup before running

**TESTS (PRE with New Render):**

- Manual trigger only
- Purpose: Tests stabilization

### Secrets Configuration

**Required secrets per environment:**

- `BASE_URL`
- `LOGIN_EMAIL`, `SECOND_EMAIL`, `LOGIN_PWD`
- `GMAIL_NAME`, `GMAIL_DOMAIN`, `REFRESH_TOKEN`, `CLIENT_ID`, `CLIENT_SECRET`
- `STRIPE_SK`
- `MATTERMOST_WEBHOOK_DAILY_REPORT`, `MATTERMOST_WEBHOOK_PR`
- `TDPW_API_KEY`

**Required Repository secrets**

- `AWS_ACCESS_KEY_ID`, `AWS_REGION`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`

> Note: These variables will be available to every environment.

### Artifacts

**HTML Reports:**

- Uploaded to AWS S3
- Public URL: `https://kaleidos-qa-reports.s3.eu-west-1.amazonaws.com/run-{GITHUB_RUN_ID}/index.html`

**Downloadable:**

- `playwright-report.zip` (contains HTML report)

---

## 15. Code Quality Tools

### Prettier

**Configuration:** `.prettierrc`

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 85
}
```

**Pre-commit Hook:**

```bash
# .husky/pre-commit
prettier $(git diff --cached --name-only --diff-filter=ACMR | sed 's| |\\ |g') --write --ignore-unknown
git update-index --again
```

**Manual formatting:**

```bash
npm run prettier
```

### EditorConfig

**Configuration:** `.editorconfig`

```ini
[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
trim_trailing_whitespace = true
insert_final_newline = true
```

---

## 16. Test Data Management

### Penpot Files

**Location:** `documents/`

| File                                 | Size   | Purpose                |
| ------------------------------------ | ------ | ---------------------- |
| `Penpot - Design System v2.0.penpot` | 9.8 MB | Performance testing    |
| `QA test file.penpot`                | 2.8 MB | General testing        |
| `QA test file v1.penpot`             | 17 KB  | Version testing        |
| `text-components-propagation.penpot` | -      | Component testing      |
| `swap.penpot`                        | -      | Component swap testing |

### Design Token Files

**Location:** `documents/`

| File                              | Size  | Purpose               |
| --------------------------------- | ----- | --------------------- |
| `tokens-example.json`             | 53 KB | Token import testing  |
| `fluid-typescale-tokens-1.json`   | 14 KB | Typography tokens     |
| `stitches-tokens.json`            | 5 KB  | Stitches integration  |
| `tokens-for-each-category.json`   | 4 KB  | Multi-category tokens |
| `import-tokens-error-format.json` | -     | Error validation      |
| `import-tokens-error-naming.json` | -     | Error validation      |

### Image Assets

**Location:** `images/`

- JPEG samples (horizontal, vertical, mini)
- EXIF orientation test images
- GIF animation
- SVG vector graphics
- PNG images

### Font Files

**Location:** `fonts/`

- `Allura-Regular.otf` (49 KB)
- `ArialTh.ttf` (41 KB)
- `Pacifico.ttf` (75 KB)

---

## 17. Common Test Patterns

### Pattern 1: Standard Test Structure

```javascript
const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');

mainTest.describe('Feature Tests', () => {
  const teamName = random().concat('autotest');
  let mainPage;

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
  });

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
    await teamPage.deleteTeam(teamName);
  });

  mainTest(qase(1234, 'Test case name'), async () => {
    // Test implementation
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('rectangle.png');
  });
});
```

### Pattern 2: Coordinate-Based Interactions

```javascript
// Create shapes at specific coordinates
await mainPage.createDefaultRectangleByCoordinates(200, 300);
await mainPage.createDefaultEllipseByCoordinates(400, 600, true);

// Drag and drop
await mainPage.clickAndDrag(100, 100, 300, 300);
```

### Pattern 3: Context Menu Actions

```javascript
await mainPage.createDefaultRectangleByCoordinates(200, 300);
await mainPage.createComponentViaRightClick();
await mainPage.createCopyViaRightClick();
await mainPage.deleteLayerViaRightClick();
```

### Pattern 5: Chainable Actions

```javascript
// Design panel chainable methods
await designPanelPage.changeStrokeSettings(
  '#43E50B',
  '60',
  '10',
  'Inside',
  'Dotted',
);
await designPanelPage.changeShadowSettings(
  'Drop shadow',
  '#000000',
  '50',
  '5',
  '10',
  '10',
  'Outer shadow',
);
```

---

## 18. Debugging and Troubleshooting

### UI Mode for Debugging

```bash
npm run open
```

- ✅ Time travel debugging
- ✅ Watch mode
- ✅ Pick locators
- ✅ Trace viewer

### Debug Single Test

```bash
npx playwright test tests/composition/composition-rectangle.spec.js --project=chrome --debug
```

### Headed Mode

Change in `playwright.config.js`:

```javascript
use: {
  headless: false,  // Run in visible browser
}
```

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

### Common Issues

#### Issue: Snapshot mismatch

**Solution:**

1. Check if UI change is intentional
2. Run in headless mode on Ubuntu 24.04
3. Delete old snapshot and re-run test

#### Issue: Flaky test due to timing

**Solution:**

```javascript
mainTest.beforeEach(async () => {
  await mainTest.slow(); // 3x timeout
});
```

#### Issue: Clipboard not working

**Solution:** Check browser permissions in config:

```javascript
contextOptions: {
  permissions: ['clipboard-read', 'clipboard-write'];
}
```

#### Issue: Test fails only in CI

**Solution:**

- Check CI-specific settings (retries, timeout)
- Review trace/video artifacts
- Check environment secrets

---

## 19. Best Practices

### Test Writing

✅ **DO:**

- Use Page Object Model
- Wait for `waitForChangeIsSaved()` after mutations
- Use descriptive test names
- Use Qase IDs for traceability
- Create isolated teams per test
- Clean up in `afterEach`

❌ **DON'T:**

- Use `test.only()` (will fail CI)
- Hardcode timeouts
- Share state between tests
- Commit with failing tests
- Use absolute waits (`waitForTimeout`) unless necessary

### Snapshot Testing

✅ **DO:**

- Capture element-level snapshots
- Mask dynamic elements
- Run in headless mode for updates
- Verify changes before updating
- Update on Ubuntu 24.04 for consistency

❌ **DON'T:**

- Capture full page unless necessary
- Commit without reviewing diff
- Update in headed mode
- Ignore rendering differences

### Parallel Execution

✅ **DO:**

- Use unique team names
- Clean up resources in `afterEach`
- Use `fullyParallel: true`
- Test isolation in describe blocks

❌ **DON'T:**

- Share teams between tests
- Rely on execution order
- Use `workers: 1` unless necessary

---

## 20. Maintenance Guidelines

### Regular Tasks

#### Daily

- Check GitHub Actions status
- Check Chrome test results for failures and flaky tests (Monday-Friday)
- Monitor Mattermost notifications from Kaleidos channel

#### Weekly

- Review test execution trends

#### As Needed

- Create tickets for bugs discovered by automated tests
- Update Playwright version when new releases are available
- Review and update snapshots when UI changes are implemented

#### Per Release

- Update snapshots for UI changes
- Adding New Tests
- Review and update test data files

### Updating Dependencies

```bash
# Check outdated packages
npm outdated

# Update Playwright
npm install -D @playwright/test@latest
npx playwright install

# Update all dependencies
npm update
```

### Adding New Tests

1. **Choose appropriate fixture:** mainTest or registerTest
2. **Create team in beforeEach:** Use random team name
3. **Clean up in afterEach:** Delete team and resources
4. **Add Qase ID:** Use `qase(id, 'test name')`
5. **Add snapshots:** Use element-level snapshots
6. **Verify in CI:** Check GitHub Actions pass

---

## 21. Important Technical Details

### Viewport Configuration

All browsers use:

```javascript
viewport: { width: 1920, height: 969 }
```

**Why 969?** This is the viewport size for a Full HD monitor (1920x1080). The height is 969 instead of 1080 because we subtract the Ubuntu 24.04 taskbar height from the total screen height to get the actual available viewport area

### Headless Mode

**Chrome uses new headless mode:**

```javascript
args: ['--headless=new'];
```

**Benefits:**

- More consistent rendering
- Better performance
- Closer to headed mode behavior

### Clipboard Permissions

**Required for copy/paste testing:**

```javascript
permissions: ['clipboard-read', 'clipboard-write'];
```

### Force Click

**Used for potentially obscured elements:**

```javascript
await this.createdLayer.click({ button: 'right', force: true });
```

### Gmail + Addressing

**How it works:**

```
user+test1@gmail.com → user@gmail.com
user+test2@gmail.com → user@gmail.com
```

All emails go to same inbox, but Penpot treats them as different users.

---

---

## 22. Key Architecture Decisions

### Why Three Fixtures?

1. **mainTest**: Fast (no registration), most common use case
2. **registerTest**: Full control, email verification, slower

### Why Chrome Only?

- ✅ Most consistent rendering
- ✅ Strict snapshot tolerance (0.0001)
- ✅ Better performance in CI
- ✅ Industry standard for E2E testing
- ✅ Simplifies maintenance and debugging

### Why Page Object Model?

- ✅ Centralized locators
- ✅ Reusable actions
- ✅ Easy maintenance
- ✅ Separation of concerns

### Why Element-Level Snapshots?

- ✅ Faster comparison
- ✅ Fewer false positives
- ✅ Focused on relevant changes
- ✅ Easier to debug

### Why Random Team Names?

- ✅ Parallel execution without conflicts
- ✅ Test isolation
- ✅ No shared state
- ✅ Easy cleanup

### Why Gmail + Addressing?

- ✅ Unlimited unique emails
- ✅ Single Gmail account
- ✅ No complex email setup
- ✅ Works with Gmail API

### Why Stripe Test Clocks?

- ✅ Instant time advancement
- ✅ No waiting for real subscriptions
- ✅ Reproducible tests
- ✅ Isolated test customers

---

## 24. Summary Checklist

### Before First Run

- [ ] Ubuntu 24.04 OS with 1920x1080 resolution
- [ ] Node.js v25.2.1 installed
- [ ] `.env` file created with all variables
- [ ] Clean Penpot account with completed onboarding
- [ ] Gmail API credentials configured
- [ ] Stripe API credentials configured
- [ ] Dependencies installed (`npm install`)
- [ ] Playwright browsers installed (`npx playwright install`)

### Before Each Test Run

- [ ] Correct Node.js version (`nvm use`)
- [ ] Latest code pulled from repository
- [ ] No `test.only()` in code
- [ ] Environment variables set correctly

### After Test Changes

- [ ] Tests run locally in all browsers
- [ ] Snapshots reviewed and updated if needed
- [ ] Code formatted with Prettier
- [ ] Qase IDs added to new tests
- [ ] Cleanup logic in `afterEach`
- [ ] CI passes successfully

### Before Release

- [ ] All snapshots updated for UI changes
- [ ] Performance tests excluded from CI runs
- [ ] Test data files up to date
- [ ] Documentation updated
- [ ] All integrations verified (Gmail, Stripe)

---

## 25. Additional Resources and Documentation

### Git Workflow

**Our Git workflow - Guidance on branching and merging:**

- Branch naming conventions
- Merge request procedures
- Code review process
- Commit message guidelines

📚 **Documentation**: [Git Workflow Guide](https://docs.google.com/document/d/1rl2KHlMC6cjMzlV7nx_rAjPnYkpixEpGUeMZnNB2mrU/edit?pli=1&tab=t.0#heading=h.3dn08frqdgu9)

---

## 26. Contact and Support

### Repository

- **GitHub**: https://github.com/penpot/penpotqa
- **Issues**: https://github.com/penpot/penpotqa/issues

### Documentation

- **Playwright**: https://playwright.dev/docs/intro
- **Qase**: https://help.qase.io/
- **Stripe Test Clocks**: https://stripe.com/docs/testing/test-clocks

---

**Document Version**: 2.3
**Last Updated**: 2025-10-31
**Maintained By**: QA Team
