import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Actions tab of the History panel: the undo stack of the session, newest first.
 * Clicking an entry undoes or redoes the changes up to it.
 */
export class HistoryActionsTabComponent extends BaseComponent {
  readonly entries: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    // Entries are plain divs, with no role or test id
    this.entries = root.getByRole('list').locator('> div');
  }

  /**
   * Returns an entry of the list by its title.
   * @param title Entry title exactly as shown, e.g. 'New board'.
   * @param index Which entry with that title, newest first; default: 0.
   */
  getEntry(title: string, index = 0): Locator {
    return this.entries
      .filter({ has: this.page.getByText(title, { exact: true }) })
      .nth(index);
  }

  /**
   * Clicks an entry, which moves the file back or forward to the state after that change.
   * @param title Entry title exactly as shown, e.g. 'New board'.
   * @param index Which entry with that title, newest first; default: 0.
   */
  async clickEntry(title: string, index = 0) {
    await this.getEntry(title, index).getByText(title, { exact: true }).click();
  }

  /**
   * Checks that the list has exactly these entries, visible in this order.
   * @param titles Expected titles, newest first.
   */
  async checkEntriesAreVisible(titles: string[]) {
    await expect(
      this.entries,
      `History actions are ${titles.join(', ')}`,
    ).toHaveCount(titles.length);
    for (const [index, title] of titles.entries()) {
      await expect(
        this.entries.nth(index).getByText(title, { exact: true }),
        `History action ${index + 1} is "${title}"`,
      ).toBeVisible();
    }
  }

  /**
   * Checks which entry is the current state (only shown by a `current` class).
   * @param title Entry title exactly as shown.
   * @param index Which entry with that title, newest first; default: 0.
   */
  async checkCurrentEntry(title: string, index = 0) {
    await expect(
      this.getEntry(title, index),
      `History action "${title}" is the current state`,
    ).toHaveClass(/current/);
  }
}
