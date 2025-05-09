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
    this.modalHexInput = page
      .locator(
        'div[class*="selected-color-group"] span[class*="color-input-wrapper"]',
      )
      .getByRole('textbox')
      .last();
    this.saveColorStyleButton = page.getByRole('button', {
      name: 'Save color style',
    });
    this.colorsLibrariesSelect = page.locator(
      'div[class*="colorpicker_libraries__select-wrapper"]',
    );
    this.colorsFileLibraryOptions = page.getByText('File library', { exact: true });
    this.colorPaletteActionsBtn = page.locator('button[class*="palette-actions"]');
    this.colorPaletteMenu = page.locator('ul[class*="palette-menu"]');
    this.colorPaletteFileLibraryOpt = page
      .getByRole('listitem')
      .filter({ hasText: 'File library' });
    this.colorPaletteRecentColorsOpt = page
      .getByRole('listitem')
      .filter({ hasText: 'Recent colors' });
    this.colorPaletteSolidDropdown = page.getByText('Solid', { exact: true });
    this.colorPaletteGradientOpt = page
      .getByRole('option')
      .filter({ hasText: 'Gradient' });
    this.colorPaletteAddStopButton = page.getByRole('button', { name: 'Add stop' });
    this.colorPaletteRemoveStopButton = page
      .locator('[class*="gradient-stops-list"]')
      .getByRole('button', { name: 'Remove color' });
  }

  async setHex(value) {
    await this.hexInput.clear();
    await this.hexInput.fill(value);
  }

  async modalSetHex(value) {
    await this.modalHexInput.clear();
    await this.modalHexInput.fill(value);
  }

  async clickSaveColorStyleButton() {
    await this.saveColorStyleButton.click();
  }

  async isColorPalettePopUpOpened() {
    await expect(this.popUp).toBeVisible();
  }

  async clickColorBullet(isFileLibrary = true, value = 0) {
    const classAttr = isFileLibrary
      ? 'color_bullet__is-library-color'
      : 'color_bullet__is-not-library-color';
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
    const menuSel = this.page.getByRole('listitem').filter({ hasText: value });
    await menuSel.click();
    await expect(this.colorPaletteMenu).not.toBeVisible();
  }

  async selectColorBulletFromPalette(value) {
    const colorSel = this.page
      .locator(`div[class*="color-palette-inside"]`)
      .getByRole('button', { name: value });
    await colorSel.click();
  }

  async selectColorGradient() {
    await this.colorPaletteSolidDropdown.click();
    await this.colorPaletteGradientOpt.click();
  }

  async colorPaletteAddStop() {
    await this.colorPaletteAddStopButton.click();
  }

  async colorPaletteRemoveStop(index = 0) {
    await this.colorPaletteRemoveStopButton.nth(index).click();
  }

  async checkGradientStops(index = 2) {
    await expect(this.colorPaletteRemoveStopButton).toHaveCount(index);
  }
};
