import { mainTest } from 'fixtures';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { random } from 'helpers/string-generator';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';

const teamName = random().concat('autotest');

let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let mainPage: MainPage;
let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let colorPalettePage: ColorPalettePage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.createDefaultRectangleByCoordinates(300, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.addFileAsSharedLibraryViaRightclick();
  await dashboardPage.isSharedLibraryIconDisplayed();

  await dashboardPage.createFileViaTitlePanel();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickLibrariesButton();
  await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
  await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
  await dashboardPage.reloadPage();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickLibraryTitle();
  await assetsPanelPage.clickLibraryComponentsTitle();
  await assetsPanelPage.dragAndDropComponentToViewport('Rectangle');
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickPencilBoxButton();
  await dashboardPage.isHeaderDisplayed('Projects');
  await dashboardPage.isFileVisibleByName('New File 2');
  await dashboardPage.checkNumberOfFiles('2 files');
  await dashboardPage.deleteFileWithNameViaRightClick('New File 1');
  await dashboardPage.clickDeleteFileButton();

  await dashboardPage.checkNumberOfFiles('1 file');
  await dashboardPage.openFileWithName('New File 2');
  await mainPage.isSecondPageNameDisplayed('Main components');
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});
