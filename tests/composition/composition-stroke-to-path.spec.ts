import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';
import { expect } from 'playwright/test';

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

mainTest(
  qase([3742], 'Stroke to path on a basic rectangle with a single solid stroke'),
  async () => {
    await mainTest.step('Create a rectangle', async () => {
      await mainPage.pressKeyboardShortcut('R');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
    });

    await mainTest.step('Add a stroke', async () => {
      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.setStrokeWidth('4');
    });

    await mainTest.step(
      'Right-click the shape to open the contextual menu and click Stroke to path',
      async () => {
        await layersPanelPage.clickOnLayerOptionViaRightClickForLayer(
          'Rectangle',
          'Stroke to path',
        );
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'stroke-to-path-rectangle-added.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);
