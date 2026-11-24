import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** A point of the canvas, relative to its top-left corner. */
export type CanvasPoint = { x: number; y: number };

/**
 * The canvas; coordinates are relative to its top-left corner, in screen pixels (at the
 * default 100% zoom they match the design coordinates). Most canvas actions still live
 * in MainPage and move here progressively.
 */
export class ViewportComponent extends BaseComponent {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  /**
   * Converts a point of the canvas to page coordinates.
   * @param x Horizontal offset from the canvas' left edge.
   * @param y Vertical offset from the canvas' top edge.
   * @returns The point in page coordinates.
   */
  private async toPagePoint(x: number, y: number) {
    const box = await this.root.boundingBox();
    if (!box) throw new Error('Viewport is not visible');
    return { x: box.x + x, y: box.y + y };
  }

  /**
   * Opens the shape context menu with a right-click on a point of the canvas.
   * @param x Horizontal offset from the canvas' left edge.
   * @param y Vertical offset from the canvas' top edge.
   */
  async openContextMenuAt(x: number, y: number) {
    const point = await this.hover({ x, y });
    await this.page.mouse.click(point.x, point.y, { button: 'right' });
  }

  /**
   * Drags the shape under a point of the canvas to another point.
   * @param from Point on the shape, relative to the canvas.
   * @param to Point to drop it at, relative to the canvas.
   */
  async dragShape(from: CanvasPoint, to: CanvasPoint) {
    await this.hover(from);
    await this.page.mouse.down();
    const end = await this.toPagePoint(to.x, to.y);
    await this.page.mouse.move(end.x, end.y, { steps: 10 });
    await this.page.mouse.up();
  }

  /**
   * Zooms the canvas with Ctrl + mouse wheel, with the pointer on the canvas' center.
   * @param direction 'in' scrolls the wheel up, 'out' scrolls it down.
   * @param steps Number of wheel scrolls.
   */
  async zoomWithCtrlWheel(direction: 'in' | 'out', steps = 3) {
    const box = await this.root.boundingBox();
    if (!box) throw new Error('Viewport is not visible');
    await this.hover({ x: box.width / 2, y: box.height / 2 });
    await this.page.keyboard.down('Control');
    for (let i = 0; i < steps; i++) {
      await this.page.mouse.wheel(0, direction === 'in' ? -100 : 100);
    }
    await this.page.keyboard.up('Control');
  }

  /**
   * Moves the pointer across the canvas between two points, e.g. so other users see it.
   * @param from Start point, relative to the canvas.
   * @param to End point, relative to the canvas.
   */
  async movePointer(from: CanvasPoint, to: CanvasPoint) {
    await this.hover(from);
    const end = await this.toPagePoint(to.x, to.y);
    await this.page.mouse.move(end.x, end.y, { steps: 10 });
  }

  /**
   * Checks that another user's pointer, labeled with their name, is shown on the canvas.
   * @param name User name, e.g. 'QA Editor'.
   */
  async checkUserPointerIsVisible(name: string) {
    await expect(
      // Drawn in the viewport's SVG controls, not by the WebGL renderer
      this.root.locator('[class*="multiuser-cursor"]').filter({ hasText: name }),
      `${name}'s pointer is shown on the canvas`,
    ).toBeVisible();
  }

  /**
   * Checks whether a shape name is being edited on the canvas (the inline input over its title).
   * @param editing Expected state; default true.
   */
  async checkShapeNameInputVisible(editing = true) {
    await expect(
      this.root.getByRole('textbox'),
      editing
        ? 'A shape name is being edited on the canvas'
        : 'No shape name is being edited on the canvas',
    ).toHaveCount(editing ? 1 : 0);
  }

  /**
   * Moves the mouse onto a point of the canvas, so the shape under it gets hovered.
   * @param point Point relative to the canvas.
   * @returns The point in page coordinates.
   */
  private async hover({ x, y }: CanvasPoint) {
    const point = await this.toPagePoint(x, y);
    // The renderer finds the shape under the pointer on mouse move, not on click
    await this.page.mouse.move(point.x - 5, point.y - 5);
    await this.page.mouse.move(point.x, point.y, { steps: 5 });
    return point;
  }
}
