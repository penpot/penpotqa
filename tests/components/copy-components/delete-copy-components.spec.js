const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let dashboardPage, mainPage, assetsPanelPage, layersPanelPage, designPanelPage;
mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([1496], 'Undo deleted component'), async ({ browserName }) => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.duplicateLayerViaRightClick();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXAndYForLayer('400', '300');
  await mainPage.pressDeleteKeyboardButton();
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();

  await expect(mainPage.viewport).toHaveScreenshot(
    'rectangle-copy-component-delete.png',
    {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    },
  );

  await mainPage.clickShortcutCtrlZ(browserName);
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();

  await expect(mainPage.viewport).toHaveScreenshot(
    'rectangle-copy-component-delete-undo.png',
    {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    },
  );
});

mainTest(qase([1497], 'Delete copy component from DEL button'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXAndYForLayer('400', '300');
  await mainPage.pressDeleteKeyboardButton();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName(
    'Rectangle',
    false,
  );
});
