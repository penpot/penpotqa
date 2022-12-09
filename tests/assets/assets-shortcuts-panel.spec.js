const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");

mainTest("AS-111 Open panel (icon bottom left)", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickShortcutsPanelButton();
  await mainPage.isShortcutsPanelDisplayed();
  await expect(mainPage.shortcutsPanel).toHaveScreenshot("shortcuts-panel.png");
  await mainPage.clickShortcutsPanelButton();
  await mainPage.isShortcutsPanelNotDisplayed();
});
