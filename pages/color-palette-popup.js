const { BasePage } = require("./base-page");
const { expect } = require("@playwright/test");
exports.ColorPalettePopUp = class ColorPalettePopUp extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    super(page);
    this.popUp = page.locator(".colorpicker-tooltip");
    this.hexInput = page.locator("#hex-value");
    this.saveColorStyleButton = page.locator(
      'button:has-text("Save color style")'
    );
    this.firstRecentColorBullet = page.locator(
      'div[class="selected-colors"] div[class="color-bullet is-not-library-color"] >>nth=0'
    );
    this.secondRecentColorBullet = page.locator(
      'div[class="selected-colors"] div[class="color-bullet is-not-library-color"] >>nth=1'
    );
    this.fileLibraryColorBullet = page.locator(
      'div[class="selected-colors"] div[class="color-bullet is-library-color"] >>nth=0'
    );

    this.colorsSelector = page.locator(".colorpicker-tooltip select");
  }

  async setHex(value) {
    await this.clearInput(this.hexInput);
    await this.hexInput.fill(value);
  }

  async clickSaveColorStyleButton() {
    await this.saveColorStyleButton.click();
  }

  async isColorPalettePopUpOpened() {
    await expect(this.popUp).toBeVisible();
  }

  async isFirstRecentColorBulletDisplayed() {
    await expect(this.firstRecentColorBullet).toBeVisible();
  }

  async isSecondRecentColorBulletDisplayed() {
    await expect(this.secondRecentColorBullet).toBeVisible();
  }

  async isFileLibraryColorBulletDisplayed() {
    await expect(this.fileLibraryColorBullet).toBeVisible();
  }

  async clickFirstFileLibraryColorBullet() {
    await this.fileLibraryColorBullet.click();
  }

  async clickSecondRecentColorBullet() {
    await this.secondRecentColorBullet.click();
  }

  async clickRecentColorBullet() {
    await this.firstRecentColorBullet.click();
  }

  async selectFileLibraryColors() {
    await this.colorsSelector.selectOption("file");
  }
};
