import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** Fields of the "Change password" form, by their label and placeholder. */
export const PasswordField = {
  Old: 'Old password',
  New: 'New password',
  Confirm: 'Confirm password',
} as const;

export type PasswordFieldName = (typeof PasswordField)[keyof typeof PasswordField];

/** Your account > Password: the "Change password" form. */
export class PasswordSectionComponent extends BaseComponent {
  readonly heading: Locator;
  readonly changePasswordButton: Locator;
  readonly inputError: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.heading = root.getByRole('heading', { name: 'Change password' });
    this.changePasswordButton = root.getByTestId('submit-password');
    this.inputError = root.locator('[id*=":password"]');
  }

  /**
   * Password input of a field.
   * @param field Field, e.g. PasswordField.Old.
   */
  private getInput(field: PasswordFieldName): Locator {
    return this.root.getByPlaceholder(field);
  }

  /**
   * Label of a field, which wraps its input and its show/hide icon.
   * @param field Field, e.g. PasswordField.Old.
   */
  private getLabel(field: PasswordFieldName): Locator {
    // `has` is resolved inside each label, so its locator starts from `page`
    return this.root
      .locator('label')
      .filter({ has: this.page.getByPlaceholder(field) });
  }

  /**
   * Types a password in a field.
   * @param field Field, e.g. PasswordField.New.
   * @param value Password to type.
   */
  async fillPassword(field: PasswordFieldName, value: string) {
    await this.getInput(field).fill(value);
  }

  /**
   * Fills the three fields of the form.
   * @param oldPassword Current password.
   * @param newPassword New password.
   * @param confirmPassword Confirmation; defaults to `newPassword`.
   */
  async fillForm(
    oldPassword: string,
    newPassword: string,
    confirmPassword = newPassword,
  ) {
    await this.fillPassword(PasswordField.Old, oldPassword);
    await this.fillPassword(PasswordField.New, newPassword);
    await this.fillPassword(PasswordField.Confirm, confirmPassword);
  }

  /**
   * Clicks the eye icon that shows a field's password.
   * @param field Field, e.g. PasswordField.Old.
   */
  async showPassword(field: PasswordFieldName) {
    await this.getLabel(field).locator('svg.icon-shown').click();
  }

  /**
   * Clicks the eye icon that hides a field's password.
   * @param field Field, e.g. PasswordField.Old.
   */
  async hidePassword(field: PasswordFieldName) {
    await this.getLabel(field).locator('svg.icon-hide').click();
  }

  /** Clicks "Change password". */
  async submit() {
    await this.changePasswordButton.click();
  }

  /** Checks the section is shown, by its "Change password" heading. */
  async checkIsVisible() {
    await expect(this.heading, 'Password section is shown').toBeVisible();
  }

  /**
   * Checks a field shows its password as plain text.
   * @param field Field, e.g. PasswordField.Old.
   * @param value Password the field must show.
   */
  async checkPasswordIsShown(field: PasswordFieldName, value: string) {
    await expect(this.getInput(field), `${field} is shown`).toHaveValue(value);
    await expect(this.getInput(field), `${field} is shown`).not.toHaveAttribute(
      'type',
      'password',
    );
  }

  /**
   * Checks a field hides its password (input of type "password").
   * @param field Field, e.g. PasswordField.Old.
   */
  async checkPasswordIsHidden(field: PasswordFieldName) {
    await expect(this.getInput(field), `${field} is hidden`).toHaveAttribute(
      'type',
      'password',
    );
  }

  /**
   * Checks the first validation error of the form.
   * @param error Expected error text.
   */
  async checkError(error: string) {
    await expect(this.inputError.first(), `Password error is "${error}"`).toHaveText(
      error,
    );
  }

  /** Checks "Change password" is disabled. */
  async checkChangePasswordButtonIsDisabled() {
    await expect(
      this.changePasswordButton,
      '"Change password" button is disabled',
    ).toBeDisabled();
  }
}
