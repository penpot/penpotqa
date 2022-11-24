const { mainTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");
const { expect } = require("@playwright/test");

mainTest("Import an image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkPartialHtmlOfCreatedLayer(
    '<rect rx="0" ry="0" x="528.5" y="395.5" transform="" width="303" height="130" fill='
  );
  await expect(page).toHaveScreenshot("image.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Create a curve", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateCurveButton();
  await mainPage.drawCurve(900, 300, 600, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkHtmlOfCreatedLayer(
    '<path rx="0" ry="0" d="M596,252L296,152"></path>'
  );
  await expect(page).toHaveScreenshot("curve.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Create a path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.checkHtmlOfCreatedLayer(
    '<path rx="0" ry="0" d="M196,152L896,652L696,352L196,152ZM680,460"></path>'
  );
  await expect(page).toHaveScreenshot("path.png", {
    mask: [mainPage.usersSection],
  });
});
