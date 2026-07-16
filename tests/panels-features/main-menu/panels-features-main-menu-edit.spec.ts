import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { createTeamName } from 'helpers/teams/create-team-name';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect, test } from '@playwright/test';

const teamName = createTeamName();

let mainPage: MainPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.createTextLayerByCoordinates(200, 200, 'Test 1');
  await mainPage.clickViewportTwice();
  await mainPage.createTextLayerByCoordinates(200, 400, 'Test 2');
  await mainPage.clickViewportTwice();
  await mainPage.createTextLayerByCoordinates(200, 600, 'Test 3');
  await mainPage.clickViewportTwice();
  await mainPage.openFindAndReplaceViaShortcut();
});

mainTest(qase([2882], 'Replace All updates text content on canvas'), async () => {
  const contentText = 'Test';
  const replaceContentText = 'Bar';

  await test.step('Select "Text content" scope in Find & Replace', async () => {
    await layersPanelPage.selectFindAndReplaceOption('Text content');
  });

  await test.step('Search for "Test" and verify all three layers are found', async () => {
    await layersPanelPage.searchLayer(contentText);
    await layersPanelPage.isLayerNameDisplayed('Test 1');
    await layersPanelPage.isLayerNameDisplayed('Test 2');
    await layersPanelPage.isLayerNameDisplayed('Test 3');
  });

  await test.step('Replace all occurrences with "Bar" and verify updated names', async () => {
    await layersPanelPage.fillReplaceWithInput(replaceContentText);
    await layersPanelPage.clickReplaceAllButton();
    await layersPanelPage.searchLayer(replaceContentText);
    await layersPanelPage.isLayerNameDisplayed('Bar 1');
    await layersPanelPage.isLayerNameDisplayed('Bar 2');
    await layersPanelPage.isLayerNameDisplayed('Bar 3');
    await expect(mainPage.viewport).toHaveScreenshot(
      'replace-all-text-content.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });

  await test.step('Search for "Test" and verify original names are no longer present', async () => {
    await layersPanelPage.clearLayerSearchBar();
    await layersPanelPage.searchLayer(contentText);
    await layersPanelPage.isLayerNameNotDisplayed('Test 1');
    await layersPanelPage.isLayerNameNotDisplayed('Test 2');
    await layersPanelPage.isLayerNameNotDisplayed('Test 3');
  });
});

mainTest(qase([2883], 'Replace All updates layer names'), async () => {
  const layerName = 'Test';
  const replaceLayerName = 'Final';

  await test.step('Select "Layer name" scope in Find & Replace', async () => {
    await layersPanelPage.selectFindAndReplaceOption('Layer names');
  });

  await test.step('Search for "Test" and verify all three layers are found', async () => {
    await layersPanelPage.searchLayer(layerName);
    await layersPanelPage.isLayerNameDisplayed('Test 1');
    await layersPanelPage.isLayerNameDisplayed('Test 2');
    await layersPanelPage.isLayerNameDisplayed('Test 3');
  });

  await test.step('Replace all occurrences with "Final" and verify updated names', async () => {
    await layersPanelPage.fillReplaceWithInput(replaceLayerName);
    await layersPanelPage.clickReplaceAllButton();
    await layersPanelPage.searchLayer(replaceLayerName);
    await layersPanelPage.isLayerNameDisplayed('Final 1');
    await layersPanelPage.isLayerNameDisplayed('Final 2');
    await layersPanelPage.isLayerNameDisplayed('Final 3');
  });

  await test.step('Search for "Test" and verify original names are no longer present', async () => {
    await layersPanelPage.clearLayerSearchBar();
    await layersPanelPage.searchLayer(layerName);
    await layersPanelPage.isLayerNameNotDisplayed('Test 1');
    await layersPanelPage.isLayerNameNotDisplayed('Test 2');
    await layersPanelPage.isLayerNameNotDisplayed('Test 3');
  });
});
