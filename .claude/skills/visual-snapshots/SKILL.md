---
name: visual-snapshots
description: How visual regression snapshots work in penpotqa — element-level vs full-page `toHaveScreenshot`, masking dynamic elements, the Chrome tolerance, where snapshots live, and how to update them on Ubuntu 24.04 at 1920x969 in headless mode. Use this skill whenever you add, review or update a `toHaveScreenshot` assertion, a test fails on a snapshot mismatch, or the user asks to regenerate snapshots, even if they only say "se ha roto el snapshot" or "update the screenshots".
---

# Visual regression snapshots

## Element-level first

Most snapshots (about 90%) capture only the element under test:

```javascript
await expect(mainPage.createdLayer).toHaveScreenshot('rectangle.png');
```

It captures only what matters, gives fewer false positives and compares
faster. Capture the full page only when the test is about the whole view
(about 10%), and mask what changes between runs:

```javascript
await expect(page).toHaveScreenshot('rectangle-full.png', {
  mask: [mainPage.usersSection, mainPage.zoomButton, mainPage.guides],
});
```

## Mask dynamic elements

Commonly masked elements:

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

## Where snapshots live and how they are compared

- Snapshots are stored at `tests/{dir}/{file}-snapshots/`.
- Chrome uses a strict tolerance of **0.0001**.
- Snapshots are taken on **Ubuntu 24.04** at **1920x969**, in **headless**
  mode. Snapshots generated anywhere else (another OS, headed mode) will not
  match.

## Updating snapshots

Only when a test fails because of an intentional UI change:

1. Compare the actual and expected images in `test-results/` and confirm the
   difference is intended. Never update a snapshot without reviewing the diff,
   and don't ignore rendering differences.
2. Isolate the test (or the feature, if several snapshots change) with
   `.only`.
3. Run `npm run updateSnapshots` in headless mode to capture the new expected
   snapshot.
4. Remove `.only` (CI fails on a leftover `test.only`).
5. Commit the updated `*-snapshots/` folder.

If a snapshot mismatch isn't caused by a UI change, check that it ran headless
on Ubuntu 24.04 before touching the snapshot; if the old snapshot is wrong,
delete it and re-run the test.
