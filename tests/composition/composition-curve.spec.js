const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");

mainTest("CO-268 Create curve line (Toolbar)", async ({ page }) => {
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

mainTest(
  "CO-270 Rename path, that was created with curve with valid name",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateCurveButton();
    await mainPage.drawCurve(900, 300, 600, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.doubleClickCreatedLayerOnLayersPanel();
    await mainPage.renameCreatedLayer("renamed curve");
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayerNameDisplayed("renamed curve");
  }
);
