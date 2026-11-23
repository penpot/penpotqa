import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** Options of a version's menu ("Open version menu" button) in the History tab. */
export const VersionMenuOption = {
  Rename: 'Rename',
  Preview: 'Preview version',
  Restore: 'Restore',
  Delete: 'Delete',
} as const;

export type VersionMenuOptionName =
  (typeof VersionMenuOption)[keyof typeof VersionMenuOption];

/**
 * History tab of the History panel: the saved versions of the file, newest first.
 *
 * Most of its locators and methods still live in HistoryPanelPage and move here
 * progressively.
 */
export class HistoryVersionsTabComponent extends BaseComponent {
  readonly saveVersionButton: Locator;
  readonly versionEntries: Locator;
  readonly previewBanner: Locator;
  readonly restoreDialog: Locator;
  readonly restoreDialogRestoreButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.saveVersionButton = root.getByRole('button', { name: 'Save version' });
    // Each version is a list item holding its milestone and its menu
    this.versionEntries = root
      .getByRole('listitem')
      .filter({ has: page.getByTestId('milestone') });
    // The preview banner and the restore confirmation are notifications rendered outside the sidebar
    this.previewBanner = page
      .getByTestId('actionable')
      .filter({ hasText: 'Previewing version' });
    this.restoreDialog = page
      .getByTestId('actionable')
      .filter({ hasText: 'Do you want to restore this version?' });
    this.restoreDialogRestoreButton = this.restoreDialog.getByRole('button', {
      name: 'Restore',
    });
  }

  /**
   * Returns the list item of a version.
   * @param name Version name exactly as shown; default: the newest version.
   */
  getVersionEntry(name?: string): Locator {
    return name
      ? this.versionEntries.filter({
          has: this.page.getByTestId('milestone').getByText(name, { exact: true }),
        })
      : this.versionEntries.first();
  }

  /** Saves a new version of the file; it is added at the top of the list with its name input open. */
  async clickSaveVersionButton() {
    await this.saveVersionButton.click();
  }

  /**
   * Names the version whose name input is open (e.g. the one just saved) and confirms it with Enter.
   * @param name Name to give the version.
   */
  async renameVersion(name: string) {
    const input = this.versionEntries.getByRole('textbox');
    await input.fill(name);
    await input.press('Enter');
    await this.checkVersionVisible(name);
  }

  /**
   * Saves a new version of the file and names it.
   * @param name Name to give the version.
   */
  async saveVersion(name: string) {
    await this.clickSaveVersionButton();
    await this.renameVersion(name);
  }

  /**
   * Checks that a version is in the list.
   * @param name Version name exactly as shown.
   */
  async checkVersionVisible(name: string) {
    await expect(
      this.getVersionEntry(name),
      `Version "${name}" is in the version list`,
    ).toBeVisible();
  }

  /**
   * Opens the menu of a version with its "Open version menu" button.
   * @param name Version name exactly as shown; default: the newest version.
   */
  async openVersionMenu(name?: string) {
    const entry = this.getVersionEntry(name);
    await entry.hover();
    await entry.getByRole('button', { name: 'Open version menu' }).click();
  }

  /**
   * Returns an option of an open version menu.
   * @param option Option label, e.g. VersionMenuOption.Restore.
   */
  getVersionMenuOption(option: VersionMenuOptionName): Locator {
    return this.versionEntries.getByRole('button', { name: option, exact: true });
  }

  /**
   * Checks that an option shows in the open version menu.
   * @param option Option label, e.g. VersionMenuOption.Restore.
   */
  async checkVersionMenuOptionVisible(option: VersionMenuOptionName) {
    await expect(
      this.getVersionMenuOption(option),
      `Version menu shows the option "${option}"`,
    ).toBeVisible();
  }

  /**
   * Clicks an option of the open version menu.
   * @param option Option label, e.g. VersionMenuOption.Restore.
   */
  async clickVersionMenuOption(option: VersionMenuOptionName) {
    await this.getVersionMenuOption(option).click();
  }

  /**
   * Opens a version's menu and clicks one of its options.
   * @param option Option label, e.g. VersionMenuOption.Restore.
   * @param name Version name exactly as shown; default: the newest version.
   */
  async selectVersionOption(option: VersionMenuOptionName, name?: string) {
    await this.openVersionMenu(name);
    await this.clickVersionMenuOption(option);
  }

  /** Checks that the "Do you want to restore this version?" message shows with its Dismiss and Restore buttons. */
  async checkRestoreDialogVisible() {
    await expect(
      this.restoreDialog,
      'Restore confirmation is visible',
    ).toBeVisible();
    await expect(
      this.restoreDialog.getByRole('button', { name: 'Dismiss' }),
      'Restore confirmation has the "Dismiss" button',
    ).toBeVisible();
    await expect(
      this.restoreDialogRestoreButton,
      'Restore confirmation has the "Restore" button',
    ).toBeVisible();
  }

  /** Clicks Restore in the "Previewing version" banner, which asks for confirmation. */
  async clickPreviewBannerRestoreButton() {
    await this.previewBanner.getByRole('button', { name: 'Restore' }).click();
    await this.checkRestoreDialogVisible();
  }

  /** Clicks Restore in the restore confirmation, which reloads the file to that version. */
  async clickRestoreDialogRestoreButton() {
    await this.restoreDialogRestoreButton.click();
    await expect(this.restoreDialog, 'Restore confirmation is closed').toBeHidden();
  }
}
