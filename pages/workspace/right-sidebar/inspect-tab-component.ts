import { BaseComponent } from '@pages/base-component';
import {
  ExportSectionComponent,
  getExportSectionRoot,
} from '@pages/components/export-section-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** Inspect content of the right sidebar: what viewers get instead of the Design tab. */
export class InspectTabComponent extends BaseComponent {
  readonly colorSpaceSelect: Locator;
  readonly inspectTabSelect: Locator;
  readonly stylesRegion: Locator;
  readonly layoutRows: Locator;
  readonly export: ExportSectionComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.colorSpaceSelect = root.getByRole('combobox', {
      name: 'Select color space',
    });
    this.inspectTabSelect = root.getByRole('combobox', {
      name: 'Switch inspect tab',
    });
    this.stylesRegion = root.getByRole('region', { name: 'Styles' });
    // Only this container groups a Layout property's label with its value (no role or test id)
    this.layoutRows = root.locator('div[class*="layout-row"]');
    this.export = new ExportSectionComponent(page, getExportSectionRoot(root));
  }

  /** The panel of the Styles view whose header reads `title`, e.g. "Size and position". */
  stylesPanel(title: string): Locator {
    return this.stylesRegion.getByRole('article').filter({
      has: this.page.getByRole('button', { name: `Toggle panel ${title}` }),
    });
  }

  async checkLayerInfo(layerName: string, layerType: string) {
    await expect(
      this.root.getByText(layerName, { exact: true }),
      `Inspect shows the selected layer's name "${layerName}"`,
    ).toBeVisible();
    await expect(
      this.root.getByText(layerType, { exact: true }),
      `Inspect shows the selected layer's type "${layerType}"`,
    ).toBeVisible();
  }

  async checkSelectedViews(colorSpace: string, inspectTab: string) {
    await expect(
      this.colorSpaceSelect,
      `Color space dropdown shows "${colorSpace}"`,
    ).toHaveText(colorSpace);
    await expect(
      this.inspectTabSelect,
      `Inspect view dropdown shows "${inspectTab}"`,
    ).toHaveText(inspectTab);
  }

  async checkSizeAndPosition({ width, height }: { width: string; height: string }) {
    const panel = this.stylesPanel('Size and position');
    await expect(
      panel.getByRole('term'),
      'Size and position panel lists the Width and Height fields',
    ).toHaveText(['Width', 'Height']);
    await expect(
      panel.getByRole('definition'),
      `Size and position shows width ${width} and height ${height}`,
    ).toHaveText([width, height]);
  }

  /** Nothing in the sidebar can be typed into: values are shown, not edited. */
  async checkReadOnly() {
    await expect(
      this.root.getByRole('textbox'),
      'Inspect has no editable fields (read-only for viewers)',
    ).toHaveCount(0);
  }

  /**
   * Checks a property of the Layout block in Inspect › Computed.
   * @param label Property name as shown in the row (e.g. 'Row gap').
   * @param value Expected value (e.g. '50px').
   */
  async checkLayoutProperty(label: string, value: string) {
    const valueButton = this.layoutRows
      .filter({ has: this.page.getByTitle(label, { exact: true }) })
      .getByRole('button', { name: 'Copy' });
    await expect(
      valueButton,
      `Inspect layout "${label}" should be ${value}`,
    ).toHaveText(value);
  }
}
