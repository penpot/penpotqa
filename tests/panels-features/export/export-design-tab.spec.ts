import { demoAccountFileTest } from 'fixtures';
import { ExportPage } from '@pages/workspace/design-panel/export-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';

const defaultNameBoard = 'Board';
let exportPage: ExportPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  exportPage = new ExportPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(
  qase([897], 'Add export setting via design panel'),
  async ({ mainPage }) => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await exportPage.clickAddExportButton();
    await exportPage.isExportElementButtonDisplayed('Export 1 element');
  },
);

demoAccountFileTest(
  qase([899], 'Remove export setting via design panel'),
  async ({ mainPage }) => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await exportPage.clickAddExportButton();
    await exportPage.isExportElementButtonDisplayed('Export 1 element');
    await exportPage.clickRemoveExportButton();
    await exportPage.isExportElementButtonNotDisplayed();
  },
);

demoAccountFileTest(
  qase([905], 'Export boards to PDF (via main menu)'),
  async ({ mainPage }) => {
    const numBoards: number = 2;

    await demoAccountFileTest.step('Create two boards', async () => {
      await mainPage.createDefaultBoardByCoordinates(100, 150);
      await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
      await mainPage.createDefaultBoardByCoordinates(250, 300);
      await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 2);
    });

    await demoAccountFileTest.step('Select created boards', async () => {
      await mainPage.clickMainMenuButton();
      await mainPage.clickEditMainMenuItem();
      await mainPage.clickSelectAllMainMenuSubItem();
    });

    await demoAccountFileTest.step('Export boards as PDF', async () => {
      await mainPage.clickMainMenuButton();
      await mainPage.clickFileMainMenuItem();
      await exportPage.exportBoardsAsPDFViaMenu(numBoards);
    });
  },
);
