const { expect } = require("@playwright/test");

exports.DashboardPage = class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator("h1");
    this.numberOfFilesText = page.locator(
      'div[class="project-name-wrapper"] span[class="info"]'
    );
    this.fileTile = page.locator('div[class="item-info"]');
    this.fileNameTitle = page.locator('div[class="item-info"] h3');
    this.deleteFileMenuItem = page.locator('a[data-test="file-delete"]');
    this.deleteFileButton = page.locator(
      'input[value="Delete files"],input[value="Delete file"]'
    );
    this.createFileButton = page.locator('button[class="create-new"]');
    this.renameFileMenuItem = page.locator('a[data-test="file-rename"]');
    this.duplicateFileMenuItem = page.locator('a[data-test="file-duplicate"]');
    this.addFileAsSharedLibraryMenuItem = page.locator(
      'a[data-test="file-add-shared"]'
    );
    this.addFileAsSharedLibraryButton = page.locator(
      'input[value="Add as Shared Library"]'
    );
    this.sharedLibraryIcon = page.locator('svg[class="icon-library"]');
    this.delFileAsSharedLibraryMenuItem = page.locator(
      'a[data-test="file-del-shared"]'
    );
    this.delFileAsSharedLibraryButton = page.locator(
      'input[value="Unpublish"]'
    );
    this.downloadFilePenpot = page.locator(
      'a[data-test="download-binary-file"]'
    );
    this.downloadFileStandard = page.locator(
      'a[data-test="download-standard-file"]'
    );
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick"]');
    this.downloadFileCloseButton = page.locator('input[value="Close"]');
    this.fileNameInput = page.locator('div[class="edit-wrapper"]');
    this.successMessage = page.locator('div[class="banner success fixed"]');
  }

  async isHeaderDisplayed(title) {
    await expect(this.header).toBeVisible();
    await expect(this.header).toHaveText(title);
  }

  async createFile() {
    await this.createFileButton.click();
  }

  async deleteFile() {
    await this.fileTile.click({ button: "right" });
    await this.deleteFileMenuItem.click();
    await this.deleteFileButton.click();
  }

  async deleteFiles() {
    for (const el of await this.fileTile.elementHandles()) {
      await el.click({ button: "right" });
      await this.deleteFileMenuItem.click();
      await this.deleteFileButton.click();
    }
  }

  async deleteFilesIfExist() {
    const text = (await this.numberOfFilesText.innerText()).valueOf();
    if (!text.includes("0 files")) {
      await this.deleteFiles();
    }
  }

  async waitForPageLoaded() {
    await this.page.waitForLoadState("networkidle");
  }

  async checkNumberOfFiles(numberOfFiles) {
    await this.waitForPageLoaded();
    const text = (await this.numberOfFilesText.innerText()).valueOf();
    expect(text).toEqual(numberOfFiles);
  }

  async renameFile(newFileName) {
    await this.fileTile.click({ button: "right" });
    await this.renameFileMenuItem.click();
    await this.fileNameInput.type(newFileName);
    await this.page.keyboard.press("Enter");
    const text = (await this.fileNameTitle.innerText()).valueOf();
    expect(text).toEqual(newFileName);
  }

  async duplicateFile() {
    await this.fileTile.click({ button: "right" });
    await this.duplicateFileMenuItem.click();
  }

  async isSuccessMessageDisplayed(message) {
    const text = (await this.successMessage.innerText()).valueOf();
    expect(text).toEqual(message);
  }

  async addFileAsSharedLibrary() {
    await this.fileTile.click({ button: "right" });
    await this.addFileAsSharedLibraryMenuItem.click();
    await this.addFileAsSharedLibraryButton.click();
  }

  async deleteFileAsSharedLibrary() {
    await this.fileTile.click({ button: "right" });
    await this.delFileAsSharedLibraryMenuItem.click();
    await this.delFileAsSharedLibraryButton.click();
  }

  async isSharedLibraryIconDisplayed() {
    await expect(this.sharedLibraryIcon).toBeVisible();
  }
  async isSharedLibraryIconNotDisplayed() {
    await expect(this.sharedLibraryIcon).not.toBeVisible();
  }

  async downloadPenpotFile() {
    await this.fileTile.click({ button: "right" });
    await this.downloadFilePenpot.click();
    await this.page.waitForEvent("download");
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async downloadStandardFile() {
    await this.fileTile.click({ button: "right" });
    await this.downloadFileStandard.click();
    await this.page.waitForEvent("download");
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }
};
