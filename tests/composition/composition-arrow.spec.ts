import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest(qase([3403], 'Create Arrow (Toolbar)'), async () => {
  await mainTest.step(
    'Draw an arrow line via toolbar and verify layer created',
    async () => {
      await mainPage.createArrowByCoordinates(400, 400, 400, 600);
      await mainPage.isCreatedLayerVisible();
      await layersPanelPage.isLayerNameDisplayed('Path');
    },
  );

  await mainTest.step('Verify arrow size and default triangle end cap', async () => {
    await mainPage.clickOnDesignTab();
    await designPanelPage.checkSizeWidth('0.01');
    await designPanelPage.checkSizeHeight('200');
    await expect(designPanelPage.strokeCapStartDropdown).toHaveText('None');
    await expect(designPanelPage.strokeCapEndDropdown).toHaveText('Triangle');
    await expect(mainPage.viewport).toHaveScreenshot('arrow-line.png', {
      mask: mainPage.maskViewport(),
    });
  });
});
