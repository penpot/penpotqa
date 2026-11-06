import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** Modes of a grid cell, as the radio buttons of the Grid cell section identify them. */
export const GridCellMode = {
  Auto: 'auto',
  Manual: 'manual',
  Area: 'area',
} as const;

export type GridCellModeName = (typeof GridCellMode)[keyof typeof GridCellMode];

/** Start/end of the row and column of a grid cell, as the Grid cell section shows them. */
export type GridCellPosition = {
  columnStart: string;
  columnEnd: string;
  rowStart: string;
  rowEnd: string;
};

/** Which position input of the Grid cell section (manual and area modes). */
export const GridCellCoordinate = {
  ColumnStart: 0,
  ColumnEnd: 1,
  RowStart: 2,
  RowEnd: 3,
} as const;

export type GridCellCoordinateIndex =
  (typeof GridCellCoordinate)[keyof typeof GridCellCoordinate];

/**
 * The Grid cell section of the Design tab, shown when cells are selected in grid edit mode.
 *
 * The section has no aria-label, so its root is the innermost block of the Design tab that
 * holds the "Grid cell" title button and the "Edit grid" button.
 */
export class GridCellSectionComponent extends BaseComponent {
  readonly areaNameInput: Locator;
  readonly positionInputs: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.areaNameInput = root.getByPlaceholder('Area name');
    this.positionInputs = root.getByPlaceholder('--');
  }

  /**
   * Returns the radio button of a cell mode.
   * @param mode Cell mode, see GridCellMode.
   */
  getModeButton(mode: GridCellModeName): Locator {
    return this.root.getByText(mode, { exact: true });
  }

  /**
   * Changes the mode of the selected cells.
   * @param mode Cell mode, see GridCellMode.
   */
  async selectMode(mode: GridCellModeName) {
    await this.getModeButton(mode).click();
  }

  /** Switches the selected cells to the Area mode (merges them into an area). */
  async clickOnAreaButton() {
    await this.selectMode(GridCellMode.Area);
  }

  /** Switches the selected cell to the Manual mode. */
  async clickOnManualButton() {
    await this.selectMode(GridCellMode.Manual);
  }

  /**
   * Types the name of the area.
   * @param name Area name.
   */
  async enterAreaName(name: string) {
    await this.areaNameInput.fill(name);
  }

  /**
   * Sets one of the row/column start/end inputs (manual and area modes).
   * @param coordinate Input to fill, see GridCellCoordinate.
   * @param value Value to enter.
   */
  async enterGridCellCoordinate(coordinate: GridCellCoordinateIndex, value: string) {
    const input = this.positionInputs.nth(coordinate);
    await input.click();
    await input.fill(value);
    await this.clickOnEnter();
  }

  /**
   * Checks the start and end of the row and the column of the selected cell.
   * @param position Expected values, as the panel shows them.
   */
  async checkCellPosition(position: GridCellPosition) {
    const expected = [
      position.columnStart,
      position.columnEnd,
      position.rowStart,
      position.rowEnd,
    ];
    for (const [index, value] of expected.entries()) {
      await expect(
        this.positionInputs.nth(index),
        `Grid cell ${['column start', 'column end', 'row start', 'row end'][index]} is ${value}`,
      ).toHaveValue(value);
    }
  }

  /**
   * Checks the name of the selected area.
   * @param name Expected area name.
   */
  async checkAreaName(name: string) {
    await expect(this.areaNameInput, `Grid cell area name is "${name}"`).toHaveValue(
      name,
    );
  }
}
