# Workspace map

## Regions

`WorkspacePage` composes one component per UI region; each region exposes its
panels and sections.

```
WorkspacePage
├── leftSidebar      LeftSidebarComponent
│   ├── mainMenu     main menu, file name
│   ├── pages        pages panel
│   ├── layers       layers tree, layer search
│   ├── assets       colors, typographies, components groups
│   └── tokens       sets, themes, tools, token types
├── toolbar          ToolbarComponent (drawing tools, path editor)
├── viewport         ViewportComponent (canvas actions, zoom)
├── palettes         color palette, typography palette
└── rightSidebar     RightSidebarComponent
    ├── design       Design tab: measures, fill, stroke, shadow, layout, text, export sections
    ├── prototype    Prototype tab
    └── inspect      Inspect tab

Shared (pages/components/): ContextMenu, Modal, ColorPicker, ScrollableList
```

## Target folder tree

```
pages/
  base-page.ts
  base-component.ts
  components/                      # shared across pages
    context-menu-component.ts
    modal-component.ts
    color-picker-component.ts
    scrollable-list-component.ts   # moved from workspace/left-sidebar/
  workspace/
    workspace-page.ts              # composes the regions below
    left-sidebar/
      left-sidebar-component.ts
      main-menu-component.ts
      pages-panel-component.ts
      layers-panel-component.ts
      assets/
      tokens/                      # existing sets/themes/tools components
    toolbar/
      toolbar-component.ts
      path-toolbar-component.ts    # path actions shown while editing a path
    viewport/
      viewport-component.ts
      path-overlay-component.ts    # nodes/segments drawn while editing a path
    palettes/
      color-palette-component.ts
      typography-palette-component.ts
    right-sidebar/
      right-sidebar-component.ts
      design-tab/
        design-tab-component.ts
        measures-section-component.ts
        fill-section-component.ts
        stroke-section-component.ts
        layout-section-component.ts
        text-section-component.ts
        export-section-component.ts
      prototype-tab-component.ts
      inspect-tab-component.ts
  view-mode/
    view-mode-page.ts              # own route, so a page
```

## Where legacy code moves

| Legacy file                                               | New home                                                                                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspace/main-page.js`                                  | Canvas actions → `viewport/`; drawing tools → `toolbar/`; navigation, save state → `workspace-page.ts`; context menu → `components/context-menu-component.ts`                         |
| `workspace/design-panel-page.js`                          | One section component per right-sidebar section under `right-sidebar/design-tab/`                                                                                                     |
| `workspace/layers-panel-page.js`                          | `left-sidebar/layers-panel-component.ts` (drop `extends MainPage`)                                                                                                                    |
| `workspace/panels-features/pages-panel-page.ts`           | `left-sidebar/pages-panel-component.ts`                                                                                                                                               |
| `workspace/assets-panel-page.js`                          | `left-sidebar/assets/`                                                                                                                                                                |
| `workspace/tokens/*`                                      | `left-sidebar/tokens/` (file moves only)                                                                                                                                              |
| `workspace/left-sidebar/scrollable-list-component.ts`     | `components/scrollable-list-component.ts`                                                                                                                                             |
| `workspace/left-sidebar/layer-search-component.ts`        | Child of `layers-panel-component.ts`                                                                                                                                                  |
| `workspace/toolbar/toolbar-page.ts`                       | `toolbar/toolbar-component.ts` (`ToolbarComponent`, no longer `extends MainPage`)                                                                                                     |
| `workspace/toolbar/path-editor/path-editor-page.ts`       | Path toolbar → `toolbar/path-toolbar-component.ts` (root = `pathActionsBlock`, now in `MainPage`); `enterPathEditing`, `exitPathEditing`, `undo/redoUntilState` → `workspace-page.ts` |
| `workspace/toolbar/path-editor/path-overlay-component.ts` | `viewport/path-overlay-component.ts` (extends `BaseComponent`)                                                                                                                        |
| `workspace/toolbar/path-editor/path-geometry.ts`          | `helpers/path-geometry.ts`                                                                                                                                                            |
| `workspace/color-palette-page.js`                         | `palettes/color-palette-component.ts`                                                                                                                                                 |
| `workspace/prototype-panel-page.js`                       | `right-sidebar/prototype-tab-component.ts`                                                                                                                                            |
| `workspace/inspect-panel-page.js`                         | `right-sidebar/inspect-tab-component.ts`                                                                                                                                              |
| `workspace/view-mode-page.js`                             | `pages/view-mode/view-mode-page.ts`                                                                                                                                                   |

## Not decided yet

Place these where the code already is and flag it in the PR, rather than
guessing:

- History panel and Comments: right-sidebar panels or their own components on
  `WorkspacePage`.
- Plugins (`plugins-page.js`): a modal component under `components/` or a
  workspace component.
- Whether a `workspacePage` fixture is added to `fixtures.ts` for all specs.
