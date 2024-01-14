const { mainTest } = require('../../../fixtures');
const { MainPage } = require('../../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');

const teamName = random().concat('autotest');

let dashboardPage, mainPage, assetsPanelPage, layersPanelPage, designPanelPage;
test.beforeEach(async ({ page }) => {
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

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest('PENPOT-1497 Delete copy component from DEL button', async ({ page }) => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.clickCopyComponentOnLayersTab();
  await designPanelPage.changeAxisXandYForLayer('400', '300');
  await mainPage.waitForChangeIsSaved();
  await mainPage.pressDeleteKeyboardButton()
  await expect(mainPage.viewport).toHaveScreenshot('rectangle-component-delete.png');
});

