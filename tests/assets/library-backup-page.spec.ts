import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { mainAccountFileTest } from 'fixtures';

let pagesPanelPage: PagesPanelPage;
let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let colorPalettePage: ColorPalettePage;

mainAccountFileTest.beforeEach(async ({ page, dashboardPage, mainPage }) => {
  pagesPanelPage = new PagesPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
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
  await pagesPanelPage.isSecondPageNameDisplayed('Main components');
});
