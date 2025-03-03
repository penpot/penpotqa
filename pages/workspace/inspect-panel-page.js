const { BasePage } = require('../base-page');
const { expect } = require('@playwright/test');

exports.InspectPanelPage = class InspectPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.inspectTab = page.getByRole('tab', { name: 'inspect' });
    this.annotationBlockOnInspect = page.locator(
      'div.main_ui_inspect_annotation__attributes-block',
    );
    this.textBlockOnInspect = page.locator(
      'div.main_ui_inspect_attributes_text__attributes-block',
    );
    this.rowGapOnInspect = page.locator(
      'div[class*="layout-row"] div[title="Row gap"]',
    );
    this.codeTabButton = page.getByRole('tab', { name: 'code' });
  }

  async openInspectTab() {
    await this.inspectTab.click();
  }

  async isAnnotationExistOnInspectTab() {
    await expect(this.annotationBlockOnInspect).toBeVisible();
  }

  async isRowGapExistOnInspectTab() {
    await expect(this.rowGapOnInspect).toBeVisible();
  }

  async openCodeTab() {
    await this.codeTabButton.click();
  }

  async waitForCodeButtonVisible() {
    await this.codeTabButton.waitFor({ state: 'visible', timeout: 10000 });
  }
};
