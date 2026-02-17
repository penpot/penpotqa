import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

export class DeletedPage extends BasePage {
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

  private getDeletedProjectRowByName(projectName: string): Locator {
    return this.deletedProjectRow.filter({ hasText: projectName });
  }

  private getDeletedFileByName(projectName: string, fileName: string): Locator {
    return this.getDeletedProjectRowByName(projectName).getByRole('button', {
      name: fileName,
    });
  }

  /* -------------------------------------------------
   * Menu helpers
   * ------------------------------------------------- */

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

  async openFileOptionsMenu(projectName: string, fileName: string) {
    await this.getDeletedFileByName(projectName, fileName)
      .getByRole('button', { name: 'Options', exact: true })
      .click();
  }

  /* -------------------------------------------------
   * UI state transitions
   * ------------------------------------------------- */

  private async waitForConfirmModalToClose() {
    await this.confirmModal.waitFor({ state: 'hidden' });
  }

  private async waitForFileToDisappear(projectName: string, fileName: string) {
    await expect(this.getDeletedFileByName(projectName, fileName)).toHaveCount(0);
  }

  private async waitForProjectToDisappear(projectName: string) {
    await expect(this.getDeletedProjectRowByName(projectName)).toHaveCount(0);
  }

  private async waitUntilTrashIsEmpty() {
    await expect(this.deletedProjectRow).toHaveCount(0);
    await expect(this.emptyTrashMessage).toBeVisible();
  }

  /* -------------------------------------------------
   * Actions
   * ------------------------------------------------- */

  async restoreAllProjectsAndFiles() {
    await this.restoreAllButton.click();
    await this.continueButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitUntilTrashIsEmpty();
  }

  async deleteAllProjectsAndFilesForever() {
    await this.clearTrashButton.click();
    await this.deleteForeverButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitUntilTrashIsEmpty();
  }

  async restoreDeletedFileViaOptions(projectName: string, fileName: string) {
    await this.openFileOptionsMenu(projectName, fileName);
    await this.restoreFileButton.click();
    await this.continueButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitForFileToDisappear(projectName, fileName);
  }

  async deleteForeverDeletedFileViaOptions(projectName: string, fileName: string) {
    await this.openFileOptionsMenu(projectName, fileName);
    await this.deleteFileButton.click();
    await this.deleteForeverButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitForFileToDisappear(projectName, fileName);
  }

  async restoreDeletedProjectViaOptions(projectName: string) {
    await this.openProjectOptionsMenu(projectName);
    await this.restoreProjectButton.click();
    await this.continueButton.click();

    await this.waitForConfirmModalToClose();
    await this.waitForProjectToDisappear(projectName);
  }

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

  async isDeletedFileVisible(
    projectName: string,
    fileName: string,
    timeout?: number,
  ) {
    await expect(this.getDeletedFileByName(projectName, fileName)).toBeVisible({
      timeout,
    });
  }

  async isDeletedProjectVisible(projectName: string, timeout?: number) {
    await expect(this.getDeletedProjectRowByName(projectName)).toBeVisible({
      timeout,
    });
  }

  async isEmptyTrashMessageVisible() {
    await expect(this.emptyTrashMessage).toBeVisible();
  }
}
