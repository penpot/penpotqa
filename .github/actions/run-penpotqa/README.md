# Run Penpot QA suite

A GitHub Action that runs the penpotqa end-to-end tests against **any Penpot
instance**, for example a temporary environment built from a development
branch. You choose which tests to run; everything else (installing the suite,
the browser, the reporting) is handled for you.

- [Requirements](#requirements)
- [Usage](#usage)
- [Choosing what to run](#choosing-what-to-run)
- [What is always skipped](#what-is-always-skipped)
- [Reading the results](#reading-the-results)
- [Running the same thing locally](#running-the-same-thing-locally)
- [For QA: maintaining the action](#for-qa-maintaining-the-action)

## Requirements

The Penpot instance under test needs:

- **To be reachable from the job's runner.** If you start Penpot with Docker
  Compose in the same job, `http://localhost:9001` works.
- **Demo users enabled** (`enable-demo-users` in `PENPOT_FLAGS`). Every test
  creates its own disposable account through the `create-demo-profile` API, so
  no login or pre-existing data is needed. See _10. Demo account fixture
  logic_ in the [main README](../../../README.md).
- **The WASM renderer available.** Test accounts are created with
  `renderer: 'wasm'`, so the instance must serve the render-wasm bundle (the
  standard Penpot bundles and images do).

The runner should be **Ubuntu 24.04** (`ubuntu-24.04` on GitHub-hosted runners).
Screenshot tests compare against snapshots taken on that OS; on another OS they
will report visual differences that aren't real.

## Usage

Add a step to the job that has Penpot running:

```yaml
- name: Run Penpot QA suite
  uses: penpot/penpotqa/.github/actions/run-penpotqa@main
  with:
    base-url: http://localhost:9001
    tests: tests/tokens tests/components/variants # empty = everything
    grep: '2204|2205' # optional
```

GitHub downloads penpotqa at the ref after `@` (`main`, a branch, a tag or a
commit), and the tests come from that same ref. No checkout of penpotqa is
needed.

### Inputs

| Input           | Required | Default           | Description                                                                                                     |
| --------------- | -------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `base-url`      | yes      |                   | Penpot URL to test, e.g. `http://localhost:9001`.                                                               |
| `tests`         | no       | _(everything)_    | Space-separated folders and/or spec files, relative to the penpotqa root.                                       |
| `grep`          | no       |                   | Only run tests whose title matches this regular expression. Titles include the Qase ID, e.g. `(Qase ID: 2204)`. |
| `repeat-each`   | no       | `1`               | Run each test N times, useful to check whether a failure is flaky.                                              |
| `workers`       | no       | _(config: 3)_     | Number of tests run in parallel.                                                                                |
| `artifact-name` | no       | `penpotqa-report` | Name of the uploaded report. Set a unique one if the action runs more than once in the same workflow run.       |

### Outputs

| Output   | Description                                        |
| -------- | -------------------------------------------------- |
| `passed` | Number of tests that passed (flaky ones included). |
| `failed` | Number of tests that failed.                       |

The step fails when any test fails, like a normal test step.

## Choosing what to run

Tests live under [`tests/`](../../../tests), grouped by feature. Some examples:

| You want to run…                 | `tests`                            | `grep`              |
| -------------------------------- | ---------------------------------- | ------------------- |
| Everything                       | _(empty)_                          |                     |
| One feature area                 | `tests/tokens`                     |                     |
| Several areas                    | `tests/tokens tests/components`    |                     |
| One spec file                    | `tests/login-signup/login.spec.ts` |                     |
| Specific Qase cases              | `tests/tokens`                     | `2204\|2205`        |
| Tests by title, across all areas | _(empty)_                          | `Transform ellipse` |

Running everything takes a few hours, so prefer the areas your change touches.
To find the right folder or spec, browse [`tests/`](../../../tests) or search for
the Qase ID.

The action stops before running anything if a path doesn't exist, or if it
points to `tests/enterprise` (see below).

## What is always skipped

Some tests can't run on an arbitrary instance, so the action never runs them:

- **Tests tagged `@external`**: they need services a temporary environment
  doesn't have: reading real emails through Gmail (registration, invitations,
  password and email changes) or an account in a Custom SSO domain.
- **`tests/enterprise/`**: the Enterprise suite needs licenses, SSO and Stripe.
  It isn't part of the `chrome` project the action runs.

These tests still run in the daily regression on PRE.

Results are **not reported to Qase**, so runs from development branches don't
affect the QA dashboards.

## Reading the results

When the step finishes, you get:

1. **A summary on the workflow run page**: passed, failed, flaky and skipped
   counts, the URL tested and the tests selected.
2. **An artifact with the full Playwright report** (`penpotqa-report` by
   default, kept for 14 days). Download it from the run page, unzip it and
   open it with:

   ```bash
   npx playwright show-report path/to/unzipped-report
   ```

   Opening `index.html` directly works for the list of results, but traces
   only load through `show-report`. For each failed test the report has the
   error, the steps, a screenshot, a video and a **trace**: a step-by-step
   recording of the page you can inspect like browser devtools.

How to read a failure:

- **Failed**: failed in every attempt. On CI each failing test is retried
  twice, so this is unlikely to be a one-off.
- **Flaky**: failed and then passed on a retry. Usually not caused by your
  change; it doesn't fail the step.
- **Screenshot difference** (`toHaveScreenshot`): the report shows the
  expected image, the actual one and a diff. If the change in the UI is
  intended, ask the QA team to update the snapshots; don't change them from
  your branch.

If you aren't sure whether a failure comes from your change, run the same tests
against PRE or develop. If they fail there too, it isn't your change. Either
way, the QA team can help.

## Running the same thing locally

With penpotqa cloned and installed (see [the main README](../../../README.md)),
this is what the action runs:

```bash
QASE_MODE=off BASE_URL=http://localhost:9001 LOGIN_PWD=any-value \
  npx playwright test --project=chrome --grep-invert @external tests/tokens
```

`LOGIN_PWD` can be any value: a few tests only type it into forms.

## For QA: maintaining the action

- **Tag new tests that need external services** with `@external`, using
  Playwright's tag option so titles (and Qase IDs) don't change:

  ```ts
  registerTest(
    qase(190, 'Change email to valid'),
    { tag: '@external' },
    async ({ page, name, email }) => {
      // ...
    },
  );
  ```

  That applies to any test that uses `registerTest` or
  `registerAndDemoUserTest`, reads email through `helpers/gmail`, or needs
  SSO, Stripe or the licenses manager. To list the tagged tests:
  `npx playwright test --project=chrome --list --grep @external`.

- **Trying the action from penpotqa**: the manual workflow
  _Manual Penpot Tests on any environment_
  ([`playwright_any_env_manual.yml`](../../workflows/playwright_any_env_manual.yml))
  runs it against any URL, or PRE when the URL is empty.

- **Free-text inputs** (`tests`, `grep`) are passed to the script through
  environment variables, never interpolated into it, so they can't inject shell
  commands. Keep it that way when adding inputs.
