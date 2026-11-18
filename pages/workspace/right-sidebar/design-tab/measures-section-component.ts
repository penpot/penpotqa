import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** A position in the X axis / Y axis fields (relative to the parent board, if any). */
export type LayerPosition = { x: number; y: number };

/**
 * Measures section of the Design tab (size, position, rotation, radius).
 * Most of its locators and methods still live in DesignPanelPage and move here progressively.
 */
export class MeasuresSectionComponent extends BaseComponent {
  readonly xAxisInput: Locator;
  readonly yAxisInput: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.xAxisInput = root.getByRole('textbox', { name: 'X axis', exact: true });
    this.yAxisInput = root.getByRole('textbox', { name: 'Y axis', exact: true });
  }

  /**
   * Checks the selected layer's X axis and Y axis values.
   * @param position Expected position, e.g. { x: 0, y: 37.5 }.
   */
  async checkPosition({ x, y }: LayerPosition) {
    await expect(this.xAxisInput, `X axis is ${x}`).toHaveValue(String(x));
    await expect(this.yAxisInput, `Y axis is ${y}`).toHaveValue(String(y));
  }
}
