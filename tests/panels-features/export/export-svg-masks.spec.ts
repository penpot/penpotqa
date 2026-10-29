import { ExportFormat } from '@pages/workspace/design-panel/export-page';
import { exportTest } from '@tests/panels-features/export/export-fixture';
import {
  ExporterLayer,
  ExporterPage,
  MASK_FILL,
  MASKED,
  MASKED_SHADOW,
  SOFT_MASK,
} from '@tests/panels-features/export/test-exporter-file';
import { qase } from 'playwright-qase-reporter/playwright';

exportTest.use({ exporterPage: ExporterPage.Masks });

exportTest(
  qase(
    [3937],
    'SVG export of masked groups uses alpha masks, including soft masks and masks with shadows',
  ),
  async ({ exportPage, layersPanelPage, exportedSvgPage }) => {
    await exportTest.step('Export "Masked" as SVG', async () => {
      await layersPanelPage.clickLayerOnLayersTab(ExporterLayer.Masked);
      await layersPanelPage.isLayerWithNameSelected(ExporterLayer.Masked);
      await exportPage.addExportWithFormat(ExportFormat.SVG);
      const { download } = await exportPage.exportElement();
      await exportedSvgPage.open(download);
      exportedSvgPage.checkFileName('Masked.svg');
    });

    await exportTest.step('Check "Masked.svg"', async () => {
      await exportedSvgPage.checkAlphaMasksWrapContent('ellipse');
      await exportedSvgPage.checkMaskedGroupsContainPenpotImages(1);
      await exportedSvgPage.checkPixel(
        MASKED.insideEllipse,
        MASK_FILL,
        'Blue fill shows inside the ellipse',
      );
      // Penpot doesn't serve its images outside its own domain (expected)
      await exportedSvgPage.checkPixel(
        MASKED.photoHalf,
        MASK_FILL,
        'The photo is not loaded outside Penpot, so the fill behind it shows',
      );
      await exportedSvgPage.checkPixel(
        MASKED.outsideEllipse,
        'transparent',
        'Nothing shows outside the ellipse',
      );
    });

    await exportTest.step('Export "Soft mask" as SVG', async () => {
      await layersPanelPage.clickLayerOnLayersTab(ExporterLayer.SoftMask);
      await layersPanelPage.isLayerWithNameSelected(ExporterLayer.SoftMask);
      await exportPage.addExportWithFormat(ExportFormat.SVG);
      const { download } = await exportPage.exportElement();
      await exportedSvgPage.open(download);
      exportedSvgPage.checkFileName('Soft mask.svg');
    });

    await exportTest.step('Check "Soft mask.svg"', async () => {
      await exportedSvgPage.checkAlphaMasksWrapContent('ellipse');
      const opacity = SOFT_MASK.maskOpacity * 255;
      await exportedSvgPage.checkAlphaBetween(
        SOFT_MASK.center,
        opacity - 5,
        opacity + 5,
        'Content is partly see-through, as on the canvas',
      );
      await exportedSvgPage.checkPixel(
        SOFT_MASK.outsideEllipse,
        'transparent',
        'Nothing shows outside the ellipse',
      );
    });

    await exportTest.step('Export "Masked shadow" as SVG', async () => {
      await layersPanelPage.clickLayerOnLayersTab(ExporterLayer.MaskedShadow);
      await layersPanelPage.isLayerWithNameSelected(ExporterLayer.MaskedShadow);
      await exportPage.addExportWithFormat(ExportFormat.SVG);
      const { download } = await exportPage.exportElement();
      await exportedSvgPage.open(download);
      exportedSvgPage.checkFileName('Masked shadow.svg');
    });

    await exportTest.step('Check "Masked shadow.svg"', async () => {
      await exportedSvgPage.checkAlphaMasksWrapContent('ellipse');
      await exportedSvgPage.checkPixel(
        MASKED_SHADOW.insideEllipse,
        MASK_FILL,
        'Blue fill shows inside the ellipse',
      );
      await exportedSvgPage.checkAlphaBetween(
        MASKED_SHADOW.shadowPastRightEdge,
        60,
        160,
        'Drop shadow shows past the right edge of the ellipse',
      );
      await exportedSvgPage.checkAlphaBetween(
        MASKED_SHADOW.shadowBelowBottomEdge,
        60,
        160,
        'Drop shadow shows below the bottom edge of the ellipse',
      );
      await exportedSvgPage.checkPixel(
        MASKED_SHADOW.emptyCorner,
        'transparent',
        'Drop shadow follows the ellipse, not a rectangle (empty corner)',
      );
    });
  },
);
