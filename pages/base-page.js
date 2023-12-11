const { expect } = require("@playwright/test");
const { getPlatformName } = require("../helpers/string-generator");

exports.BasePage = class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator('div[class^="main_ui_dashboard"] h1');
    this.successMessage = page.locator('div[class="banner success fixed"]');
    this.infoMessage = page.locator('div[class="banner info fixed"]');
  }

  async clearInput(input) {
    await input.click();
    if (getPlatformName() === "MacOS") {
      await this.page.keyboard.press("Meta+A");
    } else {
      await this.page.keyboard.press("Control+A");
    }
    await this.page.keyboard.press("Delete");
  }

  async clickShortcutCtrlZ(browserName) {
    if (getPlatformName() === "MacOS") {
      await this.page.keyboard.press("Meta+Z");
    } else {
      if (browserName !== "webkit") {
        await this.page.keyboard.press("Control+Z");
      } else {
        await this.page.keyboard.press("Meta+Z");
      }
    }
  }

  async reloadPage() {
    await this.page.reload();
  }

  async clickOnEnter() {
    await this.page.keyboard.press("Enter");
  }

  async isHeaderDisplayed(title) {
    await expect(this.header).toBeVisible();
    await expect(this.header).toHaveText(title);
  }

  async isSuccessMessageDisplayed(message) {
    await expect(this.successMessage).toHaveText(message);
  }

  async waitSuccessMessageHidden() {
    await this.successMessage.waitFor({ state: "hidden" });
  }

  async isInfoMessageDisplayed(message) {
    await expect(this.infoMessage).toHaveText(message);
  }

  async waitInfoMessageHidden() {
    await this.infoMessage.waitFor({ state: "hidden" });
  }
};
