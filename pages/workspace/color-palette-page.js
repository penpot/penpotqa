const { BasePage } = require('../base-page');
const { expect } = require('@playwright/test');

exports.ColorPalettePage = class ColorPalettePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.popUp = page.locator('div[class*="colorpicker-tooltip"]');
    this.hexInput = page.locator('#hex-value');
    this.modalHexInput = page.locator('div[class*="selected-color-group"] span[class*="color-input-wrapper"] input');
    this.saveColorStyleButton = page.locator('button:has-text("Save color style")');
    this.colorsLibrariesSelect = page.locator(
      'div[class*="colorpicker_libraries__select-wrapper"]',
    );
    this.colorsFileLibraryOptions = page.locator('span:has-text("File library")');
    this.colorPaletteActionsBtn = page.locator('button[class*="palette-actions"]');
    this.colorPaletteMenu = page.locator('ul[class*="palette-menu"]');
    this.colorPaletteFileLibraryOpt = page.locator('li:has-text("File library")');
    this.colorPaletteRecentColorsOpt = page.locator('li:has-text("Recent colors")');
  }

  async setHex(value) {
    await this.hexInput.clear();
    await this.hexInput.fill(value);
  }

  async modalSetHex(value) {
    await this.modalHexInput.clear();
    await this.modalHexInput.fill(value);
    await this.page.waitForTimeout(400)
  }

  async clickSaveColorStyleButton() {
    await this.saveColorStyleButton.click();
  }

  async isColorPalettePopUpOpened() {
    await expect(this.popUp).toBeVisible();
  }

  async clickColorBullet(isFileLibrary = true, value = 0) {
    const classAttr = isFileLibrary
      ? 'color_bullet_new__is-library-color'
      : 'color_bullet_new__is-not-library-color';
    const selector = this.page.locator(
      `div[class*="selected-colors"] div[class*="${classAttr}"] >> nth=${value}`,
    );
    await selector.click();
  }

  async selectFileLibraryColors() {
    await this.colorsLibrariesSelect.click();
    await this.colorsFileLibraryOptions.click();
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
    const menuSel = this.page.locator(`li:has-text("${value}")`);
    await menuSel.click();
    await expect(this.colorPaletteMenu).not.toBeVisible();
  }

  async selectColorBulletFromPalette(value) {
    const colorSel = this.page.locator(
      `div[class*="color-palette-inside"] div[title="${value}"] span`,
    );
    await colorSel.click();
  }
};
