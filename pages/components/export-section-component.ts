import { BaseComponent } from '@pages/base-component';
import { imageSize } from 'image-size';
import { ExportModalComponent } from '@pages/components/export-modal-component';
import {
  expect,
  type Download,
  type Locator,
  type Page,
  type Request,
} from '@playwright/test';
import AdmZip from 'adm-zip';

/** Options of the format select in the Export section. */
export const ExportFormat = {
  PNG: 'PNG',
  JPG: 'JPG',
  WEBP: 'WEBP',
  SVG: 'SVG',
  PDF: 'PDF',
} as const;

export type ExportFormatName = (typeof ExportFormat)[keyof typeof ExportFormat];

/** Settings of one export row; the ones left out are not changed. */
export type ExportRowSettings = {
  format?: ExportFormatName;
  /** Scale option as shown, e.g. '0.5x'. */
  scale?: string;
  suffix?: string;
};

/** A file expected in an export: its name and, for images, its pixel size. */
export type ExpectedExportedFile = {
  name: string;
  width?: number;
  height?: number;
};

/** A finished export: the downloaded file and the backend exporter calls it made. */
export type ExportResult = {
  download: Download;
  /** Paths of the requests to the backend exporter (`/api/export…`). */
  exporterRequests: string[];
};

const EXPORTER_PATH = /\/api\/export/;
// Scale options read like '0.5x' or '3x'
const SCALE_OPTION = /^\d+(\.\d+)?x$/;

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
      .filter({ hasText: SCALE_OPTION });
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

  /**
   * Clicks "Export N elements" to open the "Export selection" dialog, without
   * confirming it.
   * @param count Number of selected elements, as the button label says.
   */
  async openExportSelectionDialog(count: number) {
    const label = `Export ${count} element${count === 1 ? '' : 's'}`;
    await expect(this.exportElementButton, `Button says "${label}"`).toHaveText(
      new RegExp(`^${label}$`, 'i'),
    );
    await this.exportElementButton.click();
  }

  /** Clicks "Export" in the open "Export selection" dialog and waits for the file. */
  async exportFromOpenDialog(): Promise<ExportResult> {
    return this.trackExport(() => this.exportModal.exportSelection());
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

  /**
   * Checks how many export rows the Export section has.
   * @param count Expected number of rows.
   */
  async checkExportRowCount(count: number) {
    await expect(
      this.root
        .locator('[class*="exports__element-group"]')
        .filter({ has: getRemoveExportButton(this.page) }),
      `Export section has ${count} export row(s)`,
    ).toHaveCount(count);
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

  /**
   * The ZIP download holds exactly one entry per file name given, in any
   * order.
   * @param download the ZIP file download to inspect
   * @param fileNames entry names the ZIP must contain
   */
  async checkZipFileNames(download: Download, fileNames: string[]) {
    const names = new AdmZip(await download.path())
      .getEntries()
      .map((entry) => entry.entryName)
      .sort();
    expect(names, 'ZIP holds one entry per exported element').toEqual(
      [...fileNames].sort(),
    );
  }

  /** The file was generated in the browser (WebGL renderer), not by the backend. */
  checkExportedInBrowser({ exporterRequests }: ExportResult) {
    expect(
      exporterRequests,
      'No request to the backend exporter (/api/export…) is made',
    ).toEqual([]);
  }

  /** The backend exporter generated the file, through `/api/export`. */
  checkExportedByBackend({ exporterRequests }: ExportResult) {
    expect(
      exporterRequests.some((path) => path.startsWith('/api/export')),
      `A request to the backend exporter (/api/export) is made; got [${exporterRequests}]`,
    ).toBe(true);
  }

  /**
   * Returns an export row (no role or label, so found by class).
   * @param index Position of the row, from 0.
   */
  getExportRow(index: number): Locator {
    return this.root
      .locator('[class*="exports__element-group"]')
      .filter({ has: getRemoveExportButton(this.page) })
      .nth(index);
  }

  /**
   * Sets the format, scale and/or suffix of one row (the single-row methods match every row).
   * @param index Position of the row, from 0.
   * @param settings Values to set; the ones left out are not changed.
   */
  async setExportRow(index: number, { format, scale, suffix }: ExportRowSettings) {
    const row = this.getExportRow(index);
    if (format) {
      const formatSelect = row.getByRole('combobox').first();
      await formatSelect.click();
      await this.page.getByRole('option', { name: format, exact: true }).click();
      await expect(
        formatSelect,
        `Export ${index + 1} format is ${format}`,
      ).toHaveText(format);
    }
    if (scale) {
      const scaleSelect = row
        .getByRole('combobox')
        .filter({ hasText: SCALE_OPTION });
      await scaleSelect.click();
      await this.page.getByRole('option', { name: scale, exact: true }).click();
      await expect(scaleSelect, `Export ${index + 1} scale is ${scale}`).toHaveText(
        scale,
      );
    }
    if (suffix !== undefined) {
      const suffixInput = row.getByPlaceholder('Suffix');
      await suffixInput.fill(suffix);
      await suffixInput.press('Enter');
      await expect(
        suffixInput,
        `Export ${index + 1} suffix is "${suffix}"`,
      ).toHaveValue(suffix);
    }
  }

  /**
   * Checks the scale and/or suffix of one export row.
   * @param index Position of the row, from 0.
   * @param settings Expected values; the ones left out are not checked.
   */
  async checkExportRowSettings(
    index: number,
    { scale, suffix }: Pick<ExportRowSettings, 'scale' | 'suffix'>,
  ) {
    const row = this.getExportRow(index);
    if (scale) {
      await expect(
        row.getByRole('combobox').filter({ hasText: SCALE_OPTION }),
        `Export ${index + 1} scale is ${scale}`,
      ).toHaveText(scale);
    }
    if (suffix !== undefined) {
      await expect(
        row.getByPlaceholder('Suffix'),
        `Export ${index + 1} suffix is "${suffix}"`,
      ).toHaveValue(suffix);
    }
  }

  /**
   * Checks a zip export's file names, PNG/JPEG pixel sizes and that .pdf files are PDFs.
   * @param download The downloaded zip.
   * @param files Expected files, in any order.
   */
  async checkExportedZip(download: Download, files: ExpectedExportedFile[]) {
    await this.checkZipFileNames(
      download,
      files.map(({ name }) => name),
    );
    const zip = new AdmZip(await download.path());
    for (const { name, width, height } of files) {
      const data = zip.readFile(name)!;
      if (name.endsWith('.pdf')) {
        expect(data.toString('latin1', 0, 5), `${name} is a PDF`).toBe('%PDF-');
      } else if (width !== undefined && height !== undefined) {
        const size = imageSize(data);
        expect({ width: size.width, height: size.height }, `${name} size`).toEqual({
          width,
          height,
        });
      }
    }
  }
}
