const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { expect } = require("@playwright/test");

mainTest("PF-132 Zoom +/- via top right menu", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickViewportTwice();
  await mainPage.increaseZoom(1);
  await expect(page).toHaveScreenshot("canvas-zoom-in.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.decreaseZoom(2);
  await expect(page).toHaveScreenshot("canvas-zoom-out.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("PF-134 Reset zoom via top right menu", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickViewportTwice();
  await mainPage.increaseZoom(1);
  await expect(page).toHaveScreenshot("canvas-zoom-in.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.resetZoom();
  await expect(page).toHaveScreenshot("canvas-zoom-default.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("PF-136 Zoom to fit all via top right menu", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await page.mouse.wheel(0, 1000);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.zoomToFitAll();
  await mainPage.clickViewportTwice();
  await expect(page).toHaveScreenshot("canvas-zoom-to-fit-all.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("PF-138 Zoom to selected via top right menu", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.zoomToFitSelected();
  await mainPage.clickViewportTwice();
  await expect(page).toHaveScreenshot("canvas-zoom-to-selected.png", {
    mask: [mainPage.usersSection],
  });
});
