import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';
import {
  ExportSectionComponent,
  getExportSectionRoot,
} from '@pages/components/export-section-component';
import { BooleanSectionComponent } from '@pages/workspace/right-sidebar/design-tab/boolean-section-component';
import { MeasuresSectionComponent } from '@pages/workspace/right-sidebar/design-tab/measures-section-component';
import { FillSectionComponent } from '@pages/workspace/right-sidebar/design-tab/fill-section-component';
import { BlurSectionComponent } from '@pages/workspace/right-sidebar/design-tab/blur-section-component';
import { GridCellSectionComponent } from '@pages/workspace/right-sidebar/design-tab/grid-cell-section-component';
import { LayoutContainerSectionComponent } from '@pages/workspace/right-sidebar/design-tab/layout-container-section-component';
import { LayoutItemSectionComponent } from '@pages/workspace/right-sidebar/design-tab/layout-item-section-component';
import { RadiusSectionComponent } from '@pages/workspace/right-sidebar/design-tab/radius-section-component';
import { StrokeSectionComponent } from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';

export class DesignTabComponent extends BaseComponent {
  readonly boolean: BooleanSectionComponent;
  readonly measures: MeasuresSectionComponent;
  readonly radius: RadiusSectionComponent;
  readonly fill: FillSectionComponent;
  readonly stroke: StrokeSectionComponent;
  readonly blur: BlurSectionComponent;
  readonly layoutContainer: LayoutContainerSectionComponent;
  readonly layoutItem: LayoutItemSectionComponent;
  readonly gridCell: GridCellSectionComponent;
  readonly export: ExportSectionComponent;
  readonly gridLocateButton: Locator;
  readonly gridEditExitButton: Locator;
  readonly gridTrackTitles: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    // The boolean buttons have no region or accessible name
    this.boolean = new BooleanSectionComponent(
      page,
      root.locator('[class*="bool__boolean-options"]'),
    );
    this.measures = new MeasuresSectionComponent(
      page,
      root.getByRole('region', { name: 'shape-measures-section' }),
    );
    this.radius = new RadiusSectionComponent(
      page,
      root.getByRole('region', { name: 'Border radius section' }),
    );
    this.fill = new FillSectionComponent(
      page,
      root.getByRole('region', { name: 'Fill section' }),
    );
    this.stroke = new StrokeSectionComponent(
      page,
      root.getByRole('region', { name: 'Stroke' }),
    );
    this.blur = new BlurSectionComponent(
      page,
      root.getByRole('region', { name: 'Blur effects', exact: true }),
    );
    this.layoutContainer = new LayoutContainerSectionComponent(
      page,
      root.getByRole('region', { name: 'Layout container section' }),
    );
    this.layoutItem = new LayoutItemSectionComponent(
      page,
      root.getByRole('region', { name: 'Layout item section' }),
    );
    this.gridCell = new GridCellSectionComponent(
      page,
      root
        .locator('div')
        .filter({
          has: page.getByRole('button', { name: 'Grid cell', exact: true }),
        })
        .filter({ has: page.getByRole('button', { name: 'Edit grid' }) })
        .last(),
    );
    // In grid edit mode the Grid layout panel replaces the Layout section and has no accessible root
    this.gridLocateButton = root.getByRole('button', { name: 'Locate grid layout' });
    this.gridEditExitButton = root.getByRole('button', { name: 'Exit' });
    // Only this container groups a track's name with its values (no role or test id)
    this.gridTrackTitles = root.locator('div[class*="track-title"]');
    this.export = new ExportSectionComponent(page, getExportSectionRoot(root));
  }

  /** Centers the viewport on the board being edited, with the Locate button of the Grid layout panel (grid edit mode). */
  async clickGridLocate() {
    await this.gridLocateButton.click();
  }

  /**
   * Checks the Grid layout panel in grid edit mode: the Exit button and the column and
   * row tracks with their values.
   * @param columns Expected column track values (e.g. ['1fr', '1fr']).
   * @param rows Expected row track values (e.g. ['1fr', '1fr']).
   */
  async checkGridEditModePanel(columns: string[], rows: string[]) {
    await expect(
      this.gridEditExitButton,
      'Grid edit mode Exit button',
    ).toBeVisible();
    for (const [name, values] of [
      [`Columns ${columns.length}`, columns],
      [`Rows ${rows.length}`, rows],
    ] as const) {
      const track = this.gridTrackTitles.filter({
        has: this.page.getByTitle(name, { exact: true }),
      });
      await expect(
        track.getByTitle(values.join(', '), { exact: true }),
        `Grid track "${name}" should be ${values.join(', ')}`,
      ).toBeVisible();
    }
  }

  /**
   * Returns a number input of the Design tab by its accessible name.
   * @param name Input name, e.g. 'Width', 'X axis', 'Rotation', 'Opacity'.
   */
  getNumberInput(name: string): Locator {
    return this.root.getByRole('textbox', { name, exact: true });
  }

  /**
   * Returns the icon in front of a number input (e.g. the "W" of Width), used to drag the value.
   * @param name Input name, e.g. 'Width'.
   */
  getNumberInputIcon(name: string): Locator {
    // The icon is a sibling of the input's tooltip wrapper, with no role or name
    return this.getNumberInput(name).locator('xpath=../..').locator('> svg');
  }

  /**
   * Changes a number input by dragging its icon horizontally.
   * @param name Input name, e.g. 'Width'.
   * @param dx Pixels to drag: positive to the right (increase), negative to the left.
   * @param modifier Key held while dragging: Shift (10x faster) or Control (0.1x finer).
   */
  async dragNumberInput(name: string, dx: number, modifier?: 'Shift' | 'Control') {
    const box = await this.getNumberInputIcon(name).boundingBox();
    if (!box) throw new Error(`The ${name} input icon is not visible`);
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    if (modifier) await this.page.keyboard.down(modifier);
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + dx, y, { steps: 10 });
    await this.page.mouse.up();
    if (modifier) await this.page.keyboard.up(modifier);
  }

  /**
   * Checks the value of a number input.
   * @param name Input name, e.g. 'Width'.
   * @param value Expected value, e.g. 120.
   */
  async checkNumberInputValue(name: string, value: number) {
    await expect(this.getNumberInput(name), `${name} is ${value}`).toHaveValue(
      String(value),
    );
  }

  /**
   * Checks that a number input's icon shows the horizontal resize cursor (it can be dragged).
   * @param name Input name, e.g. 'Width'.
   */
  async checkNumberInputDragCursor(name: string) {
    await this.getNumberInputIcon(name).hover();
    await expect(
      this.getNumberInputIcon(name),
      `${name} icon shows the drag cursor`,
    ).toHaveCSS('cursor', 'ew-resize');
  }

  /**
   * Clicks a number input without dragging and checks it gets focus for typing.
   * @param name Input name, e.g. 'Width'.
   */
  async checkNumberInputFocusedOnClick(name: string) {
    await this.getNumberInput(name).click();
    await expect(this.getNumberInput(name), `${name} is focused`).toBeFocused();
  }
}
