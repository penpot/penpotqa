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

test.beforeEach(async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest('Create component shape', async ({ page }) => {
  const mainPage = new MainPage(page);
  const assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isComponentAddedToFileLibraryComponents();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'rectangle-component-asset.png',
    {
      mask: [mainPage.guides],
    },
  );
});

