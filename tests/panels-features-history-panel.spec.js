const { mainTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");

mainTest(
  "PF-172 Open history panel (with recent changes)",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickHistoryPanelButton();
    await mainPage.isActionDisplayedOnHistoryPanel("New board");
  }
);
