import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Titles of a layer's lock button: they name the action, so a locked layer shows "Unlock".
 */
export const LayerLockTitle = {
  Locked: 'Unlock',
  Unlocked: 'Lock',
} as const;

/**
 * Titles of a layer's eye button: they name the action, so a hidden layer shows "Show".
 */
export const LayerVisibilityTitle = {
  Hidden: 'Show',
  Visible: 'Hide',
} as const;

/**
 * Layers panel of the left sidebar (the layer tree).
 *
 * Most of its locators and methods still live in LayersPanelPage and move here
 * progressively.
 */
export class LayersPanelComponent extends BaseComponent {
  readonly layerRows: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.layerRows = root.getByTestId('layer-row');
  }

  /**
   * Returns the row of a layer in the tree.
   * @param name Layer name exactly as shown in the panel.
   */
  getLayerRow(name: string): Locator {
    return this.layerRows.filter({
      has: this.page.getByText(name, { exact: true }),
    });
  }

  /**
   * Returns the lock button of a layer row, found by its `title` (its only accessible name, see LayerLockTitle).
   * @param name Layer name exactly as shown in the panel.
   * @param locked Whether the layer is currently locked.
   */
  getLayerLockButton(name: string, locked: boolean): Locator {
    return this.getLayerRow(name).getByTitle(
      locked ? LayerLockTitle.Locked : LayerLockTitle.Unlocked,
      { exact: true },
    );
  }

  /**
   * Locks or unlocks a layer from its row (the button only shows on hover).
   * @param name Layer name exactly as shown in the panel.
   * @param locked Whether the layer is currently locked.
   */
  async toggleLayerLock(name: string, locked = false) {
    await this.getLayerRow(name).hover();
    await this.getLayerLockButton(name, locked).click();
  }

  /**
   * Checks whether a layer is locked, from its row's lock button.
   * @param name Layer name exactly as shown in the panel.
   * @param locked Expected state.
   */
  async checkLayerLocked(name: string, locked = true) {
    await expect(
      this.getLayerLockButton(name, locked),
      `Layer "${name}" is ${locked ? 'locked' : 'unlocked'}`,
    ).toBeAttached();
  }

  /**
   * Checks whether a layer name is being edited in the panel (its name input is shown).
   * @param editing Expected state.
   */
  async checkLayerNameInputVisible(editing = true) {
    await expect(
      this.layerRows.getByRole('textbox'),
      editing ? 'A layer name is being edited' : 'No layer name is being edited',
    ).toHaveCount(editing ? 1 : 0);
  }

  /**
   * Returns the eye button of a layer row, found by its `title` (its only accessible name, see LayerVisibilityTitle).
   * @param name Layer name exactly as shown in the panel.
   * @param hidden Whether the layer is currently hidden.
   */
  getLayerVisibilityButton(name: string, hidden: boolean): Locator {
    return this.getLayerRow(name).getByTitle(
      hidden ? LayerVisibilityTitle.Hidden : LayerVisibilityTitle.Visible,
      { exact: true },
    );
  }

  /**
   * Checks whether a layer is hidden, from its row's eye button.
   * @param name Layer name exactly as shown in the panel.
   * @param hidden Expected state.
   */
  async checkLayerHidden(name: string, hidden = true) {
    await expect(
      this.getLayerVisibilityButton(name, hidden),
      `Layer "${name}" is ${hidden ? 'hidden' : 'shown'}`,
    ).toBeAttached();
  }

  /**
   * Checks that a layer is inside another one. A collapsed parent doesn't render its
   * children, so it is expanded first; they sit in a `children-<id>` container next
   * to the parent's row.
   * @param child Child layer name exactly as shown in the panel.
   * @param parent Parent layer name exactly as shown in the panel.
   * @param parentIcon Icon id (without the `icon-` prefix, e.g. `board`) the parent row must show, to tell apart layers with the same name; default: any.
   */
  async checkLayerIsChildOf(child: string, parent: string, parentIcon?: string) {
    const parentRows = this.getLayerRow(parent);
    const parentRow = (
      parentIcon
        ? parentRows.filter({ has: this.page.getByTestId(`icon-${parentIcon}`) })
        : parentRows
    ).first();
    const toggle = parentRow.getByTestId('toggle-content');
    await toggle.waitFor({ state: 'visible' });
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
      await toggle.click();
    }
    const parentId = await parentRow.getAttribute('id');
    await expect(
      this.root
        .getByTestId(`children-${parentId}`)
        .getByTestId('layer-row')
        .filter({ has: this.page.getByText(child, { exact: true }) }),
      `Layer "${child}" is inside "${parent}"`,
    ).not.toHaveCount(0);
  }

  /**
   * Checks how many layer rows are selected in the panel (rows are checkboxes with `aria-checked`).
   * @param count Expected number of selected rows.
   */
  async checkSelectedLayersCount(count: number) {
    await expect(
      this.layerRows.and(this.page.getByRole('checkbox', { checked: true })),
      `${count} layer(s) are selected in the layers panel`,
    ).toHaveCount(count);
  }
}
