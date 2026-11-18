import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';

/** Options of the "Copy/Paste as ..." submenu that copy the selection. */
export type CopyAsOption =
  'Copy as CSS' | 'Copy as CSS (nested layers)' | 'Copy as SVG' | 'Copy as text';

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
   * An item with a submenu contains the submenu's items, so only its own label is matched.
   * @param name Item label exactly as shown, e.g. 'Bring forward'.
   */
  getItem(name: string): Locator {
    const exactName = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
    return this.root
      .getByRole('listitem')
      .filter({ has: this.page.locator(':scope > span', { hasText: exactName }) });
  }

  /**
   * Clicks a menu item; the menu closes afterwards.
   * @param name Item label exactly as shown, e.g. 'Send to back'.
   */
  async clickItem(name: string) {
    await this.getItem(name).click();
  }

  /**
   * Hovers a menu item to open its submenu.
   * @param name Item label exactly as shown, e.g. 'Copy/Paste as ...'.
   */
  async hoverItem(name: string) {
    await this.getItem(name).hover();
  }

  /**
   * Copies the selection with an option of the "Copy/Paste as ..." submenu.
   * @param option Submenu option, e.g. 'Copy as CSS'.
   */
  async copyAs(option: CopyAsOption) {
    await this.hoverItem('Copy/Paste as ...');
    await this.clickItem(option);
  }
}
