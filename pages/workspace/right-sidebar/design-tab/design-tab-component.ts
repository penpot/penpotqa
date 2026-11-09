import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';
import {
  ExportSectionComponent,
  getExportSectionRoot,
} from '@pages/components/export-section-component';
import { BlurSectionComponent } from '@pages/workspace/right-sidebar/design-tab/blur-section-component';
import { GridCellSectionComponent } from '@pages/workspace/right-sidebar/design-tab/grid-cell-section-component';
import { LayoutContainerSectionComponent } from '@pages/workspace/right-sidebar/design-tab/layout-container-section-component';
import { LayoutItemSectionComponent } from '@pages/workspace/right-sidebar/design-tab/layout-item-section-component';
import { RadiusSectionComponent } from '@pages/workspace/right-sidebar/design-tab/radius-section-component';
import { StrokeSectionComponent } from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';

export class DesignTabComponent extends BaseComponent {
  readonly radius: RadiusSectionComponent;
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
    this.radius = new RadiusSectionComponent(
      page,
      root.getByRole('region', { name: 'Border radius section' }),
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
}
