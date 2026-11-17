import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import {
  ExportFormat,
  type ExportRowSettings,
  type ExportSectionComponent,
} from '@pages/components/export-section-component';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
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

demoAccountFileTest(
  qase([3962], 'Export an element with several presets including 3x scale'),
  async ({ page, mainPage }) => {
    const designPanelPage = new DesignPanelPage(page);

    await demoAccountFileTest.step(
      'Create a 200x200 rectangle with PNG 1x, PNG 3x, JPG 1x and PDF exports',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(300, 300);
        await designPanelPage.changeHeightAndWidthForLayer('200', '200');
        await mainPage.waitForChangeIsSaved();
        // A new export row is added at the top, so each one is set on row 0
        const presets: ExportRowSettings[] = [
          { format: ExportFormat.PDF },
          { format: ExportFormat.JPG, scale: '1x' },
          { format: ExportFormat.PNG, scale: '3x' },
          { format: ExportFormat.PNG, scale: '1x' },
        ];
        for (const preset of presets) {
          await exportSection.clickAddExportButton();
          await exportSection.setExportRow(0, preset);
        }
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Export the rectangle: the four files are downloaded at the right sizes',
      async () => {
        const { download } = await exportSection.exportElement();
        await exportSection.checkExportedZip(download, [
          { name: 'Rectangle.png', width: 200, height: 200 },
          { name: 'Rectangle-2.png', width: 600, height: 600 },
          { name: 'Rectangle.jpg', width: 200, height: 200 },
          { name: 'Rectangle.pdf' },
        ]);
      },
    );
  },
);
