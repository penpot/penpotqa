import { mainAccountFileTest } from 'fixtures';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
});

mainAccountFileTest(
  qase([897], 'Add export setting via design panel'),
  async ({ mainPage }) => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickAddExportButton();
    await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
  },
);

mainAccountFileTest(
  qase([899], 'Remove export setting via design panel'),
  async ({ mainPage }) => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickAddExportButton();
    await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
    await designPanelPage.clickRemoveExportButton();
    await designPanelPage.isExportElementButtonNotDisplayed();
  },
);

mainAccountFileTest(
  qase([905], 'Export boards to PDF (via main menu)'),
  async ({ mainPage }) => {
    const numBoards: number = 2;

    await mainAccountFileTest.step('Create two boards', async () => {
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportByCoordinates(100, 150);
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportByCoordinates(250, 300);
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step('Select created boards', async () => {
      await mainPage.clickMainMenuButton();
      await mainPage.clickEditMainMenuItem();
      await mainPage.clickSelectAllMainMenuSubItem();
    });

    await mainAccountFileTest.step('Export boards as PDF', async () => {
      await mainPage.clickMainMenuButton();
      await mainPage.clickFileMainMenuItem();
      await mainPage.exportBoardsAsPDFViaMenu(numBoards);
    });
  },
);
