const { BasePage } = require("../base-page");
const { expect } = require("@playwright/test");

exports.ColorPalettePopUp = class ColorPalettePopUp extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    super(page);
    this.popUp = page.locator('.colorpicker-tooltip');
    this.hexInput = page.locator('#hex-value');
    this.saveColorStyleButton = page.locator(
      'button:has-text("Save color style")'
    );
    this.fileLibraryColorBullet = page.locator(
      'div[class="selected-colors"] div[class="color-bullet is-library-color"] >>nth=0'
    );
    this.colorsSelector = page.locator('.colorpicker-tooltip select');
    this.colorPaletteActionsBtn = page.locator('div.color-palette-actions');
    this.colorPaletteMenu = page.locator('ul.workspace-context-menu.palette-menu');
    this.colorPaletteFileLibraryOpt = page.locator('li.palette-library:has-text("File library")');
    this.colorPaletteRecentColorsOpt = page.locator('li.palette-library:has-text("Recent colors")');
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

  async isRecentColorBulletDisplayed(color) {
    const selector = await this.page.locator(`div[class="selected-colors"] div[title="${color}"]`);
    await expect(selector).toBeVisible();
  }

  async isFileLibraryColorBulletDisplayed() {
    await expect(this.fileLibraryColorBullet).toBeVisible();
  }

  async clickFirstFileLibraryColorBullet() {
    await this.fileLibraryColorBullet.click();
  }

  async clickRecentColorBullet(color) {
    const selector = await this.page.locator(`div[class="selected-colors"] div[title="${color}"]`);
    await selector.click();
  }

  async selectFileLibraryColors() {
    await this.colorsSelector.selectOption("file");
  }

  async openColorPaletteMenu() {
    await this.colorPaletteActionsBtn.click();
    await expect(this.colorPaletteMenu).toBeVisible();
  }

  async isPaletteFileLibraryOptExist() {
    await expect(this.colorPaletteFileLibraryOpt).toBeVisible();
  }

  async isPaletteRecentColorsOptExist() {
    await expect(this.colorPaletteRecentColorsOpt).toBeVisible();
  }

  async selectColorPaletteMenuOption(value) {
    const menuSel = this.page.locator(`li.palette-library:has-text("${value}")`);
    await menuSel.click();
    await expect(this.colorPaletteMenu).not.toBeVisible();
  }

  async selectColorBulletFromPalette(value) {
    const colorSel = this.page.locator(`div.color-palette-inside div[title="${value}"]`);
    await colorSel.click();
  }

};
