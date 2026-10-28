import { ExportFormat } from '@pages/workspace/design-panel/export-page';
import { exportTest } from '@tests/panels-features/export/export-fixture';
import {
  ExportQaLayer,
  ROTATED_OUTER_STROKE,
  STROKE_BLUE,
  STROKES,
  WHITE,
} from '@tests/panels-features/export/test-exporter-file';
import { qase } from 'playwright-qase-reporter/playwright';

exportTest(
  qase(
    [3942],
    'SVG export of inner, center and outer solid strokes keeps stroke alignment',
  ),
  async ({ exportPage, layersPanelPage, exportedSvgPage }) => {
    for (const layer of [
      ExportQaLayer.Inner,
      ExportQaLayer.Center,
      ExportQaLayer.Outer,
    ] as const) {
      const { size, stroke, fill } = STROKES[layer];

      await exportTest.step(`Export "${layer}" as SVG`, async () => {
        await layersPanelPage.clickLayerOnLayersTab(layer);
        await layersPanelPage.isLayerWithNameSelected(layer);
        await exportPage.addExportWithFormat(ExportFormat.SVG);
        const { download } = await exportPage.exportElement();
        await exportedSvgPage.open(download);
        exportedSvgPage.checkFileName(`${layer}.svg`);
      });

      await exportTest.step(
        `Check "${layer}.svg" is ${size.width} × ${size.height} with the stroke where the canvas shows it`,
        async () => {
          await exportedSvgPage.checkSize(size.width, size.height);
          await exportedSvgPage.checkPixel(stroke, STROKE_BLUE, 'Stroke is blue');
          await exportedSvgPage.checkPixel(
            fill,
            WHITE,
            'Fill next to the stroke is white',
          );
        },
      );
    }

    await exportTest.step(
      `Rotate the "${ExportQaLayer.Outer}" layer 30°`,
      async () => {
        await exportPage.changeRotationForLayer(ROTATED_OUTER_STROKE.rotation);
        await exportPage.checkRotationForLayer(ROTATED_OUTER_STROKE.rotation);
      },
    );

    await exportTest.step(`Export "${ExportQaLayer.Outer}" again`, async () => {
      const { download } = await exportPage.exportElement();
      await exportedSvgPage.open(download);
      exportedSvgPage.checkFileName(`${ExportQaLayer.Outer}.svg`);
    });

    await exportTest.step(
      `Check the stroke sits outside the rotated rectangle in "${ExportQaLayer.Outer}.svg"`,
      async () => {
        const { size, outside, stroke, fill } = ROTATED_OUTER_STROKE;
        await exportedSvgPage.checkSize(size.width, size.height);
        await exportedSvgPage.checkPixel(
          outside,
          'transparent',
          'Nothing shows outside the rotated shape',
        );
        await exportedSvgPage.checkPixel(stroke, STROKE_BLUE, 'Stroke is blue');
        await exportedSvgPage.checkPixel(
          fill,
          WHITE,
          'Fill next to the stroke is white',
        );
      },
    );
  },
);
