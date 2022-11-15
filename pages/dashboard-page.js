const { expect } = require("@playwright/test");

exports.DashboardPage = class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.header = page.locator("h1");
    this.numberOfFilesText = page.locator(
      'div[class="project-name-wrapper"] span[class="info"]'
    );
    this.fileTile = page.locator('div[class="item-info"]');
    this.deleteFileMenuItem = page.locator('a[data-test="file-delete"]');
    this.deletesFileButton = page.locator('input[value="Delete files"]');
    this.createFileButton = page.locator('button[class="create-new"]');
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
    await this.deletesFileButton.click();
  }

  async deleteFileIfExists() {
    const text = (await this.numberOfFilesText.innerText()).valueOf();
    if (!text.includes("0 files")) {
      await this.deleteFile();
    }
  }
};
