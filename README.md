# penpotqa

QA Test for Penpot

Based on Playwright framework.

**1. Initial requirements and configuration.**

Prerequisites for local run:

- Windows OS
- Screen resolution 1920x1080
- Installed Node.js v22.5.1
- “Clear” Penpot account (without added files, projects, etc., but with a completed onboarding flow).
- The _.env_ file added to the root of the project with the following env variables:
  - `LOGIN_EMAIL` (email from your Penpot account)
  - `LOGIN_PWD` (password from your Penpot account)
  - `BASE_URL` (Penpot url - e.g. http://localhost:9001/ if deployed locally)
  - `GMAIL_NAME` (Gmail account name for Gmail API integration)
  - `GMAIL_DOMAIN` (Domain for the account to access Gmail API Integration)
  - `REFRESH_TOKEN` (Token for email access)
  - `CLIENT_ID` (for email access)
  - `CLIENT_SECRET` (for email access)
  - `STRIPE_SK` (for Stripe API access)

**2. Gmail Integration.**

Gmail API integrations requires previous configuration by setting up Gmail API from Google Cloud Platform and getting a refresh token from https://developers.google.com/oauthplayground/.

**3. Test run - main notes.**

Once the repo is cloned you can follow these steps to use the correct node version, install the project dependencies, and Playwright with the latests browsers.

```
nvm use
npm install
npx playwright install
```

You can check the versions of Playwright and Node using these commands:

```
node --version
npx playwright --version
```

By default, `npm test` runs all tests in Chrome browser (the script `"test": "npx playwright test --project=chrome"` in _package.js_).
To run the specific test/tests, change the test script in _package.js_ in the next ways (or add a separate script):

- Run single test (by title) - e.g. `"npx playwright test -g \"CO-154 Transform ellipse to path\" --project=chrome"`
- Run single test spec (file) - e.g. `"npx playwright test tests/login.spec.js --project=chrome"`
- Run specific tests package (folder) - e.g. `"npx playwright test tests/dashboard --project=chrome"`

To run the tests in Firefox and Webkit browsers, use `"firefox"` and `"webkit"` scripts accordingly:
`"firefox": "npx playwright test --project=firefox"`
`"webkit": "npx playwright test --project=webkit"`

**4. Test run - additional settings.**

Some settings from _playwright.config.js_ may be useful:

- By default, test retries are enabled (test retries 2 times in case of failure). To disable them, change the value of `retries` property to 0
- `timeout` and `expect.timeout` - maximum time of execution a single test and of a waiting expect() condition to be met accordingly
- `use.headless `- change to _false_ to run in headed browser mode
- `use.channel: "chrome"` - comment out to run tests in Chromium instead of Chrome (for "chrome" project)

**5. Parallel tests execution.**

- All tests should be independent for running them in parallel mode
- For run tests in parallel mode need to update key `workers` in `playwright.config.js` file
- `workers`: `process.env.CI ? 6 : 3` - by default 3 workers are used for local run and 6 to run on CI/CD.
- For disabling parallelism set `workers` to 1.

**6. Tests amount and execution time.**

- For now there are 531 tests in current repository
- If parallel execution is enabled with default amount of workers (3) the average time for each browser is the following:
- Chrome: 72 mins
- Firefox: 81 mins

**7. Snapshots comparison.**

Expected snapshots are stored in _tests/{spec-name}-snapshots/{project-name}_ folders (where project-name is the browser name).
In most of the cases, they capture and compare not the whole visible area of the screen but only the single element/section (e.g. created shape or canvas with created board).
It helps to avoid the failure of the tests upon such changes in the UI like adding new sections to the Design panel, new buttons to the toolbars and so on.
Such tests use the pattern:
`await expect(<pageName.elementName>).toHaveScreenshot("snapshotName.png");`
However, about 10% of the tests capture and compare all visible area of the screen, since in such scenarios it makes sense to check not only the layers/canvas, but the panels, toolbar, etc.
These tests are use the pattern:
`await expect(page).toHaveScreenshot("snapshotName.png", { mask: [pageName.elementName], });`
Masking is used in order to ignore the elements which have unpredictable text content or values (e.g. username, timestamp, etc.).
Therefore, however the impact of future UI changes to snapshots comparison is minimized, it is impossible to avoid such cases at all.
However, it is rather simple to update snapshots:

- Upon test failure, compare the actual and expected snapshots and verify that the difference occurred due to intended changes in UI.
- Delete expected snapshot from folder.
- Run the test one more time, which will capture the actual snapshot and write it as expected to the appropriate folder.
- Run tests in headless mode to get new snapshots.
- Commit the new expected snapshot and push.

Note 1: there is a known issue that Chrome does render differently in headless and headed modes, that's why
`expect.toHaveScreenshot.maxDiffPixelRatio: 0.01` is set in _playwright.config.js_ for "chrome" project , which means that
an acceptable ratio of pixels that are different to the total amount of pixels is 1% within screenshot comparison.

**8. Performance testing.**

To exclude performance tests from the periodical regression test run the following scripts should be used:

- for Chrome: `"npx playwright test --project=chrome --grep-invert  'PERF'"`
- for Firefox: `"npx playwright test --project=firefox --grep-invert  'PERF'"`

Note: The above scripts should be executed via the command line. Do not run them directly from the _package.json_,
because in such way performance tests are not ignored.

**9. Running tests via GitHub Actions.**

On _Settings > Environments_ page 2 environments were created: _PRE_ and _PRO_.
For each environment the appropriate secrets were added:

- _LOGIN_EMAIL_ (email from your Penpot account, which is used for tests)
- _LOGIN_PWD_ (password from your Penpot account, which is used for tests)
- _BASE_URL_ (Penpot url)
- _GMAIL_NAME_ (Gmail account name for email verification)
- \_GMAIL_DOMAIN (Domain for the account to access Gmail API Integration)
- _REFRESH_TOKEN_ (Token for email access)
- _CLIENT_ID_ (for email access)
- _CLIENT_SECRET_ (for email access)

2 _.yml_ files were added into _.github/workflows_ directory with settings for environments:

- tests for _PRE_ env will be run by schedule: each Thursday at 6:00 am UTC (and also it is possible to trigger them manually)
- tests for _PRO_ env will be run only by request and triggered manually

**Note**:

- The UTC time is used for schedule set up.
- There may be a delay for start running tests by schedule. It will take nearly 5-15 minutes.

There are 2 workflows on _Actions_ tab:

- Penpot Regression Tests on PRO env
- Penpot Regression Tests on PRE env

To run workflow by request you need to open it from the left sidebar and click on _[Run workflow]_ > _[Run workflow]_.
In a few seconds running should be start.

**Note**:
Before running tests on PRO env need to manually log in with test account on PRO server and close the 'Release Notes' popup.

**Tests run results:**

When the run will be finished the appropriate marker will appear near the current workflow:

- `green icon` - workflow has been passed
- `red icon` - workflow has been failed

It is possible to open workflows (both passed and failed) and look through the _Summary_ info:

- Status
- Total duration
- Artifacts

In _Artifacts_ section there will be a _'playwright-report.zip'_ file. It is possible to download it, extract and open _index.html_ file with the default playwright report.
