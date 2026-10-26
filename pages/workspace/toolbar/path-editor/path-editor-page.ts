import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PathOverlayComponent } from '@pages/workspace/toolbar/path-editor/path-overlay-component';
import { ToolbarPage } from '@pages/workspace/toolbar/toolbar-page';
import { expect, type Locator, type Page } from '@playwright/test';

/** Actions of the path toolbar, by their button title. */
export const PathToolbarAction = {
  DrawNodes: 'Draw nodes (P)',
  MoveNodes: 'Move nodes (M)',
  MergeNodes: 'Merge nodes (Ctrl+J)',
  JoinNodes: 'Join nodes (J)',
  SeparateNodes: 'Separate nodes (K)',
  ToCorner: 'To corner (X)',
  ToCurve: 'To curve (C)',
  // Dropdown holding the Equal/Aligned/Independent modes (collapsed).
  HandlerBehaviour: 'Handler behaviour',
  SnapNodes: "Snap nodes (Ctrl+')",
} as const;

export type PathToolbarActionName =
  (typeof PathToolbarAction)[keyof typeof PathToolbarAction];

/**
 * Path editor (Penpot 2.19+): the mode a path enters to edit its nodes. While it
 * is open, the path toolbar (Draw/Move nodes, node actions, Snap nodes) replaces
 * the main toolbar, and the nodes and segments are edited on the canvas through
 * `overlayComp`.
 *
 * The path toolbar only shows the actions that apply to the current selection;
 * it marks the active mode/toggle with a CSS class only (no aria-pressed).
 */
export class PathEditorPage extends ToolbarPage {
  // components
  readonly overlayComp: PathOverlayComponent;

  // pages
  readonly layersPanelPage: LayersPanelPage;

  // locators
  readonly pathToolbarButtons: Locator;
  readonly nodePanelDrawNodesButton: Locator;
  readonly nodePanelMoveNodesButton: Locator;
  readonly nodePanelMergeNodesButton: Locator;
  readonly nodePanelJoinNodesButton: Locator;
  readonly nodePanelSeparateNodesButton: Locator;
  readonly nodePanelToCornerButton: Locator;
  readonly nodePanelToCurveButton: Locator;

  constructor(page: Page) {
    super(page);

    // components
    this.overlayComp = new PathOverlayComponent(page);

    // pages
    this.layersPanelPage = new LayersPanelPage(page);

    // locators
    this.pathToolbarButtons = this.pathActionsBlock.getByRole('button');
    this.nodePanelDrawNodesButton = this.getToolbarButton(
      PathToolbarAction.DrawNodes,
    );
    this.nodePanelMoveNodesButton = this.getToolbarButton(
      PathToolbarAction.MoveNodes,
    );
    this.nodePanelMergeNodesButton = this.getToolbarButton(
      PathToolbarAction.MergeNodes,
    );
    this.nodePanelJoinNodesButton = this.getToolbarButton(
      PathToolbarAction.JoinNodes,
    );
    this.nodePanelSeparateNodesButton = this.getToolbarButton(
      PathToolbarAction.SeparateNodes,
    );
    this.nodePanelToCornerButton = this.getToolbarButton(PathToolbarAction.ToCorner);
    this.nodePanelToCurveButton = this.getToolbarButton(PathToolbarAction.ToCurve);
  }

  getToolbarButton(action: PathToolbarActionName) {
    return this.pathActionsBlock.getByRole('button', { name: action, exact: true });
  }

  /** Selects the layer in the layers tree and opens it in the path editor. */
  async enterPathEditing(layerName = 'Path') {
    await this.layersPanelPage.selectLayerByExactName(layerName);
    await this.clickOnEnter();
    await this.overlayComp.isVisible();
  }

  async exitPathEditing() {
    await this.clickOnESC();
    await this.overlayComp.isHidden();
  }

  async clickDrawNodesButtonOnNodePanel() {
    await this.nodePanelDrawNodesButton.click();
  }

  async clickMoveNodesButtonOnNodePanel() {
    await this.nodePanelMoveNodesButton.click();
  }

  async clickMergeNodesButtonOnNodePanel() {
    await this.nodePanelMergeNodesButton.click();
  }

  async clickJoinNodesButtonOnNodePanel() {
    await this.nodePanelJoinNodesButton.click();
  }

  async clickSeparateNodesButtonOnNodePanel() {
    await this.nodePanelSeparateNodesButton.click();
  }

  async clickToCornerButtonOnNodePanel() {
    await this.nodePanelToCornerButton.click();
  }

  async clickToCurveButtonOnNodePanel() {
    await this.nodePanelToCurveButton.click();
  }

  /** Merges the selected nodes (same as the Merge nodes button). */
  async pressCtrlJKeyboardShortcut() {
    await this.page.keyboard.press('Control+J');
  }

  /** Clears the path selection (nodes and segments); the editor stays open. */
  async pressClearSelectionShortcut() {
    await this.page.keyboard.press('Control+Shift+A');
  }

  /** Removes the selected nodes together with their adjacent segments. */
  async pressDeleteWithSegmentsShortcut() {
    await this.page.keyboard.press('Shift+Delete');
  }

  /**
   * Presses `shortcut` until the path looks like `expectedStateKey` (see
   * PathOverlayComponent.getStateKey()), one press at a time, and fails if it
   * doesn't get there in `maxPresses`. An edit can take more than one history
   * step (e.g. drawing a segment adds its start node first), so a test checks
   * that each edit comes back in order instead of counting presses.
   */
  private async pressUntilState(
    shortcut: () => Promise<void>,
    expectedStateKey: string,
    message: string,
    maxPresses = 4,
  ) {
    for (let i = 0; i < maxPresses; i++) {
      const before = await this.overlayComp.getStateKey();
      if (before === expectedStateKey) return;
      await shortcut();
      // Let the overlay redraw; a step that changes nothing visible times out
      // here and the loop just presses again.
      await expect
        .poll(() => this.overlayComp.getStateKey(), { timeout: 1000 })
        .not.toBe(before)
        .catch(() => {});
    }
    expect(await this.overlayComp.getStateKey(), message).toBe(expectedStateKey);
  }

  async undoUntilState(expectedStateKey: string, message: string) {
    await this.pressUntilState(
      () => this.clickShortcutCtrlZ(),
      expectedStateKey,
      message,
    );
  }

  async redoUntilState(expectedStateKey: string, message: string) {
    await this.pressUntilState(
      () => this.clickShortcutCtrlShiftZ(),
      expectedStateKey,
      message,
    );
  }

  /** Names of the actions shown in the path toolbar, in display order. */
  async getToolbarActions(): Promise<string[]> {
    return this.pathToolbarButtons.evaluateAll((buttons) =>
      buttons.map((b) => b.getAttribute('title')!),
    );
  }

  /** Checks the path toolbar shows exactly these actions, in this order, and
   * none of them is disabled: unavailable actions must be hidden instead. */
  async checkToolbarActions(expected: PathToolbarActionName[]) {
    await expect
      .poll(() => this.getToolbarActions(), { message: 'Path toolbar actions' })
      .toEqual(expected);
    await this.checkNoDisabledToolbarActions();
  }

  async checkNoDisabledToolbarActions() {
    await expect(
      this.pathToolbarButtons.and(this.page.getByRole('button', { disabled: true })),
      'No path toolbar action is disabled',
    ).toHaveCount(0);
  }

  async isToolbarButtonToggled(button: Locator, toggled = true) {
    toggled
      ? await expect(button).toHaveClass(/is-toggled/)
      : await expect(button).not.toHaveClass(/is-toggled/);
  }
}
