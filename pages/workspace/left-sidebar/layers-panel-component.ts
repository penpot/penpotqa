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
}
