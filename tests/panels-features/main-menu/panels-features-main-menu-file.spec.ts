import { mainAccountFileTest } from 'fixtures';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';

let assetsPanelPage: AssetsPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest(
  qase([1911], 'Download Penpot file (.penpot)'),
  async ({ mainPage }) => {
    await mainPage.clickMainMenuButton();
    await mainPage.clickFileMainMenuItem();
    await mainPage.downloadPenpotFileViaMenu();
  },
);

mainAccountFileTest(
  qase([831], 'Add/Remove as shared library'),
  async ({ mainPage }) => {
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
  },
);
