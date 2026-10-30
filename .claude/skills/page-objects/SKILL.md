---
name: page-objects
description: How to structure Playwright page objects in penpotqa as pages and scoped components that mirror the Penpot UI (WorkspacePage → left sidebar, toolbar, viewport, palettes, right sidebar → panels and sections). Use this skill whenever you create, extend, move or refactor anything under pages/, add locators or methods to a page object, split a large page object such as design-panel-page.js or main-page.js, decide where a new locator or method belongs, or write a spec that needs workspace page objects — even if the user only says "add a method to the design panel" or "where should this go".
---

# Page objects: pages and components that mirror the Penpot UI

The page object tree follows what a person sees on screen. If you can point at
it in Penpot, its file path should read the same way:
`workspace/right-sidebar/design-tab/fill-section-component.ts` is the Fill
section of the Design tab in the right sidebar.

Why: the legacy objects are flat "panel pages" (`design-panel-page.js` is 2,800
lines, `main-page.js` 1,433), panels inherit from `MainPage` only to reuse its
methods, and most locators start from `page`, so a `Radius` textbox can match
in the wrong panel. Scoped, composed components fix all three.

## Page or component?

|                     | Page                                                    | Component                                      |
| ------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| What it is          | Something you navigate to (has its own route)           | A region inside a page                         |
| Base class          | `BasePage`                                              | `BaseComponent`                                |
| Locators start from | `page`                                                  | `this.root`                                    |
| Owns                | Route, navigation, save state, its top-level components | One UI region and its child components         |
| Examples            | `WorkspacePage`, `ViewModePage`, `DashboardPage`        | `LayersPanelComponent`, `FillSectionComponent` |
| File name           | `*-page.ts`                                             | `*-component.ts`                               |

View mode has its own route, so it is a page (`pages/view-mode/view-mode-page.ts`),
not a mode of `WorkspacePage`.

A **mode** inside a page (path editing, text editing) is not a page, even when
it changes a lot of the screen. It has no route; it changes what some regions
show. Model each changed region as a component in that region's folder, and put
the actions that span regions (enter/exit the mode, undo until a state) on
`WorkspacePage`. For example, the path editor is a `PathToolbarComponent` under
`toolbar/` (the path actions that replace the main toolbar) plus a
`PathOverlayComponent` under `viewport/` (the nodes drawn on the canvas). It is
not a `PathEditorPage` that inherits the whole canvas API.

Pure helpers that have no locators (geometry, math, types) aren't page objects;
put them in `helpers/`.

## Rules

1. **Compose, don't inherit.** A page or component exposes its children as
   `readonly` properties built in the constructor. Never extend `MainPage` or
   another component just to call its methods; compose it instead. Only
   `BasePage` / `BaseComponent` are extended.
2. **Scope every locator to `this.root`.** The root is the region's container
   (e.g. `page.getByTestId('right-sidebar')`). Children get a root derived
   from their parent's root. The exception is UI rendered outside the region
   (context menus, modals, dropdown portals): use the shared components for
   those.
3. **Shared UI is a component too.** Context menu, modal, color picker and
   scrollable list live in `pages/components/` and are composed wherever
   they're needed, not copied into each panel.
4. **Assertions are methods on the component that owns the UI**, named
   `check…` (see `.claude/SKILLS.md`, "Assertions live in page objects").
5. **TypeScript only** for new and moved files. Name each file after the
   class it exports.
6. **Prefer `getByRole` / `getByTestId` / `getByText`** over CSS selectors,
   per CLAUDE.md.

## `BaseComponent` root

Components take `(page, root)`. If `pages/base-component.ts` doesn't have a
`root` yet, add it as an optional constructor argument defaulting to
`page.locator('body')`, so existing components (tokens, etc.) keep working:

```ts
export class BaseComponent {
  readonly page: Page;
  readonly root: Locator;

  constructor(page: Page, root?: Locator) {
    this.page = page;
    this.root = root ?? page.locator('body');
    // ...existing locators
  }
}
```

## Writing a component

```ts
import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

export class FillSectionComponent extends BaseComponent {
  readonly addFillButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.addFillButton = root.getByRole('button', { name: 'Add fill' });
  }

  async addFill() {
    await this.addFillButton.click();
  }

  async checkFillCount(count: number) {
    await expect(
      this.root.getByRole('listitem'),
      `Fill section has ${count} fills`,
    ).toHaveCount(count);
  }
}
```

A parent wires its children with scoped roots:

```ts
export class DesignTabComponent extends BaseComponent {
  readonly fill: FillSectionComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.fill = new FillSectionComponent(page, root.getByLabel('Fill section'));
  }
}
```

Locator and method names in these examples are illustrative. When moving code,
copy the real locators from the legacy page object and only re-root them.

## Using it from a spec

Tests instantiate the page, never individual panels, and the call reads like
the UI path:

```ts
mainTest(qase(1234, 'Add fill to rectangle'), async ({ page }) => {
  const workspace = new WorkspacePage(page);
  await workspace.toolbar.drawRectangle();
  await workspace.leftSidebar.layers.selectByName('Rectangle');
  await workspace.rightSidebar.design.fill.addFill();
  await workspace.rightSidebar.design.fill.checkFillCount(1);
});
```

If a feature area uses fixtures, expose `workspacePage` as a fixture instead
(`.claude/SKILLS.md`, "Fixture composition").

## Where things go

For the workspace region map, target folder tree and where each legacy file's
code moves, read `references/workspace-map.md`. For other areas (dashboard,
admin console) apply the same rule: open Penpot, name the regions you see,
and make each one a component under its page's folder.

When unsure where a method belongs, ask: _which region of the screen does the
user interact with to do this?_ That region's component owns it. If two
regions are involved (drag a layer onto the canvas), the method goes on the
lowest common parent, usually `WorkspacePage`.

## Migrating legacy code

The migration is incremental; every step must leave the suite green.

- **Don't add new methods to legacy panel pages** (`*-panel-page.js`,
  `main-page.js`). Put them in the new component, even if it's the first one in
  its folder.
- **When moving a section out of a legacy class, keep the old API working**:
  the old class constructs the new component and delegates to it, so existing
  specs don't change in the same PR.
- **Move existing components** (`tokens/`, `left-sidebar/`,
  `toolbar/path-editor/path-overlay-component.ts`) into the new tree with plain
  file moves and import updates; don't rewrite them at the same time.
- **Delete a legacy file** only when `grep -r` shows no spec imports it.
- Keep PRs to one region or section at a time, so reviewers can diff the
  moved locators against the originals.
