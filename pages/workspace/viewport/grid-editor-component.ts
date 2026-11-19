import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Grid editor drawn on the canvas in grid edit mode: one outline per cell, numbered
 * by rows from the top-left (a 2x2 grid has cells 1 and 2 on top, 3 and 4 below).
 * Most grid actions still live in MainPage and move here progressively.
 */
export class GridEditorComponent extends BaseComponent {
  readonly cells: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.cells = root.locator('rect[class*="grid-cell-outline"]');
  }

  /**
   * Returns the outline of a cell.
   * @param index Cell number, from 1, by rows.
   */
  getCell(index: number): Locator {
    return this.cells.nth(index - 1);
  }

  /**
   * Selects a cell with a click.
   * @param index Cell number, from 1, by rows.
   */
  async clickCell(index: number) {
    // The outlines sit under the canvas controls, so the click is forced
    await this.getCell(index).click({ force: true });
  }

  /**
   * Selects a range of cells: clicks the first one and Shift+clicks the last one.
   * @param first First cell number, e.g. 1.
   * @param last Last cell number, e.g. 2 for the first row of a 2x2 grid.
   */
  async selectCells(first: number, last: number) {
    await this.clickCell(first);
    await this.getCell(last).click({ modifiers: ['Shift'], force: true });
  }

  /**
   * Opens the context menu of a cell with a right-click.
   * @param index Cell number, from 1, by rows.
   */
  async openCellContextMenu(index: number) {
    await this.getCell(index).click({ button: 'right', force: true });
  }

  /**
   * Checks the number of columns and rows, from the cells' distinct horizontal and
   * vertical positions on the canvas.
   * @param columns Expected number of columns.
   * @param rows Expected number of rows.
   */
  async checkGridSize(columns: number, rows: number) {
    await expect
      .poll(
        () =>
          this.cells.evaluateAll((rects) => {
            const xs = new Set<number>();
            const ys = new Set<number>();
            for (const rect of rects as SVGRectElement[]) {
              xs.add(Math.round(rect.x.baseVal.value));
              ys.add(Math.round(rect.y.baseVal.value));
            }
            return { columns: xs.size, rows: ys.size };
          }),
        { message: `Grid has ${columns} column(s) and ${rows} row(s)` },
      )
      .toEqual({ columns, rows });
  }
}
