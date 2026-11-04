import { BaseComponent } from '@pages/base-component';
import { ExportModalComponent } from '@pages/components/export-modal-component';
import {
  expect,
  type Download,
  type Locator,
  type Page,
  type Request,
} from '@playwright/test';

/** Options of the format select in the Export section. */
export const ExportFormat = {
  PNG: 'PNG',
  JPG: 'JPG',
  WEBP: 'WEBP',
  SVG: 'SVG',
  PDF: 'PDF',
} as const;

export type ExportFormatName = (typeof ExportFormat)[keyof typeof ExportFormat];

/** A finished export: the downloaded file and the backend exporter calls it made. */
export type ExportResult = {
  download: Download;
  /** Paths of the requests to the backend exporter (`/api/export…`). */
  exporterRequests: string[];
};

const EXPORTER_PATH = /\/api\/export/;

// Not scoped: `filter({ has })` matches them inside each candidate, and the
// component scopes them with `root.locator()`
const getAddExportButton = (page: Page) =>
  page.getByRole('button', { name: 'Add export' });
const getRemoveExportButton = (page: Page) =>
  page.getByRole('button', { name: 'Remove export' });

/**
 * Root of the Export section inside its parent's `root`. It has no role or
 * label, so it is matched by class; the filter skips its inner
 * `element-set-content`.
 */
export function getExportSectionRoot(root: Locator): Locator {
  return root
    .locator('[class*="exports__element-set"]')
    .filter({ has: getAddExportButton(root.page()) });
}

/**
 * The Export section, shown in the workspace Design and Inspect tabs and in
 * view mode's Inspect tab. It works the same for every format; what each
 * format produces is checked on the downloaded file (e.g. ExportedSvgPage).
 */
export class ExportSectionComponent extends BaseComponent {
  readonly addExportButton: Locator;
  readonly removeExportButton: Locator;
  /** "Export N element(s)" button under the export rows. */
  readonly exportElementButton: Locator;
  readonly exportFormatSelect: Locator;
  readonly exportScaleSelect: Locator;
  readonly exportSuffixInput: Locator;
  /** Single row shown for several elements whose exports differ. */
  readonly exportMixedRow: Locator;
  readonly exportMixedRowRemoveButton: Locator;
  /** "Export selection" dialog opened for several elements. */
  readonly exportModal: ExportModalComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);

    this.addExportButton = root.locator(getAddExportButton(page));
    this.removeExportButton = root.locator(getRemoveExportButton(page));
    this.exportElementButton = root.getByRole('button', {
      name: /Export \d+ element/,
    });
    this.exportFormatSelect = root.getByRole('combobox').filter({
      hasText: new RegExp(`^(${Object.values(ExportFormat).join('|')})$`),
    });
    this.exportScaleSelect = root
      .getByRole('combobox')
      .filter({ hasText: /^\d+(\.\d+)?x$/ });
    this.exportSuffixInput = root.getByPlaceholder('Suffix');
    this.exportMixedRow = root
      .getByText('Mixed', { exact: true })
      .locator('..')
      .filter({ has: getRemoveExportButton(page) });
    this.exportMixedRowRemoveButton = this.exportMixedRow.locator(
      getRemoveExportButton(page),
    );
    this.exportModal = new ExportModalComponent(page);
  }

  async clickAddExportButton() {
    await this.addExportButton.click();
  }

  async clickRemoveExportButton() {
    await this.removeExportButton.click();
  }

  /** Adds an export row to the selection and sets its format. */
  async addExportWithFormat(format: ExportFormatName) {
    // The Design tab lags a selection change, so retry until a single PNG row
    // shows.
    await expect(async () => {
      // A click on part of the selection leaves a "Mixed" row: clear it first
      if (await this.exportMixedRow.isVisible()) {
        await this.exportMixedRowRemoveButton.click({ timeout: 2000 });
      }
      // A click from a previous try may add its row late: don't add a second one
      if ((await this.exportFormatSelect.count()) === 0) {
        await this.addExportButton.click();
      }
      await expect(
        this.exportFormatSelect,
        'A new PNG export row is added',
      ).toHaveText(ExportFormat.PNG, { timeout: 2000 });
    }).toPass({ timeout: 15000 });
    await this.selectExportFormat(format);
  }

  async selectExportFormat(format: ExportFormatName) {
    await this.exportFormatSelect.click();
    await this.page.getByRole('option', { name: format, exact: true }).click();
    await expect(this.exportFormatSelect, `Export format is ${format}`).toHaveText(
      format,
    );
    // The select label updates before the shape does. The scale select is
    // rendered from the shape, and only for raster formats, so its removal
    // confirms the change for SVG/PDF (exporting earlier downloads a PNG).
    if (format === ExportFormat.SVG || format === ExportFormat.PDF) {
      await expect(
        this.exportScaleSelect,
        `Scale is not available for ${format} exports`,
      ).toBeHidden();
    }
  }

  async fillExportSuffix(suffix: string) {
    await this.exportSuffixInput.fill(suffix);
    await this.exportSuffixInput.press('Enter');
    await this.checkExportSuffix(suffix);
  }

  /**
   * Clicks "Export 1 element" and waits for the file. A failed export produces
   * no download, so this also fails on export errors.
   */
  async exportElement(): Promise<ExportResult> {
    return this.trackExport(() => this.exportElementButton.click());
  }

  /** Clicks "Export N elements" and confirms the "Export selection" dialog. */
  async exportElementsFromDialog(count: number): Promise<ExportResult> {
    // The button label follows the selection a moment after it changes
    const label = `Export ${count} element${count === 1 ? '' : 's'}`;
    await expect(this.exportElementButton, `Button says "${label}"`).toHaveText(
      new RegExp(`^${label}$`, 'i'),
    );
    return this.trackExport(async () => {
      await this.exportElementButton.click();
      await this.exportModal.exportSelection();
    });
  }

  private async trackExport(
    startExport: () => Promise<void>,
  ): Promise<ExportResult> {
    const exporterRequests: string[] = [];
    const onRequest = (request: Request) => {
      const { pathname } = new URL(request.url());
      if (EXPORTER_PATH.test(pathname)) exporterRequests.push(pathname);
    };
    this.page.on('request', onRequest);
    try {
      const [download] = await Promise.all([
        this.page.waitForEvent('download'),
        startExport(),
      ]);
      // The exporter is called before the file is ready, so all its requests
      // have been made by now
      return { download, exporterRequests };
    } finally {
      this.page.off('request', onRequest);
    }
  }

  async checkExportRow(format: ExportFormatName = ExportFormat.PNG, scale = '1x') {
    await expect(this.exportFormatSelect, `Export format is ${format}`).toHaveText(
      format,
    );
    await expect(this.exportScaleSelect, `Export scale is ${scale}`).toHaveText(
      scale,
    );
    await this.checkExportSuffix('');
  }

  async checkExportSuffix(suffix: string) {
    await expect(
      this.exportSuffixInput,
      suffix ? `Export suffix is "${suffix}"` : 'Export suffix is empty',
    ).toHaveValue(suffix);
  }

  async checkExportElementButton(title: string) {
    await expect(this.exportElementButton, `Button says "${title}"`).toHaveText(
      title,
    );
  }

  async checkIsVisible() {
    await expect(
      this.root.getByText('Export', { exact: true }),
      'Export section is shown',
    ).toBeVisible();
    await expect(
      this.addExportButton,
      'Export section has the "Add export" button',
    ).toBeVisible();
  }

  async checkExportElementButtonIsHidden() {
    await expect(
      this.exportElementButton,
      'No "Export N elements" button is shown',
    ).not.toBeVisible();
  }

  checkDownloadedFileName(download: Download, fileName: string) {
    expect(download.suggestedFilename(), 'Downloaded file name').toBe(fileName);
  }

  /** The file was generated in the browser (WebGL renderer), not by the backend. */
  checkExportedInBrowser({ exporterRequests }: ExportResult) {
    expect(
      exporterRequests,
      'No request to the backend exporter (/api/export…) is made',
    ).toEqual([]);
  }

  /** The backend exporter generated the file, through `/api/export/jobs` when given. */
  checkExportedByBackend(
    { exporterRequests }: ExportResult,
    endpoint: '/api/export' | '/api/export/jobs' = '/api/export',
  ) {
    expect(
      exporterRequests.some((path) => path.startsWith(endpoint)),
      `A request to the backend exporter (${endpoint}) is made; got [${exporterRequests}]`,
    ).toBe(true);
  }
}
