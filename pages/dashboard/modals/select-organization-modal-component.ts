import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * The organization picker modal, opened from Team Settings to put the team in
 * an organization ("Add to an organization") or move it to another one
 * ("Change team organization"). Its title and "Close" button are checked by
 * ModalComponent. Most of its actions still live in TeamPage and move here
 * progressively.
 */
export class SelectOrganizationModalComponent extends BaseComponent {
  readonly orgPicker: Locator;

  /**
   * @param page - A page on the dashboard.
   * @param root - The modal portal, ModalComponent's `root`.
   */
  constructor(page: Page, root: Locator) {
    super(page, root);
    this.orgPicker = root.getByRole('combobox');
  }

  /** Opens the organization picker, listing the destinations the user can pick. */
  async openOrgPicker() {
    await this.orgPicker.click();
  }

  /**
   * Checks whether the organization picker is shown. When the user can't add
   * the team to any organization, Penpot shows a TeamFormModalComponent message
   * instead.
   *
   * @param visible - Whether it should be shown (default: true).
   */
  async checkOrgPickerIsVisible(visible = true) {
    visible
      ? await expect(this.orgPicker, 'Organization picker is shown').toBeVisible()
      : await expect(this.orgPicker, 'Organization picker is not shown').toHaveCount(
          0,
        );
  }

  /** Closes the modal with Escape, without adding or moving the team. */
  async close() {
    await this.page.keyboard.press('Escape');
    await expect(this.orgPicker, 'Team organization modal is closed').toBeHidden();
  }
}
