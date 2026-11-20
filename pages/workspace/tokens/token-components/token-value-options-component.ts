import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';

/**
 * Returns the root of the value options of a composite token form (Typography,
 * Shadow): the "Use individual tokens" / "Use a reference" toggle. The toggle has
 * no role or label, so it is matched by class.
 * @param tokenModal - The create/edit token modal.
 * @returns The toggle's radio button wrapper.
 */
export function getTokenValueOptionsRoot(tokenModal: Locator): Locator {
  return tokenModal.locator('[class*="listing-options"]');
}

/**
 * The "Use individual tokens" / "Use a reference" toggle of a composite token
 * form, shared by the Typography and Shadow token forms.
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
}
