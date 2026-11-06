import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** Layout directions as the direction buttons' titles show them (grid layouts only have Row and Column). */
export const LayoutDirection = {
  Row: 'Row',
  RowReverse: 'Row reverse',
  Column: 'Column',
  ColumnReverse: 'Column reverse',
} as const;

export type LayoutDirectionName =
  (typeof LayoutDirection)[keyof typeof LayoutDirection];

/**
 * The Layout section of the Design tab for a board with a flex or grid layout.
 *
 * Most of its locators and methods still live in DesignPanelPage and move here
 * progressively.
 */
export class LayoutContainerSectionComponent extends BaseComponent {
  readonly toggleButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.toggleButton = root.getByRole('button', { name: 'Layout', exact: true });
  }

  /** Expands the section if it is collapsed (adding a layout from the canvas leaves it collapsed). */
  async expand() {
    await expect(this.toggleButton, 'Layout section is shown').toBeVisible();
    if (!(await this.getDirectionButton(LayoutDirection.Row).isVisible())) {
      await this.toggleButton.click();
    }
    await expect(
      this.getDirectionButton(LayoutDirection.Row),
      'Layout section is expanded',
    ).toBeVisible();
  }

  /**
   * Returns a direction button, found by its title.
   * @param direction Direction, see LayoutDirection.
   */
  getDirectionButton(direction: LayoutDirectionName): Locator {
    return this.root.getByTitle(direction, { exact: true });
  }

  /**
   * Changes the layout direction.
   * @param direction Direction, see LayoutDirection.
   */
  async changeDirection(direction: LayoutDirectionName) {
    await this.expand();
    await this.getDirectionButton(direction).click();
  }

  /**
   * Checks which direction button is selected.
   * @param direction Expected direction, see LayoutDirection.
   */
  async checkDirection(direction: LayoutDirectionName) {
    await expect(
      this.getDirectionButton(direction),
      `Layout direction "${direction}" is selected`,
    ).toBeChecked();
  }
}
