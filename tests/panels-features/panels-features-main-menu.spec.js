const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");

mainTest("PF-99-1 Hide/show rulers via main menu'", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideRulersMainMenuSubItem();
  await mainPage.clickViewportTwice();
  await expect(mainPage.viewport).toHaveScreenshot(
    "viewport-hidden-rulers.png"
  );
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowRulersMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot("viewport-default.png");
});

mainTest(
  "PF-99-2 Hide/show rulers via shortcut CTRL SHIFT R",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickViewportTwice();
    if (browserName === "webkit") {
      await mainPage.pressHideShowRulersShortcutWebkit();
    } else {
      await mainPage.pressHideShowRulersShortcut();
    }
    await expect(mainPage.viewport).toHaveScreenshot(
      "viewport-hidden-rulers.png"
    );
    if (browserName === "webkit") {
      await mainPage.pressHideShowRulersShortcutWebkit();
    } else {
      await mainPage.pressHideShowRulersShortcut();
    }
    await expect(mainPage.viewport).toHaveScreenshot("viewport-default.png");
  }
);

mainTest("PF-102 Hide/show board names", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideBoardNamesMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot("board-hide-name.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowBoardNamesMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot("board-show-name.png");
});

mainTest("PF-103-1 Hide/show pixel grid via main menu", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickViewportTwice();
  await mainPage.increaseZoom(10);
  await expect(mainPage.viewport).toHaveScreenshot(
    "canvas-show-pixel-grid.png"
  );
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHidePixelGridMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot(
    "canvas-hide-pixel-grid.png"
  );
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowPixelGridMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot(
    "canvas-show-pixel-grid.png"
  );
});

mainTest(
  "PF-103-2 Hide/show pixel grid via shortcut SHIFT ,",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickViewportTwice();
    await mainPage.increaseZoom(10);
    await expect(mainPage.viewport).toHaveScreenshot(
      "canvas-show-pixel-grid.png"
    );
    await mainPage.pressHideShowPixelGridShortcut();
    await expect(mainPage.viewport).toHaveScreenshot(
      "canvas-hide-pixel-grid.png"
    );
    await mainPage.pressHideShowPixelGridShortcut();
    await expect(mainPage.viewport).toHaveScreenshot(
      "canvas-show-pixel-grid.png"
    );
  }
);

mainTest(
  "PF-104 Hide/show UI via main menu and shortcut '/'",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await expect(mainPage.viewport).toHaveScreenshot("canvas-show-ui.png");
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickShowHideUIMainMenuSubItem();
    await expect(mainPage.viewport).toHaveScreenshot("canvas-hide-ui.png");
    await mainPage.pressHideShowUIShortcut();
    await expect(mainPage.viewport).toHaveScreenshot("canvas-show-ui.png");
  }
);

mainTest("PF-111 Download penpot file .penpot", async ({ page }) => {
  const mainPage = new MainPage(page);
  await expect(mainPage.viewport).toHaveScreenshot("canvas-show-ui.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.downloadPenpotFileViaMenu();
});

mainTest("PF-111 Download standard file .svg+.json", async ({ page }) => {
  const mainPage = new MainPage(page);
  await expect(mainPage.viewport).toHaveScreenshot("canvas-show-ui.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.downloadStandardFileViaMenu();
});

mainTest("PF-113 Add/Remove as shared library", async ({ page }) => {
  const mainPage = new MainPage(page);
  await expect(mainPage.viewport).toHaveScreenshot("canvas-show-ui.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.clickAddAsSharedLibraryMainMenuSubItem();
  await mainPage.clickAddAsSharedLibraryButton();
  await mainPage.clickAssetsTab();
  await mainPage.isSharedLibraryBadgeVisible();
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.clickRemoveAsSharedLibraryMainMenuSubItem();
  await mainPage.clickRemoveAsSharedLibraryButton();
  await mainPage.isSharedLibraryBadgeNotVisible();
});
