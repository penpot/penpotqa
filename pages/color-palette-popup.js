exports.ColorPalettePopUp = class ColorPalettePopUp {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    this.page = page;
    this.hexInput = page.locator("#hex-value");
  }

  async setHex(value) {
    await this.clearInput(this.hexInput);
    await this.hexInput.fill(value);
  }

  async clearInput(input) {
    await input.click();
    let text = await input.inputValue();
    for (let i = 0; i <= text.length; i++) {
      await this.page.keyboard.press("Backspace");
    }
  }
};
