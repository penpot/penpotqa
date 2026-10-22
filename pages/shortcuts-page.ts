import { type Download, type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

/** Top-level groups of the shortcuts list (each one is a `#<context>-section`). */
export type ShortcutContext = 'workspace' | 'dashboard' | 'viewer';

export type ShortcutsTab = 'All' | 'Custom' | 'Disabled';

/** A shortcut row is identified by its context, its subsection (e.g. "Edit")
 * and its action name — the same action can appear in several subsections. */
export type ShortcutRef = {
  context: ShortcutContext;
  subsection: string;
  action: string;
};

/** Your account > Shortcuts (`?screen=settings-shortcuts`). */
export class ShortcutsPage extends BasePage {
  readonly shortcutsRegion: Locator;
  readonly searchInput: Locator;
  readonly tabPanel: Locator;
  readonly resetAllButton: Locator;
  readonly importExportButton: Locator;
  readonly importMenuItem: Locator;
  readonly exportMenuItem: Locator;

  // "Reset all" and "Import" confirmation modals (plain divs, no dialog role),
  // both listing the affected shortcuts in a table before applying the change.
  readonly resetAllDialog: Locator;
  readonly resetAllConfirmButton: Locator;
  readonly importDialog: Locator;
  readonly importConfirmButton: Locator;

  constructor(page: Page) {
    super(page);

    this.shortcutsRegion = page.getByRole('region', { name: 'Shortcuts page' });
    this.searchInput = this.shortcutsRegion.getByRole('textbox', {
      name: 'Search shortcuts',
    });
    this.tabPanel = this.shortcutsRegion.getByRole('tabpanel');
    this.resetAllButton = this.shortcutsRegion.getByRole('button', {
      name: 'Reset all',
    });
    this.importExportButton = this.shortcutsRegion.getByRole('button', {
      name: 'Import/Export',
    });
    this.importMenuItem = page.getByRole('menuitem', { name: 'Import' });
    this.exportMenuItem = page.getByRole('menuitem', { name: 'Export' });

    this.resetAllDialog = page
      .locator('[class*="__modal-dialog"]')
      .filter({ hasText: 'Reset all shortcuts to default' });
    this.resetAllConfirmButton = this.resetAllDialog.getByRole('button', {
      name: 'Reset',
      exact: true,
    });
    this.importDialog = page
      .locator('[class*="__modal-dialog"]')
      .filter({ hasText: 'Import shortcuts' });
    this.importConfirmButton = this.importDialog.getByRole('button', {
      name: 'Import',
      exact: true,
    });
  }

  /* -------------------------------------------------
   * Locator helpers
   * ------------------------------------------------- */

  private getShortcutRow({ context, subsection, action }: ShortcutRef): Locator {
    return this.page
      .locator(`#${context}-section > li`)
      .filter({
        has: this.page.getByRole('heading', { name: subsection, exact: true }),
      })
      .locator(`li[aria-label="${action}"]`);
  }

  /** The key chips of a row, without the " or " separators between
   * alternative combinations. */
  private getShortcutKeys(shortcut: ShortcutRef): Locator {
    return this.getShortcutRow(shortcut).locator(
      '[class*="shortcuts__keys"] > span:not([class*="__space"])',
    );
  }

  private getTab(tab: ShortcutsTab): Locator {
    return this.shortcutsRegion.getByRole('tab', { name: tab, exact: true });
  }

  /* -------------------------------------------------
   * Actions
   * ------------------------------------------------- */

  async goto() {
    await this.page.goto(`${process.env.BASE_URL}?screen=settings-shortcuts`);
    await expect(this.searchInput, 'Shortcuts page is loaded').toBeVisible();
  }

  async search(text: string) {
    await this.searchInput.fill(text);
  }

  async openTab(tab: ShortcutsTab) {
    await this.getTab(tab).click();
    await expect(this.getTab(tab), `"${tab}" tab is selected`).toHaveAttribute(
      'aria-selected',
      'true',
    );
  }

  /** Searches for the action (so its subsection is expanded) and puts the
   * row in listening mode. */
  async startEditingShortcut(shortcut: ShortcutRef) {
    await this.search(shortcut.action);
    const row = this.getShortcutRow(shortcut);
    await row.getByRole('button', { name: `Edit ${shortcut.action}` }).click();
    await expect(
      row.getByRole('button', { name: 'Save' }),
      `"${shortcut.action}" is in listening mode`,
    ).toBeVisible();
  }

  /** Keys use Playwright's `keyboard.press()` syntax, e.g. "q" or "Shift+Q". */
  async pressShortcutKeys(keys: string) {
    await this.page.keyboard.press(keys);
  }

  async saveShortcut(shortcut: ShortcutRef) {
    const row = this.getShortcutRow(shortcut);
    await row.getByRole('button', { name: 'Save' }).click();
    await expect(
      row.getByRole('button', { name: 'Save' }),
      `"${shortcut.action}" left listening mode`,
    ).toBeHidden();
  }

  async assignShortcut(shortcut: ShortcutRef, keys: string) {
    await this.startEditingShortcut(shortcut);
    await this.pressShortcutKeys(keys);
    await this.saveShortcut(shortcut);
  }

  /** "Disable shortcut" applies straight away and leaves listening mode. */
  async disableShortcut(shortcut: ShortcutRef) {
    await this.startEditingShortcut(shortcut);
    await this.getShortcutRow(shortcut)
      .getByRole('button', { name: 'Disable shortcut' })
      .click();
  }

  async clickResetAll() {
    await this.resetAllButton.click();
    await expect(this.resetAllDialog, '"Reset all" dialog is open').toBeVisible();
  }

  async confirmResetAll() {
    await this.resetAllConfirmButton.click();
    await expect(this.resetAllDialog, '"Reset all" dialog is closed').toBeHidden();
  }

  /** Exports the current shortcuts and returns the downloaded file. */
  async exportShortcuts(): Promise<Download> {
    await this.importExportButton.click();
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.exportMenuItem.click(),
    ]);
    return download;
  }

  /** Picks a shortcuts file to import, which opens the import preview. */
  async importShortcuts(filePath: string) {
    await this.importExportButton.click();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.importMenuItem.click(),
    ]);
    await fileChooser.setFiles(filePath);
    await expect(this.importDialog, 'Import preview dialog is open').toBeVisible();
  }

  async confirmImport() {
    await this.importConfirmButton.click();
    await expect(this.importDialog, 'Import preview dialog is closed').toBeHidden();
  }

  /* -------------------------------------------------
   * Assertions
   * ------------------------------------------------- */

  async isSearchInputFocused() {
    await expect(this.searchInput, 'Search field is focused').toBeFocused();
  }

  /** `keys` are the key chips in order, e.g. ["ctrl", "x"]. */
  async hasShortcutKeys(shortcut: ShortcutRef, keys: string[]) {
    await expect(
      this.getShortcutKeys(shortcut),
      `"${shortcut.action}" is bound to ${keys.join(' ')}`,
    ).toHaveText(keys);
  }

  /** Disabled, or left without keys after its combination moved elsewhere. */
  async hasNoShortcutKeys(shortcut: ShortcutRef) {
    await expect(
      this.getShortcutRow(shortcut),
      `"${shortcut.action}" is listed`,
    ).toBeVisible();
    await expect(
      this.getShortcutKeys(shortcut),
      `"${shortcut.action}" has no key combination`,
    ).toHaveCount(0);
  }

  async isShortcutListed(shortcut: ShortcutRef, listed = true) {
    const row = this.getShortcutRow(shortcut);
    listed
      ? await expect(row, `"${shortcut.action}" is listed`).toBeVisible()
      : await expect(row, `"${shortcut.action}" is not listed`).toHaveCount(0);
  }

  /** Every listed shortcut's action name contains `text` (case-insensitive). */
  async areAllListedShortcutsMatching(text: string) {
    const rows = this.tabPanel.locator('li[aria-label]');
    await expect(
      rows.first(),
      `Shortcuts matching "${text}" are listed`,
    ).toBeVisible();
    for (const action of await rows.evaluateAll((items) =>
      items.map((item) => item.getAttribute('aria-label') ?? ''),
    )) {
      expect(action.toLowerCase(), `"${action}" matches "${text}"`).toContain(
        text.toLowerCase(),
      );
    }
  }

  /** The inline message shown in listening mode for the pressed keys. */
  async isListeningMessageShown(shortcut: ShortcutRef, message: string) {
    await expect(
      this.getShortcutRow(shortcut).getByRole('alert'),
      `"${shortcut.action}" shows "${message}"`,
    ).toHaveText(message);
  }

  async isShortcutAvailableMessageShown(shortcut: ShortcutRef) {
    await this.isListeningMessageShown(shortcut, 'Shortcut available.');
  }

  async isConflictMessageShown(shortcut: ShortcutRef, conflictingAction: string) {
    await this.isListeningMessageShown(
      shortcut,
      `Already assigned to "${conflictingAction}". Saving will move it to this action.`,
    );
  }

  /** The current tab lists no shortcuts at all. */
  async isTabEmpty() {
    await expect(
      this.tabPanel.locator('li[aria-label]'),
      'No shortcuts are listed in this tab',
    ).toHaveCount(0);
  }

  /** A row of the "Reset all" or "Import" dialog's table, matched by its
   * cells (e.g. ["Cut", "q", "ctrl x"]). */
  async isDialogRowShown(dialog: Locator, cells: string[]) {
    await expect(
      dialog.getByRole('row', { name: cells.join(' '), exact: true }),
      `Dialog lists ${cells.join(' | ')}`,
    ).toBeVisible();
  }
}
