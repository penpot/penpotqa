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
    this.copyCssCodeButton = page.locator('button[class*="css-copy-btn"]');
    this.codeHtmlStrings = page.locator('span[class="hljs-string"]');
    this.svgCodeButton = page.locator('label[for=":svg"]');
    this.copyHtmlCodeButton = page.locator('button[class*="html-copy-btn"]');
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

  async copyCssCodeByName(name) {
    await this.copyCssCodeButton.click();
    const cssCode = await this.page.evaluate(() => navigator.clipboard.readText());
    const regex = new RegExp(`/\\* ${name} \\*/.*`, 's');
    const match = cssCode.match(regex);
    return match ? match[0] : null;
  }

  async copySvgCode() {
    await this.copyHtmlCodeButton.click();
    const svgCode = await this.page.evaluate(() => navigator.clipboard.readText());
    return svgCode.replace(/\s+/g, '').replace(/[\r\n]+/g, '');
  }

  async isAnnotationTextExistOnInspectTab(text) {
    await expect(
      this.annotationBlockOnInspect.locator('[class*="annotation-content"]'),
    ).toHaveText(text);
  }

  async clickOnSVGCodeButton() {
    await this.svgCodeButton.click();
  }
};
