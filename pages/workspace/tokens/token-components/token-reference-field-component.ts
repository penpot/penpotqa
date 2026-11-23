import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * The Reference field of a composite token form ("Use a reference" option), shared
 * by the Typography and Shadow token forms. Its root is the create/edit token
 * modal: the field's row has no role or label, and its controls are unique there.
 */
export class TokenReferenceFieldComponent extends BaseComponent {
  readonly referenceInput: Locator;
  readonly detachReferenceButton: Locator;
  readonly aliasInputError: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.referenceInput = root.getByRole('textbox', { name: 'Reference' });
    this.detachReferenceButton = root.getByRole('button', {
      name: 'Detach reference',
    });
    this.aliasInputError = root.getByText(/^Missing token references:/);
  }

  /**
   * Fills the Reference field.
   * @param value - Reference to fill, e.g. `{typography.base}`.
   */
  async fillAliasInput(value: string) {
    await this.referenceInput.fill(value);
  }

  /**
   * Checks whether the Reference field shows the "Missing token references" error.
   * @param visible - `true` (default) to expect the error, `false` to expect none.
   */
  async checkAliasInputErrorIsVisible(visible = true) {
    visible
      ? await expect(
          this.aliasInputError,
          'Missing token references error is visible',
        ).toBeVisible()
      : await expect(
          this.aliasInputError,
          'Missing token references error is hidden',
        ).toBeHidden();
  }

  /** Hovers the Reference field, which reveals its detach button. */
  async hoverReferenceInput() {
    await this.referenceInput.hover();
  }

  /** Clicks the detach button at the right of the Reference field. */
  async clickOnDetachReferenceButton() {
    await this.detachReferenceButton.click();
  }

  /**
   * Checks whether the detach button of the Reference field is visible. It is
   * hidden until the field is hovered or focused.
   * @param visible - `true` (default) to expect it visible, `false` to expect it hidden.
   */
  async checkDetachReferenceButtonIsVisible(visible = true) {
    visible
      ? await expect(
          this.detachReferenceButton,
          'Detach reference button is visible',
        ).toBeVisible()
      : await expect(
          this.detachReferenceButton,
          'Detach reference button is hidden',
        ).toBeHidden();
  }

  /** Hovers the detach button of the Reference field and checks its tooltip. */
  async checkDetachReferenceButtonTooltip() {
    await this.detachReferenceButton.hover();
    await expect(
      this.page.getByRole('tooltip'),
      'Detach reference button tooltip is "Detach reference"',
    ).toHaveText('Detach reference');
  }

  /**
   * Checks the value of the Reference field.
   * @param value - Expected value, e.g. `{typography.base}`, or `''` for empty.
   */
  async checkReferenceInputHasValue(value: string) {
    await expect(
      this.referenceInput,
      `Reference field has value "${value}"`,
    ).toHaveValue(value);
  }
}
