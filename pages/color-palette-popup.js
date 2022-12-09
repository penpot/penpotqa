const { BasePage } = require("./base-page");
const { expect } = require("@playwright/test");
exports.ColorPalettePopUp = class ColorPalettePopUp extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    super(page);
    this.popUp = page.locator('div[class="colorpicker-tooltip"]');
    this.hexInput = page.locator("#hex-value");
    this.saveColorStyleButton = page.locator(
      'button:has-text("Save color style")'
    );
    this.firstFileLibraryColorBullet = page.locator(
      'div[class="selected-colors"] div[class="color-bullet tooltip tooltip-right is-not-library-color"] >>nth=0'
    );
    this.secondFileLibraryColorBullet = page.locator(
      'div[class="selected-colors"] div[class="color-bullet tooltip tooltip-right is-not-library-color"] >>nth=1'
    );
    this.recentColorsColorBullet = page.locator(
      'div[class="selected-colors"] div[class="color-bullet tooltip tooltip-right is-library-color"] >>nth=0'
    );
    this.colorsSelector = page.locator(
      'div[class="colorpicker-tooltip"] select'
    );
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

  async isFirstFileLibraryColorBulletDisplayed() {
    await expect(this.firstFileLibraryColorBullet).toBeVisible();
  }

  async isSecondFileLibraryColorBulletDisplayed() {
    await expect(this.secondFileLibraryColorBullet).toBeVisible();
  }

  async isRecentColorsColorBulletDisplayed() {
    await expect(this.recentColorsColorBullet).toBeVisible();
  }

  async clickFirstFileLibraryColorBullet() {
    await this.firstFileLibraryColorBullet.click();
  }

  async clickSecondFileLibraryColorBullet() {
    await this.secondFileLibraryColorBullet.click();
  }

  async clickRecentColorsColorBullet() {
    await this.recentColorsColorBullet.click();
  }

  async selectFileLibraryColors() {
    await this.colorsSelector.selectOption("file");
  }
};
