import { type Locator, type Page, expect } from '@playwright/test';

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
  readonly showOptionsButton: Locator;
  readonly exportTokensMessage: Locator;
  readonly confirmExportButton: Locator;
  readonly exportFileItem: Locator;
  readonly jsonOption: Locator;
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
    this.showOptionsButton = page.getByRole('button', { name: 'Show options' });
    this.exportTokensMessage = page.locator(
      '[class*="tokens_export_modal__disabled-message"]',
    );
    this.confirmExportButton = page.getByRole('button', { name: 'Export' });
    this.exportFileItem = page.locator('[class*="export_modal__file-name"]');
    this.jsonOption = page
      .getByRole('option')
      .filter({ hasText: 'Single JSON file' });
    this.folderOption = page.getByRole('option').filter({ hasText: 'Folder' });
    this.zipOption = page.getByRole('option').filter({ hasText: 'ZIP file' });
  }

  async clickOnTokenToolsButton() {
    await this.tokenToolsButton.click();
  }

  async importTokens(file: string) {
    await this.importButton.click();
    await this.showOptionsButton.click();
    await this.jsonOption.click();
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
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.chooseZipButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }

  async getTokenErrorDetailText() {
    const text: string | null = await this.importErrorDetailMessage.textContent();
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

  async checkImportTokenDetailErrorFormat(regex: RegExp) {
    const text = await this.getTokenErrorDetailText();
    for (const [index, line] of text.entries()) {
      expect(line).toMatch(regex);
    }
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

  async exportToken() {
    await this.confirmExportButton.click();
    await this.page.waitForEvent('download');
  }

  async checkExportFileItemCount(expectedCount: number) {
    await expect(this.exportFileItem).toHaveCount(expectedCount);
  }

  async ifExportFileExists(name: string) {
    await expect(this.exportFileItem.filter({ hasText: name })).toBeVisible();
  }
}
