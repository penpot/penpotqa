import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * The "Use individual tokens" / "Use a reference" toggle of a composite token
 * form, shared by the Typography and Shadow token forms. Its root is the
 * create/edit token modal: the toggle has no role or label, and its test IDs are
 * unique there.
 */
export class TokenValueOptionsComponent extends BaseComponent {
  readonly useCompositeButton: Locator;
  readonly useAliasButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.useCompositeButton = root.getByTestId('composite-opt');
    this.useAliasButton = root.getByTestId('reference-opt');
  }

  /** Clicks the "Use a reference" option, which shows the Reference field. */
  async clickOnUseReferenceButton() {
    await this.useAliasButton.click();
  }

  /** Clicks the "Use individual tokens" option, which shows the individual fields. */
  async clickOnUseCompositeButton() {
    await this.useCompositeButton.click();
  }

  /** Checks that "Use individual tokens" is the selected option. */
  async checkUseCompositeOptionIsSelected() {
    await expect(
      this.useCompositeButton,
      '"Use individual tokens" is selected',
    ).toBeChecked();
  }
}
