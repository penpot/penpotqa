const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");

mainTest("PF-179 Add export setting via design panel", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddExportButton();
  await mainPage.isExportElementButtonDisplayed("Export 1 element");
});

mainTest("PF-181 Remove export setting via design panel", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddExportButton();
  await mainPage.isExportElementButtonDisplayed("Export 1 element");
  await mainPage.clickRemoveExportButton();
  await mainPage.isExportElementButtonNotDisplayed();
});
