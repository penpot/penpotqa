const { mainTest } = require('../../fixtures');
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');

const teamName = random().concat('autotest');

let dashboardPage, teamPage, mainPage, assetsPanelPage
test.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  await teamPage.deleteTeam(teamName);
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 15000);
  });

  mainTest(
    'PENPOT-1457 Publish Shared Library from the Libraries popup (with assets)',
    async ({ page }) => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-shared-library.png',
      );
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      // pop-up window click
      // await assetsPanelPage.isSharedLibraryButtonVisible();
      // await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryBadgeVisible();
    },
  );

  mainTest(
    'PENPOT-1459 Publish Shared Library without any assets',
    async ({ page }) => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryBadgeVisible();
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await mainPage.clickMainMenuButton();
    await mainPage.clickFileMainMenuItem();
    await mainPage.clickRemoveAsSharedLibraryMainMenuSubItem();
    await assetsPanelPage.clickRemoveAsSharedLibraryButton();
    await assetsPanelPage.isSharedLibraryBadgeNotVisible();
    await mainPage.backToDashboardFromFileEditor();
  });
});

test.describe(() => {
  mainTest(
    'PENPOT-1460 Canceling publish Shared Library',
    async ({ page }) => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickLibrariesButton();
      await assetsPanelPage.isSharedLibraryButtonVisible();
      await assetsPanelPage.clickSharedLibraryButton();
      await assetsPanelPage.isSharedLibraryCancelButtonVisible();
      await assetsPanelPage.clickCancelSharedLibraryButton();
      await assetsPanelPage.isSharedLibrarySearchInputVisible();
    },
  );

  test.afterEach(async ({ page }, testInfo) => {
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest(
  'PENPOT-1458 Publish Shared Library from the dashboard (RMB) (with assets)',
  async ({ page }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'component-shared-library.png',
    );

    await mainPage.clickPencilBoxButton();
    await dashboardPage.addFileAsSharedLibraryViaRightclick();
    await dashboardPage.isSharedLibraryIconDisplayed();
  },
);
