const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest('PF-114 Create new page', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await mainPage.isFirstPageAddedToAssetsPanel();
  await mainPage.isSecondPageAddedToAssetsPanel();
  await expect(mainPage.pagesBlock).toHaveScreenshot('page-1-and-page-2.png');
});

mainTest('PF-115 Rename page', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.renamePageViaRightClick('NewFirstPage');
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed('NewFirstPage');
  await mainPage.renamePageViaRightClick('NewSecondPage', false);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isSecondPageNameDisplayed('NewSecondPage');
});

mainTest('PF-116 Duplicate page', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.duplicatePageViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed('Page 1');
  await mainPage.isSecondPageNameDisplayed('Page 2');
});

mainTest('PF-117 Switch between pages', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.clickOnPageOnLayersPanel(false);
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot('canvas-second-page-selected.png', {
    mask: [mainPage.usersSection],
  });
  await mainPage.clickOnPageOnLayersPanel();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot('canvas-first-page-selected.png', {
    mask: [mainPage.usersSection],
  });
});

mainTest('PF-118 Collapse/expand pages list', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCollapseExpandPagesButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await expect(mainPage.pagesBlock).toHaveScreenshot('hidden-pages.png');
  await mainPage.clickCollapseExpandPagesButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await expect(mainPage.pagesBlock).toHaveScreenshot('page-1-and-page-2.png');
});

mainTest('PF-119 Delete page', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteSecondPageViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed('Page 1');
  await mainPage.isSecondPageNameDisplayed('Page 3');
  await expect(mainPage.pagesBlock).toHaveScreenshot('page-1-and-page-3.png');
  await mainPage.deleteSecondPageViaTrashIcon();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed('Page 1');
  await expect(mainPage.pagesBlock).toHaveScreenshot('page-1.png');
});
