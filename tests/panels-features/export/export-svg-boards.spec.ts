import { ExportFormat } from '@pages/components/export-section-component';
import { exportTest } from '@tests/panels-features/export/export-fixture';
import {
  BASIC_BOARD,
  ExporterLayer,
  ExporterPage,
  RED,
} from '@tests/panels-features/export/test-exporter-file';
import { qase } from 'playwright-qase-reporter/playwright';

exportTest(
  qase(
    [3933],
    'SVG export of a board keeps clipping, group opacity and blend mode, and extends bounds when unclipped',
  ),
  async ({ workspacePage, designPanelPage, layersPanelPage, exportedSvgPage }) => {
    const exportSection = workspacePage.rightSidebar.design.export;

    await exportTest.step('Export the "Basic" board as SVG', async () => {
      await layersPanelPage.clickLayerOnLayersTab(ExporterLayer.Basic);
      await layersPanelPage.isLayerWithNameSelected(ExporterLayer.Basic);
      await exportSection.addExportWithFormat(ExportFormat.SVG);
      const { download } = await exportSection.exportElement();
      await exportedSvgPage.open(download);
      exportedSvgPage.checkFileName('Basic.svg');
    });

    await exportTest.step(
      'Check the clip path, group opacity and blend mode in "Basic.svg"',
      async () => {
        await exportedSvgPage.checkSize(
          BASIC_BOARD.size.width,
          BASIC_BOARD.size.height,
        );
        await exportedSvgPage.checkClipPathsWrapContent();
        await exportedSvgPage.checkGroupWithOpacity('0.5');
        await exportedSvgPage.checkGroupWithBlendMode('multiply');
      },
    );

    await exportTest.step('Compare "Basic.svg" with the canvas', async () => {
      await exportedSvgPage.checkPixel(
        BASIC_BOARD.overflowInsideBoard,
        RED,
        '"Overflow" rectangle shows up to the right board edge',
      );
      await exportedSvgPage.checkPixel(
        BASIC_BOARD.halfTransparentSquare,
        BASIC_BOARD.halfTransparentSquareColor,
        '"Group 50%" squares are half transparent',
      );
      await exportedSvgPage.checkPixel(
        BASIC_BOARD.multiplyRect,
        BASIC_BOARD.multiplyRectColor,
        '"Multiply" rectangle darkens what is under it',
      );
    });

    await exportTest.step(
      'Disable "Clip content" for the "Basic" board and export it again',
      async () => {
        await designPanelPage.clickOnClipContentButton();
        const { download } = await exportSection.exportElement();
        await exportedSvgPage.open(download);
        exportedSvgPage.checkFileName('Basic.svg');
      },
    );

    await exportTest.step(
      'Check the "Overflow" rectangle is fully visible in the new "Basic.svg"',
      async () => {
        await exportedSvgPage.checkSize(
          BASIC_BOARD.unclippedSize.width,
          BASIC_BOARD.unclippedSize.height,
        );
        await exportedSvgPage.checkPixel(
          BASIC_BOARD.overflowOutsideBoard,
          RED,
          '"Overflow" rectangle shows beyond the board edge',
        );
      },
    );
  },
);

exportTest(
  qase(
    [3934],
    'Export selection of several elements as SVG downloads a ZIP with one SVG per element',
  ),
  async ({ workspacePage, layersPanelPage }) => {
    const exportSection = workspacePage.rightSidebar.design.export;

    const layers = [ExporterLayer.Rect, ExporterLayer.Basic, ExporterLayer.Fills];

    await exportTest.step(
      'Select the "Rect", "Basic" and "Fills" layers holding Ctrl',
      async () => {
        await layersPanelPage.ctrlSelectLayersOnLayersTabByName(layers);
        for (const layer of layers) {
          await layersPanelPage.isLayerWithNameSelected(layer);
        }
      },
    );

    await exportTest.step('Add an SVG export to the selection', async () => {
      await exportSection.addExportWithFormat(ExportFormat.SVG);
    });

    await exportTest.step(
      'Export the 3 elements from the "Export selection" dialog',
      async () => {
        const result = await exportSection.exportElementsFromDialog(layers.length);
        exportSection.checkDownloadedFileName(
          result.download,
          `${ExporterPage.Boards}.zip`,
        );
        exportSection.checkExportedByBackend(result, '/api/export/jobs');
      },
    );
  },
);
