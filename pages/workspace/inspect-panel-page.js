const { BasePage } = require("../base-page");
const { expect } = require("@playwright/test");

exports.InspectPanelPage = class InspectPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.inspectTab = page.locator('div[data-id="inspect"]');
    this.annotationBlockOnInspect = page.locator(
      "div.attributes-block.inspect-annotation",
    );
  }

  async openInspectTab() {
    await this.inspectTab.click();
  }

  async isAnnotationExistOnInspectTab() {
    await expect(this.annotationBlockOnInspect).toBeVisible();
  }
}
