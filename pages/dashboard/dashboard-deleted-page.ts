import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

export class DeletedPage extends BasePage {
  // Section header
  readonly restoreAllButton: Locator;
  readonly clearTrashButton: Locator;
  readonly deletedInfoMessage: Locator;

  // Grid
  readonly deletedProjectRow: Locator;
  readonly restoreFileButton: Locator;
  readonly deleteFileButton: Locator;

  // Confirm Modal
  readonly confirmModal: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);

    this.restoreAllButton = page.getByRole('button', { name: 'Restore All' });
    this.clearTrashButton = page.getByRole('button', { name: 'Clear Trash' });
    this.deletedInfoMessage = page.locator(
      '.main_ui_dashboard_deleted__deleted-info',
    );

    this.deletedProjectRow = page.locator(
      '.main_ui_dashboard_deleted__dashboard-project-row',
    );
    this.restoreFileButton = page.getByRole('menuitem', { name: 'Restore File' });
    this.deleteFileButton = page.getByRole('menuitem', { name: 'Delete File' });

    this.confirmModal = page.locator('.main_ui_confirm__modal-container');
    this.continueButton = this.confirmModal.getByRole('button', {
      name: 'Continue',
    });
  }

  private async getDeletedProjectRowByName(projectName: string): Promise<Locator> {
    return this.deletedProjectRow.filter({ hasText: projectName });
  }

  // Locate a deleted item (file) by name, inside a specific project
  private async getDeletedItemByName(
    projectName: string,
    fileName: string,
  ): Promise<Locator> {
    const projectRow = await this.getDeletedProjectRowByName(projectName);
    return projectRow.getByRole('button', { name: fileName });
  }

  async waitForDeletedItemDetached(
    projectName: string,
    fileName: string,
  ): Promise<void> {
    const deletedItem = await this.getDeletedItemByName(projectName, fileName);
    await deletedItem.waitFor({ state: 'detached' });
  }

  async clickOnFileOptionsForFile(
    projectName: string,
    fileName: string,
  ): Promise<void> {
    const deletedItem = await this.getDeletedItemByName(projectName, fileName);

    const fileOptionsMenuButton = deletedItem.getByRole('button', {
      name: 'Options',
      exact: true,
    });

    await fileOptionsMenuButton.click();
  }

  async clickRestoreAllButton() {
    await this.restoreAllButton.click();
  }

  async clickClearTrashButton() {
    await this.clearTrashButton.click();
  }

  async clickDeletedItem(projectName: string, fileName: string): Promise<void> {
    const deletedItem = await this.getDeletedItemByName(projectName, fileName);
    await deletedItem.click();
  }

  async restoreFileViaOptionsIcon(
    projectName: string,
    fileName: string,
  ): Promise<void> {
    await this.clickOnFileOptionsForFile(projectName, fileName);
    await this.restoreFileButton.click();
  }

  async deleteFileViaOptionsIcon(
    projectName: string,
    fileName: string,
  ): Promise<void> {
    await this.clickOnFileOptionsForFile(projectName, fileName);
    await this.deleteFileButton.click();
  }

  async confirmRestoreFile(): Promise<void> {
    // Click the button to trigger the restore
    await this.continueButton.click();

    // Wait for the restore request to finish and contain the 'end' event
    await this.page.waitForResponse(async (resp) => {
      if (
        !resp.url().includes('restore-deleted-team-files') ||
        resp.status() !== 200
      ) {
        return false;
      }

      const body = await resp.text();
      return body.includes('"event":"end"');
    });
  }

  async restoreDeletedFile(projectName: string, fileName: string): Promise<void> {
    await this.restoreFileViaOptionsIcon(projectName, fileName);
    await this.confirmRestoreFile();
    await this.waitForDeletedItemDetached(projectName, fileName);
  }

  async isDeletedInfoVisible(message: string) {
    await expect(
      this.deletedInfoMessage.getByText(message),
      `Deleted info message "${message}" is visible`,
    ).toBeVisible();
  }

  async isDeletedItemVisible(
    projectName: string,
    fileName: string,
    timeout?: number,
  ): Promise<void> {
    const deletedItem = await this.getDeletedItemByName(projectName, fileName);
    await expect(deletedItem, `Deleted item "${fileName}" is visible`).toBeVisible({
      timeout,
    });
  }

  async isDeletedItemNotVisible(
    projectName: string,
    fileName: string,
    timeout?: number,
  ): Promise<void> {
    const deletedItem = await this.getDeletedItemByName(projectName, fileName);
    await expect(
      deletedItem,
      `Deleted item "${fileName}" is not visible`,
    ).not.toBeVisible({ timeout });
  }
}
