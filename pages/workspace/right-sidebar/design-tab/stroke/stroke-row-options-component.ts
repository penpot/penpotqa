import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** Stroke positions as the position dropdown labels them. */
export const StrokePosition = {
  Center: 'Center',
  Inside: 'Inside',
  Outside: 'Outside',
} as const;

export type StrokePositionName =
  (typeof StrokePosition)[keyof typeof StrokePosition];

/** Stroke styles that can be picked in the style dropdown. */
export const StrokeStyle = {
  Solid: 'Solid',
  Dotted: 'Dotted',
  Dashed: 'Dashed',
} as const;

export type StrokeStyleName = (typeof StrokeStyle)[keyof typeof StrokeStyle];

/**
 * One stroke row of the Stroke section (`stroke-row-N`): color, opacity, remove
 * button, width, position and style. Get it with `StrokeSectionComponent.getStrokeRow()`.
 */
export class StrokeRowOptionsComponent extends BaseComponent {
  readonly colorInput: Locator;
  readonly opacityInput: Locator;
  readonly removeButton: Locator;
  readonly widthInput: Locator;
  readonly positionField: Locator;
  readonly styleField: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.colorInput = root.getByRole('textbox', { name: 'Color', exact: true });
    this.opacityInput = root.getByTestId('opacity-input');
    this.removeButton = root.getByRole('button', { name: 'Remove stroke' });
    this.widthInput = root.getByRole('textbox', { name: 'Stroke width' });
    this.positionField = root.getByTestId('stroke.alignment');
    this.styleField = root.getByTestId('stroke.style');
  }

  /**
   * Types a value in a text field of the row and confirms it with Enter.
   * @param input Field to fill.
   * @param value Value to type.
   */
  private async fillAndConfirm(input: Locator, value: string) {
    await input.clear();
    await input.pressSequentially(value);
    await input.press('Enter');
  }

  /**
   * Picks an option of one of the row's dropdowns.
   * @param field Dropdown to open.
   * @param option Label of the option to pick.
   */
  private async selectOption(field: Locator, option: string) {
    await field.click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  /**
   * Sets the stroke color.
   * @param hex Color with the leading `#` (e.g. '#43E50B').
   */
  async setColor(hex: string) {
    await this.fillAndConfirm(this.colorInput, hex.slice(1));
  }

  /**
   * Sets the stroke opacity.
   * @param value Opacity without the `%` (e.g. '60').
   */
  async setOpacity(value: string) {
    await this.fillAndConfirm(this.opacityInput, value);
  }

  /**
   * Sets the stroke width.
   * @param value Width (e.g. '10').
   */
  async setWidth(value: string) {
    await this.fillAndConfirm(this.widthInput, value);
  }

  /**
   * Sets the stroke position.
   * @param position Position to pick (e.g. StrokePosition.Inside).
   */
  async setPosition(position: StrokePositionName) {
    await this.selectOption(this.positionField, position);
  }

  /**
   * Sets the stroke style.
   * @param style Style to pick (e.g. StrokeStyle.Dotted).
   */
  async setStyle(style: StrokeStyleName) {
    await this.selectOption(this.styleField, style);
  }

  /** Removes this stroke with its "-" (Remove stroke) button. */
  async remove() {
    await this.removeButton.click();
  }

  /**
   * Checks the stroke color.
   * @param hex Expected color with the leading `#` (e.g. '#43E50B').
   */
  async checkColor(hex: string) {
    await expect(this.colorInput, `Stroke color is ${hex}`).toHaveValue(
      new RegExp(`^${hex.slice(1)}$`, 'i'),
    );
  }

  /**
   * Checks the stroke opacity.
   * @param value Expected opacity without the `%` (e.g. '60').
   */
  async checkOpacity(value: string) {
    await expect(this.opacityInput, `Stroke opacity is ${value}`).toHaveValue(value);
  }

  /**
   * Checks the stroke width.
   * @param value Expected width (e.g. '10').
   */
  async checkWidth(value: string) {
    await expect(this.widthInput, `Stroke width is ${value}`).toHaveValue(value);
  }

  /**
   * Checks the stroke position, shown in its dropdown as a labelled icon.
   * @param position Expected position (e.g. StrokePosition.Inside).
   */
  async checkPosition(position: StrokePositionName) {
    await expect(
      this.positionField.getByLabel(position, { exact: true }),
      `Stroke position is ${position}`,
    ).toBeVisible();
  }

  /**
   * Checks the stroke style, shown in its dropdown as a labelled icon.
   * @param style Expected style (e.g. StrokeStyle.Dotted).
   */
  async checkStyle(style: StrokeStyleName) {
    await expect(
      this.styleField.getByLabel(style, { exact: true }),
      `Stroke style is ${style}`,
    ).toBeVisible();
  }
}
