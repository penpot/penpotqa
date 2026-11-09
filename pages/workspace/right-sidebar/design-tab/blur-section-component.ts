import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** Blur types as the blur type dropdown shows them. */
export const BlurType = {
  Layer: 'Layer blur',
  Background: 'Background blur',
} as const;

export type BlurTypeName = (typeof BlurType)[keyof typeof BlurType];

/** The Blur section of the Design tab. */
export class BlurSectionComponent extends BaseComponent {
  readonly addBlurButton: Locator;
  readonly blurRow: Locator;
  readonly blurTypeSelect: Locator;
  readonly moreOptionsButton: Locator;
  readonly blurValueInput: Locator;
  readonly toggleBlurButton: Locator;
  readonly removeBlurButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.addBlurButton = root.getByRole('button', { name: 'Add blur' });
    this.blurRow = root.getByTestId('blur-info');
    this.blurTypeSelect = root.getByRole('combobox', { name: 'Blur type select' });
    this.moreOptionsButton = root.getByRole('button', {
      name: 'Show/hide more options',
    });
    this.blurValueInput = root.getByRole('textbox');
    this.toggleBlurButton = root.getByRole('button', { name: 'Toggle blur' });
    this.removeBlurButton = root.getByRole('button', { name: 'Remove blur' });
  }

  /** Adds a layer blur with the default value. */
  async addBlur() {
    await this.addBlurButton.click();
  }

  /**
   * Changes the blur type from its dropdown.
   * @param type Blur type, see BlurType.
   */
  async selectBlurType(type: BlurTypeName) {
    await this.blurTypeSelect.click();
    await this.page.getByRole('option', { name: type, exact: true }).click();
  }

  /**
   * Opens the blur options and types a new value.
   * @param value Blur value in px.
   */
  async changeBlurValue(value: string) {
    await this.moreOptionsButton.click();
    await this.blurValueInput.clear();
    await this.blurValueInput.pressSequentially(value);
  }

  /** Hides or shows the blur with its eye button. */
  async toggleBlur() {
    await this.toggleBlurButton.click();
  }

  /** Removes the blur. */
  async removeBlur() {
    await this.removeBlurButton.click();
  }

  /**
   * Checks whether the selected layer has a blur in the section.
   * @param added Expected state.
   */
  async checkBlurAdded(added = true) {
    await expect(
      this.blurRow,
      added ? 'Blur is added' : 'Blur is removed',
    ).toHaveCount(added ? 1 : 0);
  }

  /**
   * Checks whether the blur is hidden: its more options button is disabled only while hidden.
   * @param hidden Expected state.
   */
  async checkBlurHidden(hidden = true) {
    await expect(
      this.moreOptionsButton,
      hidden ? 'Blur is hidden' : 'Blur is shown',
    ).toBeEnabled({ enabled: !hidden });
  }

  /**
   * Checks the blur value (the blur options must be open).
   * @param value Expected value in px.
   */
  async checkBlurValue(value: string) {
    await expect(this.blurValueInput, `Blur value is ${value}`).toHaveValue(value);
  }
}
