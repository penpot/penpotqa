const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");


mainTest("PF-156 Perform a change and check the status",async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.isUnSavedChangesDisplayed();
  await mainPage.waitForChangeIsSaved();
});

mainTest("PF-172 Open history panel with recent changes", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickHistoryPanelButton();
  await mainPage.isActionDisplayedOnHistoryPanel("New board");
});

