import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Modal opened from Team Settings to put the team in an organization ("Add to an
 * organization") or move it to another one ("Change team organization").
 * Most of its actions still live in TeamPage and move here progressively.
 */
export class TeamOrganizationModalComponent extends BaseComponent {
  readonly orgPicker: Locator;

  constructor(page: Page) {
    // The modal has no role or accessible name, so it is found by class
    super(page, page.locator('[class*="modal-select-organization-container"]'));
    this.orgPicker = this.root.getByRole('combobox');
  }

  /** Opens the organization picker, listing the destinations the user can pick. */
  async openOrgPicker() {
    await this.orgPicker.click();
  }

  /** Closes the modal with Escape, without adding or moving the team. */
  async close() {
    await this.page.keyboard.press('Escape');
    await expect(this.root, 'Team organization modal is closed').toBeHidden();
  }
}
