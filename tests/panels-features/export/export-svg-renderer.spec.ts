import { ExportFormat } from '@pages/workspace/design-panel/export-page';
import type { Rgba } from '@pages/workspace/exported-svg-page';
import { exportTest } from '@tests/panels-features/export/export-fixture';
import {
  ExporterLayer,
  ExporterPage,
  RED,
  SHADOW_RECT_CENTER,
} from '@tests/panels-features/export/test-exporter-file';
import { qase } from 'playwright-qase-reporter/playwright';

exportTest.use({ exporterPage: ExporterPage.Shadows });

exportTest(
  qase(
    [3935],
    'SVG export follows the active renderer when WebGL rendering is toggled',
  ),
  async ({ exportPage, layersPanelPage, rendererPage, exportedSvgPage }) => {
    await exportTest.step(
      `Export "${ExporterLayer.Shadow}" as SVG with WebGL rendering on`,
      async () => {
        await layersPanelPage.clickLayerOnLayersTab(ExporterLayer.Shadow);
        await layersPanelPage.isLayerWithNameSelected(ExporterLayer.Shadow);
        await exportPage.addExportWithFormat(ExportFormat.SVG);
        const result = await exportPage.exportElement();
        exportPage.checkExportedInBrowser(result);
        await exportedSvgPage.open(result.download);
        exportedSvgPage.checkFileName('Shadow.svg');
        await exportedSvgPage.checkPixel(
          SHADOW_RECT_CENTER.webgl,
          RED,
          'Red rectangle is shown',
        );
      },
    );

    await exportTest.step(
      'Disable "WebGL rendering (beta)" in Main menu > Preferences',
      async () => {
        await rendererPage.toggleWebglRenderingViaMainMenu(false);
      },
    );

    await exportTest.step(
      `Export "${ExporterLayer.Shadow}" again with the classic renderer`,
      async () => {
        await layersPanelPage.clickLayerOnLayersTab(ExporterLayer.Shadow);
        await layersPanelPage.isLayerWithNameSelected(ExporterLayer.Shadow);
        const result = await exportPage.exportElement();
        exportPage.checkExportedByBackend(result);
        await exportedSvgPage.open(result.download);
        exportedSvgPage.checkFileName('Shadow.svg');
        await exportedSvgPage.checkPixel(
          SHADOW_RECT_CENTER.classic,
          RED,
          'Red rectangle is shown',
        );
      },
    );
  },
);

exportTest.describe('From a blank file', () => {
  exportTest.use({ penpotFile: undefined });

  const ellipseName = 'Ellipse';
  const ellipseFill = '#B1B2B5';
  const ellipseColor: Rgba = { r: 0xb1, g: 0xb2, b: 0xb5, a: 255 };

  exportTest(
    qase([348], 'Export ellipse (SVG) with and without suffix'),
    async ({ mainPage, exportPage, layersPanelPage, exportedSvgPage }) => {
      await exportTest.step('Create a default ellipse and select it', async () => {
        await mainPage.createDefaultEllipseByCoordinates(200, 300);
        await layersPanelPage.isLayerWithNameSelected(ellipseName);
      });

      await exportTest.step('Add an SVG export without suffix', async () => {
        await exportPage.addExportWithFormat(ExportFormat.SVG);
        await exportPage.checkExportSuffix('');
      });

      await exportTest.step('Export the ellipse', async () => {
        const result = await exportPage.exportElement();
        exportPage.checkExportedInBrowser(result);
        await exportedSvgPage.open(result.download);
        exportedSvgPage.checkFileName(`${ellipseName}.svg`);
      });

      await exportTest.step(
        `Check the content of "${ellipseName}.svg"`,
        async () => {
          exportedSvgPage.checkXmlDeclaration();
          await exportedSvgPage.checkSize(100, 100);
          await exportedSvgPage.checkViewBox('0 0 100 100');
          await exportedSvgPage.checkSingleEllipse(
            { x: 50, y: 50 },
            50,
            50,
            ellipseFill,
          );
          await exportedSvgPage.checkNoScreenshotIds();
        },
      );

      await exportTest.step(
        `Compare "${ellipseName}.svg" with the canvas`,
        async () => {
          await exportedSvgPage.checkPixel(
            { x: 50, y: 50 },
            ellipseColor,
            'Grey circle is shown',
          );
          await exportedSvgPage.checkPixel(
            { x: 3, y: 3 },
            'transparent',
            'Nothing shows outside the circle',
          );
        },
      );

      await exportTest.step(
        'Export the ellipse with the "testSVG" suffix',
        async () => {
          await exportPage.fillExportSuffix('testSVG');
          const { download } = await exportPage.exportElement();
          await exportedSvgPage.open(download);
          exportedSvgPage.checkFileName(`${ellipseName}testSVG.svg`);
          await exportedSvgPage.checkSingleEllipse(
            { x: 50, y: 50 },
            50,
            50,
            ellipseFill,
          );
        },
      );
    },
  );
});
