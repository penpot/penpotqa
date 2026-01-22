import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

export class DeletedPage extends BasePage {
  // Section header
  readonly restoreAllButton: Locator;
  readonly clearTrashButton: Locator;
  readonly emptyTrashMessage: Locator;

  // Grid
  readonly deletedProjectWrapper: Locator;
  readonly deletedProjectRow: Locator;
  readonly restoreFileButton: Locator;
  readonly deleteFileButton: Locator;
  readonly restoreProjectButton: Locator;
  readonly deleteProjectButton: Locator;

  // Confirm Modal
  readonly confirmModal: Locator;
  readonly continueButton: Locator;
  readonly deleteForeverButton: Locator;

  constructor(page: Page) {
    super(page);

    // Section header
    this.restoreAllButton = page.getByRole('button', { name: 'Restore All' });
    this.clearTrashButton = page.getByRole('button', { name: 'Clear Trash' });
    this.emptyTrashMessage = this.page.getByText(
      'Your trash is empty. Deleted files and projects will appear here.',
    );

    // Grid
    this.deletedProjectWrapper = page.locator(
      '.main_ui_dashboard_deleted__project-name-wrapper',
    );
    this.deletedProjectRow = page.locator(
      '.main_ui_dashboard_deleted__dashboard-project-row',
    );
    this.restoreFileButton = page.getByRole('menuitem', { name: 'Restore File' });
    this.deleteFileButton = page.getByRole('menuitem', { name: 'Delete File' });
    this.restoreProjectButton = page.getByRole('menuitem', {
      name: 'Restore Project',
    });
    this.deleteProjectButton = page.getByRole('menuitem', {
      name: 'Delete Project',
    });

    // Confirm Modal
    this.confirmModal = page.locator('.main_ui_confirm__modal-container');
    this.continueButton = this.confirmModal.getByRole('button', {
      name: 'Continue',
    });
    this.deleteForeverButton = this.confirmModal.getByRole('button', {
      name: 'Delete Forever',
    });
  }

  /**
   * Returns the deleted project row matching the given project name.
   * @param projectName The name of the deleted project.
   */
  private async getDeletedProjectRowByName(projectName: string) {
    return this.deletedProjectRow.filter({ hasText: projectName });
  }

  /**
   * Returns the deleted file by name, inside a specific project.
   * @param projectName The name of the project containing the deleted file.
   * @param fileName The name of the deleted file.
   */
  private async getDeletedFileByName(projectName: string, fileName: string) {
    const projectRow = await this.getDeletedProjectRowByName(projectName);
    return projectRow.getByRole('button', { name: fileName });
  }

  async openFileOptionsMenu(projectName: string, fileName: string) {
    const deletedFile = await this.getDeletedFileByName(projectName, fileName);

    const fileOptionsMenuButton = deletedFile.getByRole('button', {
      name: 'Options',
      exact: true,
    });

    await fileOptionsMenuButton.click();
  }

  async openProjectOptionsMenu(projectName: string) {
    const deletedProject = (
      await this.getDeletedProjectRowByName(projectName)
    ).locator('.main_ui_dashboard_deleted__project-name-wrapper');

    const fileOptionsMenuButton = deletedProject.getByRole('button', {
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

  async restoreFileViaOptionsIcon(projectName: string, fileName: string) {
    await this.openFileOptionsMenu(projectName, fileName);
    await this.restoreFileButton.click();
  }

  async deleteFileViaOptionsIcon(projectName: string, fileName: string) {
    await this.openFileOptionsMenu(projectName, fileName);
    await this.deleteFileButton.click();
  }

  async restoreProjectViaOptionsIcon(projectName: string) {
    await this.openProjectOptionsMenu(projectName);
    await this.restoreProjectButton.click();
  }

  async restoreAllProjectsAndFiles() {
    await this.clickRestoreAllButton();
    await this.clickContinueButton();
  }

  async deleteAllForeverProjectsAndFiles() {
    await this.clickClearTrashButton();
    await this.confirmDeleteForever();
  }

  async deleteProjectViaOptionsIcon(projectName: string) {
    await this.openProjectOptionsMenu(projectName);
    await this.deleteProjectButton.click();
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }

  async confirmDeleteForever() {
    await this.deleteForeverButton.click();
  }

  async restoreDeletedFileViaOptions(projectName: string, fileName: string) {
    await this.restoreFileViaOptionsIcon(projectName, fileName);
    await this.clickContinueButton();
  }

  async deleteForeverDeletedFileViaOptions(projectName: string, fileName: string) {
    await this.deleteFileViaOptionsIcon(projectName, fileName);
    await this.confirmDeleteForever();
  }

  async restoreDeletedProjectViaOptions(projectName: string) {
    await this.restoreProjectViaOptionsIcon(projectName);
    await this.clickContinueButton();
  }

  async deleteForeverDeletedProjectViaOptions(projectName: string) {
    await this.deleteProjectViaOptionsIcon(projectName);
    await this.confirmDeleteForever();
  }

  async isDeletedFileVisible(projectName: string, fileName: string) {
    const deletedFile = await this.getDeletedFileByName(projectName, fileName);
    await expect(deletedFile, `Deleted file "${fileName}" is visible`).toBeVisible();
  }

  async isDeletedFileNotVisible(projectName: string, fileName: string) {
    const deletedFile = await this.getDeletedFileByName(projectName, fileName);
    await expect(
      deletedFile,
      `Deleted file "${fileName}" is not visible`,
    ).not.toBeVisible();
  }

  async waitForDeletedFileNotVisible(projectName: string, fileName: string) {
    const deletedFile = await this.getDeletedFileByName(projectName, fileName);
    await deletedFile.waitFor({ state: 'detached' });
  }

  async waitForDeletedProjectNotVisible(projectName: string) {
    const deletedProject = await this.getDeletedProjectRowByName(projectName);
    await deletedProject.waitFor({ state: 'detached' });
  }

  async isDeletedProjectVisible(projectName: string) {
    const deletedProject = await this.getDeletedProjectRowByName(projectName);
    await expect(
      deletedProject,
      `Deleted project "${projectName}" is visible`,
    ).toBeVisible();
  }

  async isDeletedProjectNotVisible(projectName: string) {
    const deletedProject = await this.getDeletedProjectRowByName(projectName);
    await expect(
      deletedProject,
      `Deleted project "${projectName}" is NOT visible`,
    ).not.toBeVisible();
  }

  async isEmptyTrashMessageVisible() {
    await expect(
      this.emptyTrashMessage,
      'Empty trash message is visible',
    ).toBeVisible();
  }
}
