# penpotqa

QA Test for Penpot

Based on Playwright framework.

##1. Initial requirements and configuration
Prerequisites for local run:
- Windows OS
- Screen resolution 1920x1080
- Installed Node.js
- “Clear” Penpot account (without added files, projects, etc., but with a completed onboarding flow).
- The _.env_ file added to the root of the project with 3 env variables:
  - `LOGIN_EMAIL` (email from your Penpot account)
  - `LOGIN_PWD` (password from your Penpot account)
  - `BASE_URL` (Penpot url - e.g. http://localhost:9001/ if deployed locally)

##2. Test run - main notes.
Upon cloning the repo and truing to run tests, you may be prompted to install the browsers:
`npx playwright install`
By default, `npm test` runs all tests in Chrome browser (the script `"test": "npx playwright test --project=chrome"` in _package.js_).
To run the specific test/tests, change the test script in _package.js_ in the next ways (or add a separate script):

- Run single test (by title) - e.g. `"npx playwright test -g \"CO-154 Transform ellipse to path\" --project=chrome"`,
- Run single test spec (file) - e.g. `"npx playwright test tests/login.spec.js --project=chrome"`
- Run specific tests package (folder) - e.g. `"npx playwright test tests/dashboard --project=chrome"`

To run the tests in Firefox and Webkit browsers, use `"firefox"` and `"webkit"` scripts accordingly:
`"firefox": "npx playwright test --project=firefox"`
`"webkit": "npx playwright test --project=webkit"`

Currently, there are 238 tests at all, average time of execution - 35 minutes.

##3. Test run - additional settings.
Some settings from _playwright.config.js_ may be useful:
- By default, test retries are enabled (test retries 2 times in case of failure). To disable them, change the value of `retries` property to 0
- `timeout` and `expect.timeout` - maximum time of execution a single test and of a waiting expect() condition to be met accordingly
- `use.headless `- change to _false_ to run in headed browser mode
- `use.channel: "chrome"` - comment out to run tests in Chromium instead of Chrome (for "chrome" project)

##4. Snapshots comparison.
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
- Commit the new expected snapshot and push.
