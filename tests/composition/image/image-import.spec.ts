import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
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
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(
    [2286],
    'Import rotated Exif JPEG images from toolbar and from shortcut (Shift+K)',
  ),
  async () => {
    await mainTest.step(
      'Upload exif_top_left.jpg and verify dimensions',
      async () => {
        await mainPage.uploadImage('images/exif_top_left.jpg');
        await layersPanelPage.isLayerWithNameSelected('exif_top_left');
        await designPanelPage.checkSizeWidth('1800');
        await designPanelPage.checkSizeHeight('1200');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(
      'Upload exif_top_right.jpg via shortcut and verify dimensions',
      async () => {
        await mainPage.uploadImageViaShortcut('images/exif_top_right.jpg');
        await layersPanelPage.isLayerWithNameSelected('exif_top_right');
        await designPanelPage.checkSizeWidth('1800');
        await designPanelPage.checkSizeHeight('1200');
      },
    );
  },
);
