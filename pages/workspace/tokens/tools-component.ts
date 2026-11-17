import { type Download, type Locator, type Page, expect } from '@playwright/test';
import { readFile } from 'fs/promises';

/**
 * Applies to an imported tokens JSON what Penpot adds on export: shadows get `inset: false`.
 * @param node Parsed JSON, or a part of it; it is changed in place.
 */
function addExportDefaults(node: unknown) {
  if (!node || typeof node !== 'object') return;
  const token = node as { $type?: string; $value?: unknown };
  if (token.$type === 'shadow' && Array.isArray(token.$value)) {
    token.$value = token.$value.map((shadow) => ({ inset: false, ...shadow }));
    return;
  }
  Object.values(node).forEach(addExportDefaults);
}

export class ToolsComponent {
  readonly page: Page;

  // locators
  readonly tokenToolsButton: Locator;
  readonly importButton: Locator;
  readonly chooseFileButton: Locator;
  readonly chooseFolderButton: Locator;
  readonly chooseZipButton: Locator;
  readonly exportButton: Locator;
  readonly multipleFilesButton: Locator;
  readonly singleFileTab: Locator;
  readonly showOptionsButton: Locator;
  readonly exportTokensMessage: Locator;
  readonly confirmExportButton: Locator;
  readonly exportFileItem: Locator;
  readonly folderOption: Locator;
  readonly zipOption: Locator;
  readonly importErrorDetailMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // locators
    this.importErrorDetailMessage = page.locator(
      'div[class*="error-detail-content"]',
    );
    this.tokenToolsButton = page.getByRole('button', { name: 'Tools' });
    this.importButton = page.getByRole('menuitem', { name: 'Import' });
    this.chooseFileButton = page.getByRole('button', {
      name: 'Import Single JSON file',
    });
    this.chooseFolderButton = page.getByRole('button', { name: 'Import folder' });
    this.chooseZipButton = page.getByRole('button', { name: 'Import ZIP file' });
    this.exportButton = page.getByRole('menuitem', { name: 'Export' });
    this.multipleFilesButton = page.getByRole('tab', { name: 'Multiple files' });
    this.singleFileTab = page.getByRole('tab', { name: 'Single file' });
    this.showOptionsButton = page.getByRole('button', { name: 'Show options' });
    this.exportTokensMessage = page.locator(
      '[class*="tokens_export_modal__disabled-message"]',
    );
    this.confirmExportButton = page.getByRole('button', { name: 'Export' });
    this.exportFileItem = page.locator('[class*="export_modal__file-name"]');
    this.folderOption = page.getByRole('option').filter({ hasText: 'Folder' });
    this.zipOption = page.getByRole('option').filter({ hasText: 'ZIP file' });
  }

  async clickOnTokenToolsButton() {
    await this.tokenToolsButton.click();
  }

  async importTokens(file: string) {
    await this.importButton.click();
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.chooseFileButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }

  async importTokensFolder(file: string) {
    await this.importButton.click();
    await this.showOptionsButton.click();
    await this.folderOption.click();
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.chooseFolderButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }

  async importTokensZip(file: string) {
    await this.importButton.click();
    await this.showOptionsButton.click();
    await this.zipOption.click();
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.chooseZipButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }

  async getTokenErrorDetailText() {
    const text: string | null = await this.importErrorDetailMessage.innerText();
    const safeText = text ?? '';
    return safeText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  async checkImportTokenDetailErrorCount(count: number) {
    const text = await this.getTokenErrorDetailText();
    expect(text.length).toBe(count);
  }

  async clickOnExportButton() {
    await this.exportButton.click();
  }

  async clickOnMultipleFilesButton() {
    await this.multipleFilesButton.click();
  }

  async checkEmptyExportTabMessage() {
    await expect(this.exportTokensMessage).toContainText(
      'There are no tokens, themes or sets to export.',
    );
  }

  async isExportWindowClosed(closed = true) {
    closed
      ? await expect(this.multipleFilesButton).not.toBeVisible()
      : await expect(this.multipleFilesButton).toBeVisible();
  }

  /**
   * Confirms the export tokens modal and waits for the file.
   * @returns The download, to check the exported file.
   */
  async exportToken(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.confirmExportButton.click(),
    ]);
    return download;
  }

  async checkExportFileItemCount(expectedCount: number) {
    await expect(this.exportFileItem).toHaveCount(expectedCount);
  }

  async ifExportFileExists(name: string) {
    await expect(this.exportFileItem.filter({ hasText: name })).toBeVisible();
  }

  /** Checks that the export tokens modal shows its "Single file" option, selected. */
  async checkSingleFileTabSelected() {
    await expect(
      this.singleFileTab,
      '"Single file" export is selected',
    ).toHaveAttribute('aria-selected', 'true');
  }

  /**
   * Checks a single-file export: tokens.json equal to the imported file, every token's
   * type and value included (shadows get `inset: false`).
   * @param download The downloaded export.
   * @param importedFile Path of the JSON file the tokens were imported from.
   */
  async checkExportedTokensFile(download: Download, importedFile: string) {
    expect(download.suggestedFilename(), 'Exported file name').toBe('tokens.json');
    const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
    const imported = JSON.parse(await readFile(importedFile, 'utf8'));
    addExportDefaults(imported);
    // toEqual ignores key order; the set order is checked in $metadata.tokenSetOrder
    expect(exported, 'Exported sets, tokens, $themes and $metadata').toEqual(
      imported,
    );
  }
}
