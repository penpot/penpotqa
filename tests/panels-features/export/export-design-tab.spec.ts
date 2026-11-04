import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import type { ExportSectionComponent } from '@pages/components/export-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const defaultNameBoard = 'Board';
let workspacePage: WorkspacePage;
let exportSection: ExportSectionComponent;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  workspacePage = new WorkspacePage(page);
  exportSection = workspacePage.rightSidebar.design.export;
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(
  qase([897], 'Add export setting via design panel'),
  async ({ mainPage }) => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await exportSection.clickAddExportButton();
    await exportSection.checkExportElementButton('Export 1 element');
  },
);

demoAccountFileTest(
  qase([899], 'Remove export setting via design panel'),
  async ({ mainPage }) => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await exportSection.clickAddExportButton();
    await exportSection.checkExportElementButton('Export 1 element');
    await exportSection.clickRemoveExportButton();
    await exportSection.checkExportElementButtonIsHidden();
  },
);

demoAccountFileTest(
  qase([905], 'Export boards to PDF (via main menu)'),
  async ({ mainPage }) => {
    const numBoards: number = 2;
    const { mainMenu } = workspacePage.leftSidebar;

    await demoAccountFileTest.step('Create two boards', async () => {
      await mainPage.createDefaultBoardByCoordinates(100, 150);
      await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
      await mainPage.createDefaultBoardByCoordinates(250, 300);
      await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 2);
    });

    await demoAccountFileTest.step('Select created boards', async () => {
      await mainMenu.selectAll();
    });

    await demoAccountFileTest.step('Export boards as PDF', async () => {
      await mainMenu.clickMainMenuButton();
      await mainMenu.clickFileMainMenuItem();
      await mainMenu.clickExportBoardsAsPDFMenuSubItem();
      await workspacePage.exportModal.exportBoardsAsPDF();
      await workspacePage.rightSidebar.exportProgress.checkExportComplete(numBoards);
    });
  },
);
