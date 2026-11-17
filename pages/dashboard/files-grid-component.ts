import { BaseComponent } from '@pages/base-component';
import { type Download, expect, type Locator, type Page } from '@playwright/test';
import AdmZip from 'adm-zip';

/**
 * Grid of file cards in a dashboard section (Drafts, a project, Projects).
 * Most file actions still live in DashboardPage and move here progressively.
 */
export class FilesGridComponent extends BaseComponent {
  readonly fileCards: Locator;
  /** Status icon of the "Export files" dialog, shown once the files are exported. */
  readonly exportDoneIcon: Locator;
  /** Button that closes the "Export files" dialog. */
  readonly exportDoneButton: Locator;

  constructor(page: Page) {
    // The grid has no role or test id, so it is found by class
    super(page, page.locator('[class*="dashboard_grid__dashboard-grid"]'));
    this.fileCards = this.root.getByRole('button');
    // The "Export files" dialog renders outside the grid; its icon has no role or label
    this.exportDoneIcon = page.locator('use[href="#icon-status-tick"]');
    this.exportDoneButton = page.getByRole('button', { name: 'Done', exact: true });
  }

  /**
   * Downloads the selected files as .penpot from the right-click menu of the first one and closes the dialog.
   * @param fileNames Names of the selected files; the first one's card is right-clicked.
   * @returns One download per file.
   */
  async downloadSelectedFilesViaRightClick(
    fileNames: string[],
  ): Promise<Download[]> {
    const count = fileNames.length;
    const downloads: Download[] = [];
    const onDownload = (download: Download) => downloads.push(download);
    this.page.on('download', onDownload);
    try {
      await this.fileCards
        .filter({ has: this.page.getByText(fileNames[0], { exact: true }) })
        .click({ button: 'right' });
      await this.page
        .getByRole('menuitem', { name: `Download ${count} Penpot files (.penpot)` })
        .click();
      await expect(
        this.exportDoneIcon.first(),
        'Export files dialog confirms the export',
      ).toBeVisible();
      await expect
        .poll(() => downloads.length, { message: `${count} files are downloaded` })
        .toBe(count);
    } finally {
      this.page.off('download', onDownload);
    }
    await this.exportDoneButton.click();
    return downloads;
  }

  /**
   * Checks the .penpot file names and that each is a zip with a manifest.json.
   * @param downloads The downloads.
   * @param fileNames Expected file names without extension, in any order.
   */
  async checkDownloadedPenpotFiles(downloads: Download[], fileNames: string[]) {
    expect(
      downloads.map((download) => download.suggestedFilename()).sort(),
      'Downloaded .penpot files',
    ).toEqual(fileNames.map((name) => `${name}.penpot`).sort());
    for (const download of downloads) {
      const zip = new AdmZip(await download.path());
      expect(
        zip.getEntries().map((entry) => entry.entryName),
        `${download.suggestedFilename()} is a zip with a manifest.json`,
      ).toContain('manifest.json');
    }
  }
}
