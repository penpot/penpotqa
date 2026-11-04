import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Export dialog: "Export selection" (Export section, several elements) and
 * "Export as PDF" (Main menu > File > Export boards as PDF). It renders in the
 * modal portal, outside every region, so it sets its own root: the dialog
 * container, which has no role or label.
 */
export class ExportModalComponent extends BaseComponent {
  readonly exportSelectionTitle: Locator;
  readonly exportAsPDFTitle: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    super(page, page.locator('[class*="exports_assets__modal-container"]'));

    this.exportSelectionTitle = this.root.getByRole('heading', {
      name: 'Export selection',
    });
    this.exportAsPDFTitle = this.root.getByRole('heading', {
      name: 'Export as PDF',
    });
    this.exportButton = this.root.getByRole('button', {
      name: 'Export',
      exact: true,
    });
  }

  /** Confirms the "Export selection" dialog. The caller waits for the download. */
  async exportSelection() {
    await expect(
      this.exportSelectionTitle,
      'Export selection dialog is visible',
    ).toBeVisible();
    await this.exportButton.click();
  }

  /** Exports every board listed in the "Export as PDF" dialog and waits for the file. */
  async exportBoardsAsPDF() {
    await expect(
      this.exportAsPDFTitle,
      'Export as PDF dialog is visible',
    ).toBeVisible();
    await expect(this.exportButton, 'Export button is visible').toBeVisible();
    await Promise.all([
      this.page.waitForEvent('download'),
      this.exportButton.click(),
    ]);
  }
}
