import { type Locator, type Page, expect } from '@playwright/test';

export class BaseComponent {
  readonly page: Page;
  readonly modalCancelButton: Locator;
  readonly modalSaveButton: Locator;
  readonly modalCloseButton: Locator;
  readonly deleteOption: Locator;
  readonly duplicateOption: Locator;

  constructor(page: Page) {
    this.page = page;
    this.deleteOption = page.getByRole('listitem').filter({ hasText: 'Delete' });
    this.duplicateOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Duplicate' });
    this.modalCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.modalSaveButton = page.getByRole('button', { name: 'Save' });
    this.modalCloseButton = page.getByRole('button', { name: 'Close' });
  }

  async clickOnEnter() {
    await this.page.keyboard.press('Enter');
  }

  async clickOnCancelButton() {
    if (await this.modalCancelButton.isVisible()) {
      await expect(this.modalCancelButton).toBeEnabled();
      await this.modalCancelButton.click();
    }
  }

  async clickOnSaveButton() {
    if (await this.modalSaveButton.isVisible()) {
      await expect(this.modalSaveButton).toBeEnabled();
      await this.modalSaveButton.click();
    }
  }

  async closeModalWindow() {
    const closeButton = this.modalCloseButton.last();
    if (await closeButton.isVisible()) {
      await closeButton.click({ force: true });
    }
  }
}
