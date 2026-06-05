import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from 'playwright/test';

const teamName = createTeamName();

let mainPage: MainPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  layersPanelPage = new LayersPanelPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName, browserName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.createDefaultRectangleByCoordinates(100, 100);
  await layersPanelPage.isLayerNameDisplayed('Rectangle');
  await mainPage.createDefaultEllipseByCoordinates(300, 100);
  await layersPanelPage.isLayerNameDisplayed('Ellipse');
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([2940], 'Paste to Replace on single selected shape'), async () => {
  await mainTest.step('Select Rectangle and copy', async () => {
    await layersPanelPage.selectLayerByName('Rectangle');
    await mainPage.copyLayerViaRightClick();
  });

  await mainTest.step('Select Ellipse and paste to replace', async () => {
    await layersPanelPage.selectLayerByName('Ellipse');
    await mainPage.pasteAndReplaceViaShortcut();
    await expect(
      mainPage.viewport,
      'Ellipse should be replaced by Rectangle after Paste to Replace action',
    ).toHaveScreenshot('paste-to-replace-rectangle.png', {
      mask: mainPage.maskViewport(),
    });
  });
});
