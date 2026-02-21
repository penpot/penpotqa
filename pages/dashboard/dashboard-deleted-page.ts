import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Page Object Model for the Deleted (Trash) section of the Dashboard
 * Handles interactions with deleted projects and files in the trash
 */
export class DeletedPage extends BasePage {
  // Default timeout for assertions and wait operations (in milliseconds)
  private static readonly DEFAULT_TIMEOUT = 10000;

  /* -------------------------------------------------
   * Page element locators
   * ------------------------------------------------- */

  // Section header elements
  readonly deletedSection: Locator;
  readonly restoreAllButton: Locator;
  readonly clearTrashButton: Locator;
  readonly emptyTrashMessage: Locator;

  // Grid elements
  readonly deletedProjectRow: Locator;

  // Menu action items (context menu options)
  readonly restoreFileButton: Locator;
  readonly deleteFileButton: Locator;
  readonly restoreProjectButton: Locator;
  readonly deleteProjectButton: Locator;

  // Confirmation modal elements
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
   *
   * These private methods build locators for specific elements
   * within the deleted page. They're used internally by other
   * methods to maintain consistency and reduce duplication.
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
   *
   * Methods for interacting with context menus (options menus)
   * for deleted projects and files. These methods open the
   * three-dot menu that appears on each deleted item.
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
   *
   * Private methods that wait for specific UI state changes.
   * These ensure that actions complete successfully before
   * proceeding, making tests more reliable and deterministic.
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
   *
   * High-level action methods that perform complete workflows.
   * Each method handles clicking, confirming, and waiting for
   * the action to complete. These are the main methods used in tests.
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
   *
   * Verification methods for testing. These methods use Playwright's
   * expect assertions to verify the state of deleted items in the trash.
   * Includes both positive (isVisible) and negative (isNotVisible) assertions,
   * as well as helper methods that return boolean values for conditional logic.
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

  /**
   * Verifies that a deleted file is NOT visible in the trash
   * @param projectName - The name of the project containing the file
   * @param fileName - The name of the deleted file
   * @param timeout - Optional timeout in milliseconds (defaults to 10000ms)
   */
  async isDeletedFileNotVisible(
    projectName: string,
    fileName: string,
    timeout?: number,
  ) {
    await expect(this.getDeletedFileByName(projectName, fileName)).toHaveCount(0, {
      timeout: timeout ?? DeletedPage.DEFAULT_TIMEOUT,
    });
  }

  /**
   * Verifies that a deleted project is NOT visible in the trash
   * @param projectName - The name of the deleted project
   * @param timeout - Optional timeout in milliseconds (defaults to 10000ms)
   */
  async isDeletedProjectNotVisible(projectName: string, timeout?: number) {
    await expect(this.getDeletedProjectRowByName(projectName)).toHaveCount(0, {
      timeout: timeout ?? DeletedPage.DEFAULT_TIMEOUT,
    });
  }

  /**
   * Gets the total count of deleted projects in the trash
   * @returns Promise<number> - The number of deleted projects
   */
  async getDeletedProjectsCount(): Promise<number> {
    return await this.deletedProjectRow.count();
  }

  /**
   * Checks if there are any deleted projects in the trash
   * @returns Promise<boolean> - True if there are deleted projects, false otherwise
   */
  async hasDeletedProjects(): Promise<boolean> {
    const count = await this.getDeletedProjectsCount();
    return count > 0;
  }

  /**
   * Checks if the trash is currently empty
   * @returns Promise<boolean> - True if trash is empty, false otherwise
   */
  async isTrashEmpty(): Promise<boolean> {
    const isEmpty = await this.emptyTrashMessage.isVisible();
    const projectCount = await this.getDeletedProjectsCount();
    return isEmpty && projectCount === 0;
  }

  /* -------------------------------------------------
   * Convenience aliases for common operations
   * These methods provide shorter names for frequently used actions
   * ------------------------------------------------- */

  /**
   * Alias for restoreDeletedFileViaOptions
   * @param projectName - The name of the project containing the file
   * @param fileName - The name of the file to restore
   */
  async restoreFile(projectName: string, fileName: string) {
    await this.restoreDeletedFileViaOptions(projectName, fileName);
  }

  /**
   * Alias for deleteForeverDeletedFileViaOptions
   * @param projectName - The name of the project containing the file
   * @param fileName - The name of the file to delete permanently
   */
  async deleteFile(projectName: string, fileName: string) {
    await this.deleteForeverDeletedFileViaOptions(projectName, fileName);
  }

  /**
   * Alias for restoreDeletedProjectViaOptions
   * @param projectName - The name of the project to restore
   */
  async restoreProject(projectName: string) {
    await this.restoreDeletedProjectViaOptions(projectName);
  }

  /**
   * Alias for deleteForeverDeletedProjectViaOptions
   * @param projectName - The name of the project to delete permanently
   */
  async deleteProject(projectName: string) {
    await this.deleteForeverDeletedProjectViaOptions(projectName);
  }

  /**
   * Alias for restoreAllProjectsAndFiles
   * Shorter name for restoring all items from trash
   */
  async restoreAll() {
    await this.restoreAllProjectsAndFiles();
  }

  /**
   * Alias for deleteAllProjectsAndFilesForever
   * Shorter name for emptying the trash completely
   */
  async emptyTrash() {
    await this.deleteAllProjectsAndFilesForever();
  }
}
