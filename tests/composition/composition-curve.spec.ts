import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let dashboardPage: DashboardPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.describe(() => {
  mainTest(qase([483], 'Create curve line (Toolbar)'), async () => {
    await mainTest.step('Draw curve on canvas', async () => {
      await mainPage.clickCreateCurveButton();
      await mainPage.drawCurve(900, 300, 600, 200);
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify curve layer is created', async () => {
      await mainPage.isCreatedLayerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('curve.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase([485], 'Rename path, that was created with curve with valid name'),
    async () => {
      await mainTest.step('Draw curve on canvas', async () => {
        await mainPage.clickCreateCurveButton();
        await mainPage.drawCurve(900, 300, 600, 200);
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Rename the curve path layer', async () => {
        await layersPanelPage.doubleClickLayerOnLayersTab('Path');
        await layersPanelPage.typeNameCreatedLayerAndEnter('renamed curve');
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify layer has the new name', async () => {
        await layersPanelPage.isLayerNameDisplayed('renamed curve');
      });
    },
  );
});
