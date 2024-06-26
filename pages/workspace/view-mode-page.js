const { BasePage } = require('../base-page');
const { expect } = require('@playwright/test');

exports.ViewModePage = class ViewModePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Assets panel
    this.viewModeButton = page.locator(`a[class*='viewer-btn']`);
    this.viewerLoyautSection = page.locator('#viewer-layout');
    this.inspectButton = page.locator(`button .icon-code`);
    this.rightSidebar = page.locator(`aside[class*='inspect_right_sidebar']`);
  }

  async clickViewModeButton() {
    const popupPromise = this.page.waitForEvent('popup');
    await this.viewModeButton.click();
    return popupPromise;
  }

  async openInspectTab() {
    await this.inspectButton.click();
    await expect(this.rightSidebar).toBeVisible();
  }
};
