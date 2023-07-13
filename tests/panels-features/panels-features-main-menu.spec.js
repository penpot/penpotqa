const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");
const {ColorPalettePopUp} = require("../../pages/color-palette-popup");

mainTest("PF-99 Hide/show grids via shortcut CTRL '",async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();

  await mainPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("square-grid-default.png");
  await mainPage.pressHideShowGridsShortcut(browserName);
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.createdLayer).toHaveScreenshot("square-grid-hide.png");
  await mainPage.pressHideShowGridsShortcut();
  await mainPage.waitForChangeIsSaved(browserName);
  await expect(mainPage.createdLayer).toHaveScreenshot("square-grid-unhide.png");
});

mainTest("PF-99-1 Hide/show rulers via main menu", async ({ page }) => {
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
    await mainPage.pressHideShowRulersShortcut(browserName);
    await expect(mainPage.viewport).toHaveScreenshot("viewport-hidden-rulers.png");
    await mainPage.pressHideShowRulersShortcut(browserName);
    await expect(mainPage.viewport).toHaveScreenshot("viewport-default.png");
  }
);

mainTest("PF-101 Hide/show color palette - file library check",async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryColorButton();
  await colorPalettePopUp.setHex("#ffff00");
  await colorPalettePopUp.clickSaveColorStyleButton();
  await mainPage.clickViewportOnce();
  await mainPage.waitForChangeIsSaved();

  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowColorPaletteMainMenuSubItem();
  await mainPage.isColorsPaletteDisplayed();
  await colorPalettePopUp.openColorPaletteMenu();
  await colorPalettePopUp.selectColorPaletteMenuOption("File library");
  await expect(mainPage.colorsPalette).toHaveScreenshot("colors-file-library.png");
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideColorPaletteMainMenuSubItem();
  await mainPage.isColorsPaletteNotDisplayed();
});

mainTest("PF-102 Hide/show board names", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideBoardNamesMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot(
    "board-hide-name.png", {
      mask: [mainPage.guides]
    });
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
    // await expect(mainPage.viewport).toHaveScreenshot("canvas-show-ui.png");
    await mainPage.clickMainMenuButton();
    await mainPage.clickViewMainMenuItem();
    await mainPage.clickShowHideUIMainMenuSubItem();
    await expect(mainPage.viewport).toHaveScreenshot("canvas-hide-ui.png");
    await mainPage.pressHideShowUIShortcut();
    await expect(mainPage.viewport).toHaveScreenshot("canvas-show-ui.png");
  }
);

mainTest("PF-109 Select all via main menu and shortcut CTRL A",
  async ({ page, browserName}) => {
  const mainPage = new MainPage(page);
  await mainPage.createDefaultBoardByCoordinates(100, 200);
  await mainPage.createDefaultRectangleByCoordinates(250, 350);
  await mainPage.createDefaultEllipseByCoordinates(100, 600);
  await expect(mainPage.viewport).toHaveScreenshot(
    "layers-all-unselected.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickMainMenuButton();
  await mainPage.clickEditMainMenuItem();
  await mainPage.clickSelectAllMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot(
    "layers-all-selected.png", {
      mask: [mainPage.guides]
    });
  await mainPage.clickViewportOnce();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layers-all-unselected.png", {
        mask: [mainPage.guides]
      });
  await mainPage.pressSelectAllShortcut(browserName);
    await expect(mainPage.viewport).toHaveScreenshot(
      "layers-all-selected.png", {
        mask: [mainPage.guides]
      });
});

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
