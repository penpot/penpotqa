import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Test ids of the boolean operation buttons ("differente" is Penpot's spelling).
 */
export const BooleanOperation = {
  Union: 'bool-opt-union',
  Difference: 'bool-opt-differente',
  Intersection: 'bool-opt-intersection',
  Exclude: 'bool-opt-exclude',
} as const;

export type BooleanOperationName = keyof typeof BooleanOperation;

/**
 * Boolean operation buttons at the top of the Design tab, shown when several
 * shapes or a boolean group are selected.
 */
export class BooleanSectionComponent extends BaseComponent {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  /**
   * Applies a boolean operation to the selection with its button.
   * @param operation Operation to apply, e.g. 'Union'.
   */
  async applyOperation(operation: BooleanOperationName) {
    await this.root.getByTestId(BooleanOperation[operation]).click();
  }

  /**
   * Checks that an operation's button is the selected one (the selection is a boolean group of that type).
   * @param operation Expected operation, e.g. 'Union'.
   */
  async checkOperationSelected(operation: BooleanOperationName) {
    await expect(
      // The radio input is hidden (the label is the button), so it has no role
      this.root
        .getByTestId(BooleanOperation[operation])
        .locator('input[type="radio"]'),
      `${operation} is the selected boolean operation`,
    ).toBeChecked();
  }
}
