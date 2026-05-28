import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let mainPage: MainPage;
let colorPalettePage: ColorPalettePage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let assetsPanelPage: AssetsPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  mainPage = new MainPage(page);
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

mainTest(qase(1911, 'Download Penpot file (.penpot)'), async () => {
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.downloadPenpotFileViaMenu();
});

mainTest(qase(831, 'Add/Remove as shared library'), async () => {
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.clickAddAsSharedLibraryMainMenuSubItem();
  await assetsPanelPage.clickAddAsSharedLibraryButton();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.isSharedLibraryBadgeVisible();
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.clickRemoveAsSharedLibraryMainMenuSubItem();
  await assetsPanelPage.clickRemoveAsSharedLibraryButton();
  await assetsPanelPage.isSharedLibraryBadgeNotVisible();
});
