const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");

mainTest("PF-114 Create new page", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await mainPage.isFirstPageAddedToAssetsPanel();
  await mainPage.isSecondPageAddedToAssetsPanel();
  await expect(mainPage.assetsPanelPagesSection).toHaveScreenshot(
    "page-1-and-page-2.png"
  );
});

mainTest("PF-115 Rename page", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.renameFirstPageViaRightclick("NewFirstPage");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed("NewFirstPage");
  await mainPage.renameSecondPageViaDoubleclick("NewSecondPage");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isSecondPageNameDisplayed("NewSecondPage");
});

mainTest("PF-116 Duplicate page", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.duplicatePageViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed("Page-1");
  await mainPage.isSecondPageNameDisplayed("Page-2");
});

mainTest("PF-117 Switch between pages", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.clickSecondPageOnAssetsPanel();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("canvas-second-page-selected.png", {
    mask: [mainPage.usersSection],
  });
  await mainPage.clickFirstPageOnAssetsPanel();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot("canvas-first-page-selected.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("PF-118 Collapse/expand pages list", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCollapseExpandPagesButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.assetsPanelPagesSection).toHaveScreenshot(
    "hidden-pages.png"
  );
  await mainPage.clickCollapseExpandPagesButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await expect(mainPage.assetsPanelPagesSection).toHaveScreenshot(
    "page-1-and-page-2.png"
  );
});

mainTest("PF-119 Delete page", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteSecondPageViaRightclick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed("Page-1");
  await mainPage.isSecondPageNameDisplayed("Page-3");
  await expect(mainPage.assetsPanelPagesSection).toHaveScreenshot(
    "page-1-and-page-3.png"
  );
  await mainPage.deleteSecondPageViaTrashIcon();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed("Page-1");
  await expect(mainPage.assetsPanelPagesSection).toHaveScreenshot("page-1.png");
});
