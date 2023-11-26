const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { expect } = require("@playwright/test");
const { test } = require("@playwright/test");

test.describe(() => {
  // All tests in this describe group will get 2 retry attempts.
  test.describe.configure({ retries: 2 });

  mainTest("CO-268 Create curve line from toolbar", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateCurveButton();
    await mainPage.drawCurve(900, 300, 600, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot("curve.png");
  });

  mainTest(
    "CO-270 Rename path, that was created with curve with valid name",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.clickCreateCurveButton();
      await mainPage.drawCurve(900, 300, 600, 200);
      await mainPage.waitForChangeIsSaved();
      await mainPage.doubleClickLayerOnLayersTab();
      await mainPage.renameCreatedLayer("renamed curve");
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayerNameDisplayed("renamed curve");
    }
  );
});
