# penpotqa

QA Test for Penpot

Based on Playwright framework.

**1. Initial requirements and configuration**

Prerequisites for local run:

- Windows OS
- Screen resolution 1920x1080
- Installed Node.js and Chrome browser
- “Clear” Penpot account (without added files, projects, etc.), but with a completed onboarding flow.
- The .env file to the root of the project with 3 env variables:
  - LOGIN_EMAIL (email from your Penpot account)
  - LOGIN_PWD (password from your Penpot account)
  - BASE_URL (Penpot url - e.g. http://localhost:9001/ if deployed locally)

**2. Test run - main notes.**

By default, `npm test` runs all tests (the script `"test": "npx playwright test"` on package.js).
To run the specific test/tests, change the test script on _package.js_ in the next ways (or add a separate script):

- Run single test (by title) - e.g. `"npx playwright test -g \"CO-154 Transform ellipse to path\""`,
- Run single test spec (file) - e.g. `"npx playwright test tests/login.spec.js"`
- Run specific tests package (folder) - e.g. `"npx playwright test tests/dashboard"`

Currently there are 238 tests at all, average time of execution - 30-35 minutes.

**3. Test run - additional settings.**

Some of the settings from _playwright.config.js_ may be useful:

- By default test retries are disabled. To enable them, change the value of `retries` property. E.g. `retries: 2` would re-run each test 2 times in case of failure.
- `timeout` and `expect.timeout` - maximum time of execution a single test and of a waiting expect() condition to be met accordingly
- `use.headless `- change to true to run in headless browser mode
- `use.channel: "chrome"` - comment out to run tests in Chromium instead of Chrome

**4. Snapshots comparison.**

Expected snapshots are stored on _tests/<spec-name>-snapshots_ folders. In most of the cases, they capture and compare not the whole visible area of the screen but only the single element/section (e.g. created shape or canvas with created board). It helps to avoid the failure of the tests upon such changes in the UI like adding new sections to the Design panel, new buttons to the toolbars and so on.
Such tests use the pattern:
`await expect(<pageName.elementName>).toHaveScreenshot("snapshotName.png");`
However, about 10% of the tests capture and compare all visible area of the screen, since in such scenarios it makes sense to check not only the layers/canvas, but the panels, toolbar, etc. These tests are use the pattern:
`await expect(page).toHaveScreenshot("snapshotName.png", { mask: [pageName.elementName], });`
Masking is used in order to ignore the elements which have unpredictable text content or values (e.g. user name).
Therefore, however the impact of future UI changes to snapshots comparison is minimized, it is impossible to avoid such cases at all. But the updating on snapshots is rather simple:

- Upon test failure, compare the actual and expected snapshots and verify that the difference occurred due to intended UI changes.
- Delete expected snapshot from the _tests/<spec-name>-snapshots_ folder.
- Run the test one more time, which will capture the actual snapshot and write it as expected to the _tests/<spec-name>-snapshots_ folder.
- Commit the new expected snapshot and push.
