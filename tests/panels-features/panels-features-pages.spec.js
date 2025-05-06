const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { BasePage } = require('../../pages/base-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

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

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest(qase(832, 'PF-114 Create new page'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await mainPage.isFirstPageAddedToAssetsPanel();
  await mainPage.isSecondPageAddedToAssetsPanel();
  await expect(mainPage.pagesBlock).toHaveScreenshot('page-1-and-page-2.png');
});

mainTest(qase(833, 'PF-115 Rename page'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await mainPage.renamePageViaRightClick('NewFirstPage');
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed('NewFirstPage');
  await mainPage.renamePageViaRightClick('NewSecondPage', false);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isSecondPageNameDisplayed('NewSecondPage');
});

mainTest(qase(834, 'PF-116 Duplicate page'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.duplicatePageViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed('Page 1');
  await mainPage.isSecondPageNameDisplayed('Page 1 (copy)');
});

mainTest(qase(835, 'PF-117 Switch between pages'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.clickOnPageOnLayersPanel(false);
  await mainPage.clickMoveButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot('canvas-second-page-selected.png', {
    mask: [
      mainPage.guides,
      mainPage.guidesFragment,
      mainPage.toolBarWindow,
      mainPage.usersSection,
    ],
  });
  await mainPage.clickOnPageOnLayersPanel();
  await mainPage.clickMoveButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(page).toHaveScreenshot('canvas-first-page-selected.png', {
    mask: [
      mainPage.guides,
      mainPage.guidesFragment,
      mainPage.toolBarWindow,
      mainPage.usersSection,
    ],
  });
});

mainTest(qase(836, 'PF-118 Collapse/expand pages list'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCollapseExpandPagesButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await mainPage.isFirstPageAddedToAssetsPanel(false);
  await mainPage.isSecondPageAddedToAssetsPanel(false);
  await mainPage.clickCollapseExpandPagesButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickMoveButton();
  await mainPage.isFirstPageNameDisplayed('Page 1');
  await mainPage.isSecondPageNameDisplayed('Page 2');
});

mainTest(qase(837, 'PF-119 Delete page'), async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.deleteSecondPageViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed('Page 1');
  await mainPage.isSecondPageNameDisplayed('Page 3');
  await mainPage.deleteSecondPageViaTrashIcon();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFirstPageNameDisplayed('Page 1');
  await mainPage.isSecondPageAddedToAssetsPanel(false);
});

mainTest(
  'PENPOT-1519 Copy and paste components from Page 1 to Page 2, on Page 2 right-click component and select "Show main component"',
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    const basePage = new BasePage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await mainPage.createDefaultRectangleByCoordinates(300, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.pressCopyShortcut(browserName);
    await mainPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnPageOnLayersPanel(false);
    await mainPage.pressPasteShortcut(browserName);
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await basePage.showMainComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'page-copies-component-show-main.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
  },
);

mainTest(
  qase(
    1526,
    'PENPOT-1526 Add a component from local library to Page 1 and Page 2, edit component on Page 2 and click "Reset overrides"',
  ),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const basePage = new BasePage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createDefaultRectangleByCoordinates(300, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnPageOnLayersPanel(false);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.dragComponentOnCanvas(100, 100);
    await layersPanelPage.openLayersTab();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeHeightAndWidthForLayer('100', '150');
    await basePage.resetOverridesViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'page-copies-component-reset-overrides.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
  },
);

mainTest(
  qase(
    1527,
    'PENPOT-1527 Add a component from local library to Page 1 and Page 2, edit component on Page 2 and click "Update main component"',
  ),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createDefaultRectangleByCoordinates(200, 200);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnPageOnLayersPanel(false);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.dragComponentOnCanvas(500, 500);
    await layersPanelPage.openLayersTab();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.clickComponentFillColorIcon();
    await designPanelPage.setComponentColor('#243E8E');
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.updateMainComponentViaRightClick();
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnPageOnLayersPanel(true);
    await expect(mainPage.viewport).toHaveScreenshot(
      'page-copies-component-update-main.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
  },
);
