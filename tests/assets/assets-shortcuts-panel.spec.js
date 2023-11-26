const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { expect } = require("@playwright/test");

mainTest("AS-110 Open panel main menu - help&info", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickMainMenuButton();
  await mainPage.clickHelpInfoMainMenuItem();
  await mainPage.clickShortcutsMainMenuSubItem();
  await mainPage.isShortcutsPanelDisplayed();
  await mainPage.clickViewportTwice();
  await expect(mainPage.shortcutsPanel).toHaveScreenshot("shortcuts-panel.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickHelpInfoMainMenuItem();
  await mainPage.clickShortcutsMainMenuSubItem();
  await mainPage.isShortcutsPanelNotDisplayed();
});

mainTest("AS-111 Open panel (icon bottom left", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickShortcutsPanelButton();
  await mainPage.isShortcutsPanelDisplayed();
  await mainPage.clickViewportTwice();
  await expect(mainPage.shortcutsPanel).toHaveScreenshot("shortcuts-panel.png");
  await mainPage.clickShortcutsPanelButton();
  await mainPage.isShortcutsPanelNotDisplayed();
});

mainTest("AS-115 Show/hide panel", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.pressShortcutsPanelShortcut();
  await mainPage.isShortcutsPanelDisplayed();
  await mainPage.clickViewportTwice();
  await expect(mainPage.shortcutsPanel).toHaveScreenshot("shortcuts-panel.png");
  await mainPage.closeShortcutsPanel();
  await mainPage.isShortcutsPanelNotDisplayed();
});
