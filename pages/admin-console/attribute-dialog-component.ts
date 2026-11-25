import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * The Attributes tab's "Create an attribute" and "Edit attribute" dialogs: the
 * same name and description fields and duplicate name check, each with its own
 * title and submit button.
 */
export class AttributeDialogComponent extends BaseComponent {
  readonly nameField: Locator;
  readonly descriptionField: Locator;
  readonly submitButton: Locator;
  readonly duplicateNameError: Locator;

  /**
   * @param page The Attributes page.
   * @param title The dialog's title, e.g. 'Edit attribute'.
   * @param submitLabel Its submit button, e.g. 'Save changes'.
   */
  constructor(page: Page, title: string, submitLabel: string) {
    super(page, page.getByRole('dialog', { name: title }));
    this.nameField = this.root.getByRole('textbox', { name: 'Attribute name' });
    this.descriptionField = this.root.getByRole('textbox', { name: 'Description' });
    this.submitButton = this.root.getByRole('button', { name: submitLabel });
    this.duplicateNameError = this.root.getByText(
      'An attribute with this name already exists.',
    );
  }

  /**
   * Types a name, replacing the current one.
   * @param name Attribute name, e.g. 'Ops'.
   */
  async typeName(name: string) {
    await this.nameField.fill(name);
  }

  /**
   * Types a description, replacing the current one.
   * @param description Description, e.g. 'Legal department'.
   */
  async typeDescription(description: string) {
    await this.descriptionField.fill(description);
  }

  /**
   * Clicks the submit button. It doesn't wait for the change to be saved, so it
   * also drives names that get rejected.
   */
  async clickSubmit() {
    await this.submitButton.click();
  }

  /**
   * Checks the name and description fields.
   * @param name Expected name, e.g. 'Contractors'.
   * @param description Expected description, e.g. 'People from agencies'.
   */
  async checkFieldsHaveValues(name: string, description: string) {
    await expect(this.nameField, `Name field shows "${name}"`).toHaveValue(name);
    await expect(
      this.descriptionField,
      `Description field shows "${description}"`,
    ).toHaveValue(description);
  }

  /**
   * Checks the line under the fields that says how many members hold the
   * attribute (only in "Edit attribute").
   * @param text Its text, e.g. '1 member holds this attribute'.
   */
  async checkHoldersMessageIsVisible(text: string) {
    await expect(
      this.root.getByText(text, { exact: true }),
      `The dialog reads "${text}"`,
    ).toBeVisible();
  }

  /**
   * Checks whether the submit button is enabled.
   * @param enabled Whether it should be enabled (default: true).
   */
  async checkSubmitIsEnabled(enabled = true) {
    const message = `Submit button is ${enabled ? 'enabled' : 'disabled'}`;
    if (enabled) await expect(this.submitButton, message).toBeEnabled();
    else await expect(this.submitButton, message).toBeDisabled();
  }

  /**
   * Checks the dialog rejects a name already in use: the error under the name,
   * the typed name kept and the submit button disabled.
   * @param name Name typed in the dialog, e.g. 'OPS'.
   */
  async checkDuplicateNameErrorIsVisible(name: string) {
    await expect(
      this.duplicateNameError,
      'Duplicate name error is visible',
    ).toBeVisible();
    await expect(this.nameField, `Name field keeps "${name}"`).toHaveValue(name);
    await this.checkSubmitIsEnabled(false);
  }

  /**
   * Checks the duplicate name error is gone and the submit button is enabled
   * again, as happens as soon as the name is edited.
   */
  async checkDuplicateNameErrorIsHidden() {
    await expect(
      this.duplicateNameError,
      'Duplicate name error is hidden',
    ).toBeHidden();
    await this.checkSubmitIsEnabled();
  }

  /** Checks the dialog is closed. */
  async checkIsHidden() {
    await expect(this.root, 'The attribute dialog is closed').toBeHidden();
  }
}
