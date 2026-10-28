import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { MainPage } from '@pages/workspace/main-page';
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

/**
 * Export UI of the workspace: the Export section of the Design tab (also in
 * view mode's Inspect tab), the "Export selection" dialog it opens for several
 * elements, and Main menu > File > Export boards as PDF. It works the same for
 * every format; what each format produces is checked on the downloaded file
 * (e.g. ExportedSvgPage).
 */
export class ExportPage extends DesignPanelPage {
  // pages
  readonly mainPage: MainPage;

  // locators
  readonly exportSection: Locator;
  readonly addExportButton: Locator;
  readonly removeExportButton: Locator;
  /** "Export N element(s)" button under the export rows. */
  readonly exportElementButton: Locator;
  readonly exportFormatSelect: Locator;
  readonly exportScaleSelect: Locator;
  readonly exportSuffixInput: Locator;
  /** Single row shown for several elements whose exports differ. */
  readonly exportMixedRow: Locator;
  readonly exportSelectionDialogTitle: Locator;
  readonly exportAsPDFDialogTitle: Locator;
  /** "Export" button of the Export selection and Export as PDF dialogs. */
  readonly exportDialogExportButton: Locator;
  readonly exportCompleteToastText: Locator;
  readonly exportBoardsAsPDFMenuSubItem: Locator;
  readonly preferencesMainMenuItem: Locator;
  readonly webglRenderingMenuSubItem: Locator;
  /** Canvas the WebGL renderer draws the shapes on; absent with the classic renderer. */
  readonly webglCanvas: Locator;
  readonly viewModeRightSidebar: Locator;
  readonly viewModeAddExportButton: Locator;
  readonly viewModeExportSuffixInput: Locator;

  constructor(page: Page) {
    super(page);

    // pages
    this.mainPage = new MainPage(page);

    // locators
    this.exportSection = page.getByText('Export', { exact: true });
    this.addExportButton = page.getByRole('button', { name: 'Add export' });
    this.removeExportButton = page.getByRole('button', { name: 'Remove export' });
    this.exportElementButton = page.getByRole('button', {
      name: /Export \d+ element/,
    });
    this.exportFormatSelect = page.getByRole('combobox').filter({
      hasText: new RegExp(`^(${Object.values(ExportFormat).join('|')})$`),
    });
    this.exportScaleSelect = page
      .getByRole('combobox')
      .filter({ hasText: /^\d+(\.\d+)?x$/ });
    this.exportSuffixInput = page.getByPlaceholder('Suffix');
    this.exportMixedRow = page
      .getByText('Mixed', { exact: true })
      .locator('..')
      .filter({ has: this.removeExportButton });
    this.exportSelectionDialogTitle = page.getByRole('heading', {
      name: 'Export selection',
    });
    this.exportAsPDFDialogTitle = page.getByRole('heading', {
      name: 'Export as PDF',
    });
    this.exportDialogExportButton = page.getByRole('button', {
      name: 'Export',
      exact: true,
    });
    this.exportCompleteToastText = page.getByText('Export complete');
    this.exportBoardsAsPDFMenuSubItem = page
      .getByRole('menuitem')
      .filter({ hasText: 'Export boards as PDF' });
    this.preferencesMainMenuItem = page.getByRole('menuitem', {
      name: 'Preferences',
    });
    // Its label says what clicking it does: "Disable…" while WebGL is on
    this.webglRenderingMenuSubItem = page.getByRole('menuitem', {
      name: /^(Enable|Disable) WebGL rendering \(beta\)$/,
    });
    this.webglCanvas = page.getByTestId('canvas-wasm-shapes');
    this.viewModeRightSidebar = page.locator(
      `aside[class*='inspect_right_sidebar']`,
    );
    this.viewModeAddExportButton = this.viewModeRightSidebar.getByRole('button', {
      name: 'Add export',
    });
    this.viewModeExportSuffixInput =
      this.viewModeRightSidebar.getByPlaceholder('Suffix');
  }

  async clickAddExportButton() {
    await this.exportSection.waitFor();
    await this.addExportButton.click();
  }

  async clickAddExportButtonForViewMode() {
    await this.exportSection.waitFor();
    await this.viewModeAddExportButton.click();
  }

  async clickRemoveExportButton() {
    await this.removeExportButton.click();
  }

  async isViewModeExportRowVisible(format = 'PNG', scale = '1x') {
    const sidebar = this.viewModeRightSidebar;
    await expect(
      sidebar.getByText(format, { exact: true }),
      `Export format is ${format}`,
    ).toBeVisible();
    await expect(
      sidebar.getByText(scale, { exact: true }),
      `Export scale is ${scale}`,
    ).toBeVisible();
    await expect(
      this.viewModeExportSuffixInput,
      'Export suffix is empty',
    ).toHaveValue('');
  }

  async isExportElementButtonDisplayed(title: string) {
    await expect(this.exportElementButton).toHaveText(title);
  }

  async isExportElementButtonNotDisplayed() {
    await expect(this.exportElementButton).not.toBeVisible();
  }

  /** Adds an export row to the selection and sets its format. */
  async addExportWithFormat(format: ExportFormatName) {
    // The Design tab lags a selection change, so retry until a single PNG row
    // shows.
    // (clickAddExportButton() hangs on several elements: the title is
    // "Export selection")
    await expect(async () => {
      // A click on part of the selection leaves a "Mixed" row: clear it first
      if (await this.exportMixedRow.isVisible()) {
        await this.exportMixedRow
          .getByRole('button', { name: 'Remove export' })
          .click({ timeout: 2000 });
      }
      await this.addExportButton.click();
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

  async checkExportSuffix(suffix: string) {
    await expect(
      this.exportSuffixInput,
      suffix ? `Export suffix is "${suffix}"` : 'Export suffix is empty',
    ).toHaveValue(suffix);
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
    await expect(this.exportElementButton, `Export ${count} elements`).toHaveText(
      new RegExp(`^Export ${count} elements$`, 'i'),
    );
    return this.trackExport(async () => {
      await this.exportElementButton.click();
      await expect(
        this.exportSelectionDialogTitle,
        'Export selection dialog is visible',
      ).toBeVisible();
      await this.exportDialogExportButton.click();
    });
  }

  /** Clicks Export boards as PDF in the open File menu and exports them all. */
  async exportBoardsAsPDFViaMenu(numBoards: number) {
    await this.exportBoardsAsPDFMenuSubItem.click();
    await expect(this.exportAsPDFDialogTitle).toBeVisible();
    await expect(this.exportDialogExportButton).toBeVisible();
    await Promise.all([
      this.page.waitForEvent('download'),
      this.exportDialogExportButton.click(),
    ]);
    await expect(this.exportCompleteToastText).toBeVisible();
    await expect(this.page.getByText(`${numBoards} / ${numBoards}`)).toBeVisible();
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

  /**
   * Toggles "WebGL rendering (beta)" in Main menu > Preferences. The workspace
   * reloads with the other renderer and the selection is cleared, so pending
   * changes are saved first (they would be lost otherwise).
   */
  async toggleWebglRenderingViaMainMenu(enabled: boolean) {
    const action = enabled ? 'Enable' : 'Disable';
    await this.waitForChangeIsSaved();
    await this.mainPage.clickMainMenuButton();
    await this.preferencesMainMenuItem.hover();
    await expect(
      this.webglRenderingMenuSubItem,
      `WebGL rendering can be ${action.toLowerCase()}d`,
    ).toHaveText(`${action} WebGL rendering (beta)`);
    await this.webglRenderingMenuSubItem.click();
    await expect(
      this.webglCanvas,
      `Canvas is drawn with the ${enabled ? 'WebGL' : 'classic'} renderer`,
    ).toHaveCount(enabled ? 1 : 0);
    await this.mainPage.isMainPageLoaded();
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
