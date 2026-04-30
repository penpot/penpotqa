import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let assetsPanelPage: AssetsPanelPage;
let dashboardPage: DashboardPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([1456], 'Delete component Assets tab'), async () => {
  await mainTest.step('Create rectangle component', async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Delete component from assets tab', async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.deleteFileLibraryComponents();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Verify component is deleted from assets tab', async () => {
    await assetsPanelPage.isComponentNotVisibleInAssetsTab();
    await assetsPanelPage.selectTypeFromAllAssetsDropdown('Components');
    await expect(
      assetsPanelPage.assetsTitleText,
      'Assets title should match screenshot after component deletion',
    ).toHaveScreenshot('assets-component-delete.png');
  });
});

mainTest(qase([1345], 'Restore main component from context menu'), async () => {
  await mainTest.step('Create rectangle component and duplicate it', async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Delete main component from assets tab', async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.deleteFileLibraryComponents();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step(
    'Restore main component via right-click on layers panel',
    async () => {
      await layersPanelPage.openLayersTab();
      await layersPanelPage.restoreMainComponentViaRightClick();
      await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
      await mainPage.waitForChangeIsSaved();
    },
  );

  await mainTest.step(
    'Verify restored component is visible in assets tab',
    async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.isComponentVisibleInAssetsTab('Rectangle');
    },
  );
});
