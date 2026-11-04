# Handling outdated tests after a Penpot release

The team's protocol for existing cases a change makes outdated. This skill
does Part 1 (Qase) for the cases agreed in the preview, and reports what
Part 2 needs; it doesn't edit specs. Parts 2 and 3 are here so the report can
say exactly what the follow-up penpotqa change has to do.

When product updates change functionality, the matching Qase cases need
updating or removal. If left alone, their Playwright tests fail on every run
and add noise to release triage. This workflow keeps those known failures out
of the reports while both tools stay in sync.

## Overview

Every affected case goes through one of two **operations**:

- **Update**: the feature still exists but changed. The case is rewritten and
  kept.
- **Deletion**: the feature was removed, or the case is replaced by new ones.
  The case is kept only until its replacement is automated.

Each operation touches two tools:

- **Qase**: the case's **fields** change (Status, Revision reason, …) — Part 1.
- **Playwright**: the automated test is skipped and gets **tags** (`@outdated`,
  `@deprecated`, `@to-delete`) — Parts 2 and 3.

Terminology: _tag_ always means a Playwright test tag, in code style
(`@outdated`). Qase values are fields, in italics (_Outdated_). Some Revision
reason values and tags share a name on purpose, but live in different tools.
The protocol doesn't use the Qase **Tags** field.

## Order of work

1. Qase: update the case fields (Part 1).
2. Playwright: mark the automated test so its known failure isn't reported
   (Part 2).
3. Playwright: resolve the marked test, by updating or deleting it (Part 3).

A marked test is a temporary state: "Qase changed, the automation hasn't
caught up yet".

## Part 1 — Qase: update the case fields

### Fields for both operations

For every affected case:

- Add the current release (the release that brings the change — the issue's
  milestone) to **Penpot Release**, keeping the releases already there.

If the case is automated, also:

- Tick **To be reviewed**.
- Set **Revision reason** as given for the operation below.
- Add a short **Revision comment** with context or instructions. Keep it
  brief: the details go in the automation PR (e.g. penpotqa PR #890).

### Update

- Edit the steps or expected results to match the release changes.
- If automated, set **Revision reason** to _Outdated_ and _To automate_ (even
  though it is already automated).
- Example Revision comment: "Automated test should be updated."

### Deletion

- Prefix the title with `[DEPRECATED, <release>]`, e.g. `[DEPRECATED, 2.19]`.
  Leave the automated test's title unchanged: tests are linked by Qase ID, so
  the mismatch is harmless.
- Set **Status** to _Deprecated_.
- Set **Type** to _Non-regression_, so it isn't added to a test run by
  mistake.
- If automated, set **Revision reason** to _To delete_.
- Example Revision comment: "Delete the case and its automated test once the
  replacement is automated. Replaced by PENPOT-3700."

Don't edit the steps: the case is going away.

### Qase fields summary

| Qase field                     | Update                     | Deletion                                |
| ------------------------------ | -------------------------- | --------------------------------------- |
| Steps / expected results       | Edited                     | Unchanged                               |
| Penpot Release                 | Current release            | Current release                         |
| Title                          | Unchanged                  | Prefixed with `[DEPRECATED, <release>]` |
| Status                         | _Actual_                   | _Deprecated_                            |
| Type                           | Unchanged                  | _Non-regression_                        |
| To be reviewed (if automated)  | Ticked                     | Ticked                                  |
| Revision reason (if automated) | _Outdated_ + _To automate_ | _To delete_                             |

## Part 2 — Playwright: mark the automated test

### Tags

| Tag           | Meaning                                                               | Next action                                       |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| `@outdated`   | The feature still exists, but the test no longer matches its behavior | Update the test, then unmark it                   |
| `@deprecated` | The feature the test covers was removed, or the case is replaced      | Delete the test once its replacement is automated |
| `@to-delete`  | The test will be removed, not updated                                 | Delete the test                                   |

Rules:

- An **Update** test gets only `@outdated`.
- A **Deletion** test gets both `@deprecated` and `@to-delete`.
- Never combine `@outdated` with `@deprecated`: a test is either fixed or
  removed, never both.
- The annotation `type` matches the main tag (`outdated` or `deprecated`), so
  the HTML report shows the same reason as the tag.

### How to mark a test

Use `.skip` with a tag and an annotation; leave the test body unchanged. The
annotation description says **which release** introduced the change, **what
changed** in the product, and **what happens next** (update pending, or the
replacement case if the test is to be deleted).

Update:

```ts
mainAccountFileTest.skip(
  qase([547], 'Merge nodes (via Node panel and CTRL+J shortcut)'),
  {
    tag: '@outdated',
    annotation: {
      type: 'outdated',
      description:
        'Node panel buttons now appear/disappear instead of becoming active/inactive in 2.19. Rewrite pending, including the new subpath merge steps.',
    },
  },
  async ({ mainPage }) => {
    // ...body unchanged
  },
);
```

Deletion:

```ts
mainAccountFileTest.skip(
  qase([544], 'Add nodes (via Node panel and SHIFT++ shortcut)'),
  {
    tag: ['@deprecated', '@to-delete'],
    annotation: {
      type: 'deprecated',
      description:
        'Add node button removed in 2.19. Replaced by PENPOT-3700; delete once it is automated.',
    },
  },
  async ({ mainPage }) => {
    // ...body unchanged
  },
);
```

Why `.skip`: the test doesn't run and is reported as skipped (in Qase too),
and the code stays compiled and easy to find. `.fixme` implies the automation
is broken (here the product changed); `.fail` still runs the test and wastes
time on locator timeouts; commenting the test out hides it from reports and
type-checking, and it gets forgotten.

Finding marked tests:

```sh
npx playwright test --grep "@outdated|@deprecated" --list   # everything marked
npx playwright test --grep @outdated --list                 # to update
npx playwright test --grep @to-delete --list                # to delete
```

## Part 3 — Playwright: resolve the marked test

### Update: fix an `@outdated` test

1. Update the automated test to match the new Qase steps.
2. Unmark it: remove the `.skip`, the tag and the annotation.
3. Regenerate any affected baselines.
4. In Qase, untick **To be reviewed** and clear **Revision reason**.

This is a normal `fix(<area>)` PR.

### Deletion: remove a `@to-delete` test

Delete it in the PR that automates its replacement. In that same PR, also
remove the page-object methods only it used and its snapshots in
`tests/{dir}/{file}-snapshots/`. Then delete the case in Qase. The code stays
in git history.

## Commits and branches

Keep the marking separate from the fixes: one branch and PR per release that
only marks tests.

- Branch: `<user>/chore/mark-outdated-tests-<release>`, e.g.
  `dherrero/chore/mark-outdated-tests-2.19`
- Commit: `chore(tests): skip and tag tests outdated or deprecated in <release>`

## Things to keep in mind

- A skipped test stops covering **all** of its steps, including the ones that
  still work. Keep the marked period short.
- Mark only automated tests whose Qase case actually changed. Don't use this
  to hide flaky or broken tests.
