import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** A scrollable list of the left sidebar. `container` is the element that scrolls. */
export class ScrollableListComponent extends BaseComponent {
  readonly container: Locator;

  constructor(page: Page, container: Locator) {
    super(page);
    this.container = container;
  }

  /** Layer tree of the Layers tab, also used for the layer search results
   * (the hidden tree stays in the DOM while searching). */
  static layerTree(page: Page) {
    return new ScrollableListComponent(
      page,
      page
        .getByTestId('layer-tree')
        .locator('[class*="tool-window-content"]')
        .filter({ visible: true }),
    );
  }

  /** The whole Assets tab scrolls, not each group. */
  static assets(page: Page) {
    return new ScrollableListComponent(
      page,
      page.getByTestId('left-sidebar').locator('[class*="assets-bar"]'),
    );
  }

  static tokens(page: Page) {
    return new ScrollableListComponent(page, page.getByTestId('tokens-sidebar'));
  }

  /** @returns the scroll position reached */
  async scrollToMiddle(): Promise<number> {
    await this.container.evaluate((el) =>
      el.scrollTo({ top: (el.scrollHeight - el.clientHeight) / 2 }),
    );
    await expect
      .poll(() => this.getScrollTop(), { message: 'List should be scrolled down' })
      .toBeGreaterThan(0);
    return this.getScrollTop();
  }

  async getScrollTop(): Promise<number> {
    return this.container.evaluate((el) => el.scrollTop);
  }

  async checkScrollTop(top: number) {
    await expect
      .poll(() => this.getScrollTop(), {
        message: `List should keep its scroll position (${top})`,
      })
      .toBe(top);
  }

  async checkScrolledToTop() {
    await expect
      .poll(() => this.getScrollTop(), {
        message: 'List should be shown from the top',
      })
      .toBe(0);
  }
}
