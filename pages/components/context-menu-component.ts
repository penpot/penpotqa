import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';

/**
 * Shape context menu, opened with a right-click on a layer or on the canvas.
 * It renders outside the sidebars, so it is rooted on its own test id.
 */
export class ContextMenuComponent extends BaseComponent {
  constructor(page: Page) {
    super(page, page.getByTestId('context-menu'));
  }

  /**
   * Returns a menu item by its label (the shortcut hint next to it is ignored).
   * @param name Item label exactly as shown, e.g. 'Bring forward'.
   */
  getItem(name: string): Locator {
    return this.root
      .getByRole('listitem')
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  /**
   * Clicks a menu item; the menu closes afterwards.
   * @param name Item label exactly as shown, e.g. 'Send to back'.
   */
  async clickItem(name: string) {
    await this.getItem(name).click();
  }
}
