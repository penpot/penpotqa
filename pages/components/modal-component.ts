import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Penpot's modal portal, where every modal renders, outside every region. Only
 * one modal is open at a time, so this checks what they all share, their title
 * and "Close" button, and each modal's own component checks its content,
 * rooted on this `root`.
 */
export class ModalComponent extends BaseComponent {
  readonly closeButton: Locator;
  readonly heading: Locator;

  /** @param page - The page the modal opens on. */
  constructor(page: Page) {
    super(page, page.locator('#portal-container-modal'));
    this.closeButton = this.root.getByRole('button', { name: 'Close' });
    this.heading = this.root.getByRole('heading');
  }

  /** Closes the open modal with its "Close" button, without confirming it. */
  async close() {
    await this.closeButton.click();
    await expect(this.heading, 'The modal is closed').toBeHidden();
  }

  /**
   * Checks the open modal's title.
   *
   * @param title - The title, e.g. 'Add team to an organization'.
   */
  async checkTitle(title: string) {
    await expect(this.heading, `The modal is titled "${title}"`).toHaveText(title);
  }
}
