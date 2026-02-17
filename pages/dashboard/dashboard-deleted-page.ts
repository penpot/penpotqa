import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Page Object Model for the Deleted (Trash) section of the Dashboard
 * Handles interactions with deleted projects and files in the trash
 */
export class DeletedPage extends BasePage {
  // Default timeout for assertions and wait operations (in milliseconds)
  private static readonly DEFAULT_TIMEOUT = 10000;

  // Section header
  readonly deletedSection: Locator;
  readonly restoreAllButton: Locator;
  readonly clearTrashButton: Locator;
  readonly emptyTrashMessage: Locator;

  // Grid
  readonly deletedProjectRow: Locator;

  // Menu actions
  readonly restoreFileButton: Locator;
  readonly deleteFileButton: Locator;
  readonly restoreProjectButton: Locator;
  readonly deleteProjectButton: Locator;

  // Confirm modal
  readonly confirmModal: Locator;
  readonly continueButton: Locator;
  readonly deleteForeverButton: Locator;

  constructor(page: Page) {
    super(page);

    this.deletedSection = page.getByTestId('deleted-page-section');
    this.restoreAllButton = this.deletedSection.getByRole('button', {
      name: 'Restore All',
    });
    this.clearTrashButton = this.deletedSection.getByRole('button', {
      name: 'Clear Trash',
    });

    this.emptyTrashMessage = this.deletedSection.getByText(
      'Your trash is empty. Deleted files and projects will appear here.',
    );

    // TODO: Replace with data-testid when available in app
    this.deletedProjectRow = this.deletedSection.locator(
      '[class*="dashboard-project-row"]',
    );

    this.restoreFileButton = page.getByRole('menuitem', { name: 'Restore File' });
    this.deleteFileButton = page.getByRole('menuitem', { name: 'Delete File' });
    this.restoreProjectButton = page.getByRole('menuitem', {
      name: 'Restore Project',
    });
    this.deleteProjectButton = page.getByRole('menuitem', {
      name: 'Delete Project',
    });

    // TODO: Replace with data-testid when available in app
    this.confirmModal = page.locator('[class*="modal-container"][class*="confirm"]');
    this.continueButton = this.confirmModal.getByRole('button', {
      name: 'Continue',
    });
    this.deleteForeverButton = this.confirmModal.getByRole('button', {
      name: 'Delete Forever',
    });
  }

  /* -------------------------------------------------
   * Locator helpers
   * ------------------------------------------------- */

  /**
   * Gets the locator for a deleted project row by name
   * @param projectName - The name of the project
   * @returns Locator for the project row
   */
  private getDeletedProjectRowByName(projectName: string): Locator {
    return this.deletedProjectRow.filter({ hasText: projectName });
  }

  /**
   * Gets the locator for a deleted file by name within a project
   * @param projectName - The name of the project containing the file
   * @param fileName - The name of the file
   * @returns Locator for the file button
   */
  private getDeletedFileByName(projectName: string, fileName: string): Locator {
    return this.getDeletedProjectRowByName(projectName).getByRole('button', {
      name: fileName,
    });
  }

  /* -------------------------------------------------
   * Menu helpers
   * ------------------------------------------------- */

  /**
   * Opens the options menu for a deleted project
   * @param projectName - The name of the deleted project
   */
  async openProjectOptionsMenu(projectName: string) {
    // TODO: Replace with data-testid when available in app
    const deletedProject = this.getDeletedProjectRowByName(projectName)
      .locator('[class*="project-name-wrapper"]')
      .getByRole('button', {
        name: 'Options',
        exact: true,
      });

    await deletedProject.click();
  }

  /**
   * Opens the options menu for a deleted file
   * @param projectName - The name of the project containing the file
   * @param fileName - The name of the deleted file
   */
  async openFileOptionsMenu(projectName: string, fileName: string) {
    await this.getDeletedFileByName(projectName, fileName)
      .getByRole('button', { name: 'Options', exact: true })
      .click();
  }

  /* -------------------------------------------------
   * UI state transitions
   * ------------------------------------------------- */

  /**
   * Waits for the confirmation modal to close
   * @param timeout - Optional timeout in milliseconds
   */
  private async waitForConfirmModalToClose(timeout?: number) {
    await this.confirmModal.waitFor({
      state: 'hidden',
      timeout: timeout ?? DeletedPage.DEFAULT_TIMEOUT,
    });
  }

  /**
   * Waits for a specific file to disappear from the trash
   * @param projectName - The name of the project containing the file
   * @param fileName - The name of the file
   * @param timeout - Optional timeout in milliseconds
   */
  private async waitForFileToDisappear(
    projectName: string,
    fileName: string,
    timeout?: number,
  ) {
    await expect(this.getDeletedFileByName(projectName, fileName)).toHaveCount(0, {
      timeout: timeout ?? DeletedPage.DEFAULT_TIMEOUT,
    });
  }

  /**
   * Waits for a specific project to disappear from the trash
   * @param projectName - The name of the project
   * @param timeout - Optional timeout in milliseconds
   */
  private async waitForProjectToDisappear(projectName: string, timeout?: number) {
    await expect(this.getDeletedProjectRowByName(projectName)).toHaveCount(0, {
      timeout: timeout ?? DeletedPage.DEFAULT_TIMEOUT,
    });
  }

  /**
   * Waits until the trash is completely empty
   * Verifies that no deleted items remain and the empty message is visible
   * @param timeout - Optional timeout in milliseconds
   */
  private async waitUntilTrashIsEmpty(timeout?: number) {
    const timeoutValue = timeout ?? DeletedPage.DEFAULT_TIMEOUT;
    await expect(this.deletedProjectRow).toHaveCount(0, { timeout: timeoutValue });
    await expect(this.emptyTrashMessage).toBeVisible({ timeout: timeoutValue });
  }

  /* -------------------------------------------------
   * Actions
   * ------------------------------------------------- */

  /**
   * Restores all deleted projects and files from trash
   * Clicks the "Restore All" button and confirms the action
   * Waits for the modal to close and trash to be empty
   */
  async restoreAllProjectsAndFiles() {
    await this.restoreAllButton.click();
    await this.continueButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitUntilTrashIsEmpty();
  }

  /**
   * Permanently deletes all projects and files from trash
   * Clicks the "Clear Trash" button and confirms deletion
   * Waits for the modal to close and trash to be empty
   */
  async deleteAllProjectsAndFilesForever() {
    await this.clearTrashButton.click();
    await this.deleteForeverButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitUntilTrashIsEmpty();
  }

  /**
   * Restores a specific deleted file via the options menu
   * @param projectName - The name of the project containing the file
   * @param fileName - The name of the file to restore
   */
  async restoreDeletedFileViaOptions(projectName: string, fileName: string) {
    await this.openFileOptionsMenu(projectName, fileName);
    await this.restoreFileButton.click();
    await this.continueButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitForFileToDisappear(projectName, fileName);
  }

  /**
   * Permanently deletes a specific file via the options menu
   * @param projectName - The name of the project containing the file
   * @param fileName - The name of the file to delete permanently
   */
  async deleteForeverDeletedFileViaOptions(projectName: string, fileName: string) {
    await this.openFileOptionsMenu(projectName, fileName);
    await this.deleteFileButton.click();
    await this.deleteForeverButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitForFileToDisappear(projectName, fileName);
  }

  /**
   * Restores a specific deleted project via the options menu
   * @param projectName - The name of the project to restore
   */
  async restoreDeletedProjectViaOptions(projectName: string) {
    await this.openProjectOptionsMenu(projectName);
    await this.restoreProjectButton.click();
    await this.continueButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitForProjectToDisappear(projectName);
  }

  /**
   * Permanently deletes a specific project via the options menu
   * @param projectName - The name of the project to delete permanently
   */
  async deleteForeverDeletedProjectViaOptions(projectName: string) {
    await this.openProjectOptionsMenu(projectName);
    await this.deleteProjectButton.click();
    await this.deleteForeverButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitForProjectToDisappear(projectName);
  }

  /* -------------------------------------------------
   * Assertions
   * ------------------------------------------------- */

  /**
   * Verifies that a deleted file is visible in the trash
   * @param projectName - The name of the project containing the file
   * @param fileName - The name of the deleted file
   * @param timeout - Optional timeout in milliseconds (defaults to 10000ms)
   */
  async isDeletedFileVisible(
    projectName: string,
    fileName: string,
    timeout?: number,
  ) {
    await expect(this.getDeletedFileByName(projectName, fileName)).toBeVisible({
      timeout: timeout ?? DeletedPage.DEFAULT_TIMEOUT,
    });
  }

  /**
   * Verifies that a deleted project is visible in the trash
   * @param projectName - The name of the deleted project
   * @param timeout - Optional timeout in milliseconds (defaults to 10000ms)
   */
  async isDeletedProjectVisible(projectName: string, timeout?: number) {
    await expect(this.getDeletedProjectRowByName(projectName)).toBeVisible({
      timeout: timeout ?? DeletedPage.DEFAULT_TIMEOUT,
    });
  }

  /**
   * Verifies that the empty trash message is visible
   * This indicates that there are no deleted items in the trash
   * @param timeout - Optional timeout in milliseconds (defaults to 10000ms)
   */
  async isEmptyTrashMessageVisible(timeout?: number) {
    await expect(this.emptyTrashMessage).toBeVisible({
      timeout: timeout ?? DeletedPage.DEFAULT_TIMEOUT,
    });
  }
}
