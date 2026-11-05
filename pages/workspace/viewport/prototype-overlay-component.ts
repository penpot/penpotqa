import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** Interaction arrows drawn on the canvas while the Prototype tab is open. */
export class PrototypeOverlayComponent extends BaseComponent {
  /** One curve per interaction of the selected shape. */
  readonly selectedConnectors: Locator;
  /** Arrow handle to drag a new interaction from; drawn while the selection has none. */
  readonly newConnectorHandle: Locator;
  private readonly selectedInteractions: Locator;

  /** `root` is the viewport: drag targets are relative to its top-left corner. */
  constructor(page: Page, root: Locator) {
    super(page, root);
    const selected = root.locator('g.interactions g.selected');
    this.selectedConnectors = selected.locator('path[pointer-events="visible"]');
    this.newConnectorHandle = selected.locator('path').first();
    this.selectedInteractions = selected.locator(':scope > g');
  }

  /** Arrow at the destination end of the selected shape's `index`-th interaction. */
  connectorEnd(index: number): Locator {
    return this.selectedInteractions.nth(index).locator('path').last();
  }

  async dragNewConnectorTo(x: number, y: number) {
    await this.newConnectorHandle.dragTo(this.root, {
      targetPosition: { x, y },
    });
  }

  /** Dropping the end on empty canvas removes the interaction. */
  async dragConnectorEndTo(index: number, x: number, y: number) {
    await this.connectorEnd(index).dragTo(this.root, {
      targetPosition: { x, y },
    });
  }

  async checkSelectedConnectorCount(count: number) {
    await expect(
      this.selectedConnectors,
      `Selected shape has ${count} interaction arrows`,
    ).toHaveCount(count);
  }
}
