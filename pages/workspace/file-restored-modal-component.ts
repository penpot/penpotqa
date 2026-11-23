import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * "This file was restored" modal: shown to the other users who have the file open
 * when someone restores a version of it. It only closes with its "Got it" button.
 */
export class FileRestoredModalComponent extends BaseComponent {
  readonly gotItButton: Locator;

  constructor(page: Page) {
    super(page, page.getByRole('dialog', { name: 'This file was restored' }));
    this.gotItButton = this.root.getByRole('button', { name: 'Got it' });
  }

  /**
   * Checks whether the modal is shown.
   * @param visible Whether it should be visible; default: true.
   */
  async checkFileRestoredModalVisible(visible = true) {
    await expect(
      this.root,
      `"This file was restored" modal is ${visible ? 'visible' : 'hidden'}`,
    ).toBeVisible({ visible });
  }

  /**
   * Checks the modal's message for a version restored by a known user, and its "Got it" button.
   * @param userName Name of the user who restored the version.
   * @param versionName Name of the restored version.
   */
  async checkRestoredVersionMessage(userName: string, versionName: string) {
    await expect(
      this.root.getByRole('paragraph'),
      `Modal says ${userName} restored "${versionName}"`,
    ).toHaveText(
      `${userName} restored the version “${versionName}”. ` +
        'Changes made after it are no longer in the file.',
    );
    await expect(this.gotItButton, 'Modal has the "Got it" button').toBeVisible();
  }

  /** Clicks the viewport outside the modal (its overlay covers the whole screen). */
  async clickOutside() {
    const box = await this.page.getByTestId('viewport').boundingBox();
    await this.page.mouse.click(box!.x + 20, box!.y + 20);
  }

  /** Closes the modal with its "Got it" button. */
  async clickGotItButton() {
    await this.gotItButton.click();
    await this.checkFileRestoredModalVisible(false);
  }
}
