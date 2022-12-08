const { BasePage } = require("./base-page");
exports.ColorPalettePopUp = class ColorPalettePopUp extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    super(page);
    this.hexInput = page.locator("#hex-value");
    this.saveColorStyleButton = page.locator(
      'button:has-text("Save color style")'
    );
  }

  async setHex(value) {
    await this.clearInput(this.hexInput);
    await this.hexInput.fill(value);
  }

  async clickSaveColorStyleButton() {
    await this.saveColorStyleButton.click();
  }
};
