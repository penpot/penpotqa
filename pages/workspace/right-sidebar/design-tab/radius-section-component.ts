import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** The Radius section of the Design tab (Measures area). */
export class RadiusSectionComponent extends BaseComponent {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  /**
   * Checks the radius field shows a broken token reference: a token
   * pill labelled as not existing or deleted, with its red error dot.
   *
   * @param tokenName - Name of the token the shape still references.
   */
  async checkTokenNotExistOrDeleted(tokenName: string) {
    const brokenTokenPill = this.root.getByRole('button', {
      name: `{${tokenName}} token does not exist or has been deleted.`,
    });
    await expect(
      brokenTokenPill,
      `Radius shows token "${tokenName}" as not existing`,
    ).toBeVisible();
    await expect(
      brokenTokenPill.locator('[class*="pill-dot"]'),
      `Radius error dot for token "${tokenName}" is visible`,
    ).toBeVisible();
  }
}
