const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { expect } = require("@playwright/test");

mainTest(
  "PF-139 Add connector between 2 boards via mouse drag",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportByCoordinates(900, 100);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickCreateBoardButton()
    await mainPage.clickViewportByCoordinates(500, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickPrototypeTab();
    await mainPage.dragAndDropPrototypeArrowConnector(900, 100);
    await mainPage.waitForChangeIsSaved();
    await mainPage.isFlowNameDisplayedOnPrototypePanel("Flow 1");
    await expect(page).toHaveScreenshot(
      "connector-between-board2-and-board1.png",
      {
        mask: [mainPage.usersSection],
      }
    );
  }
);

mainTest("PF-143 Add Interaction via Prototype panel", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPrototypeTab();
  await mainPage.dragAndDropPrototypeArrowConnector(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddInteractionButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isPrototypeArrowSecondConnectorDisplayed();
  await expect(page).toHaveScreenshot("add-interaction.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("PF-144 Remove Interaction via Prototype panel", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPrototypeTab();
  await mainPage.dragAndDropPrototypeArrowConnector(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddInteractionButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isPrototypeArrowSecondConnectorDisplayed();
  await mainPage.clickRemoveSecondInteractionButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isPrototypeArrowSecondConnectorNotDisplayed();
  await expect(page).toHaveScreenshot(
    "connector-between-board2-and-board1.png",
    {
      mask: [mainPage.usersSection],
    }
  );
});

mainTest("PF-147 Change destination via Prototype panel", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPrototypeTab();
  await mainPage.dragAndDropPrototypeArrowConnector(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(200, 600);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickFirstInteractionRecord();
  await mainPage.selectInteractionDestination(1);
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot(
    "connector-between-board2-and-board3.png",
    {
      mask: [mainPage.usersSection],
    }
  );
});

mainTest("PF-152 Add 2nd Flow", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPrototypeTab();
  await mainPage.dragAndDropPrototypeArrowConnector(900, 100);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(200, 600);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportByCoordinates(200, 600);
  await mainPage.dragAndDropPrototypeArrowConnector(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFlowNameDisplayedOnPrototypePanel("Flow 2");
  await mainPage.clickViewportByCoordinates(300, 700);
  await mainPage.isFirstFlowNameDisplayedOnPrototypePanel("Flow 1");
  await mainPage.isSecondFlowNameDisplayedOnPrototypePanel("Flow 2");
  await expect(page).toHaveScreenshot("add-2nd-flow.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("PF-154 Rename flow", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPrototypeTab();
  await mainPage.dragAndDropPrototypeArrowConnector(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.renameFlow("qa");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFlowNameDisplayedOnPrototypePanel("qa");
  await expect(page).toHaveScreenshot("rename-flow.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("PF-155 Delete flow", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPrototypeTab();
  await mainPage.dragAndDropPrototypeArrowConnector(900, 100);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickRemoveFlowButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFlowNameNotDisplayedOnPrototypePanel();
  await expect(page).toHaveScreenshot("delete-flow.png", {
    mask: [mainPage.usersSection],
  });
});
