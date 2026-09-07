import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest(
  qase(
    [2286],
    'Import rotated Exif JPEG images from toolbar and from shortcut (Shift+K)',
  ),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Upload exif_top_left.jpg and verify dimensions',
      async () => {
        await mainPage.uploadImage('images/exif_top_left.jpg');
        await layersPanelPage.isLayerWithNameSelected('exif_top_left');
        await designPanelPage.checkSizeWidth('1800');
        await designPanelPage.checkSizeHeight('1200');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Upload exif_top_right.jpg via shortcut and verify dimensions',
      async () => {
        await mainPage.uploadImageViaShortcut('images/exif_top_right.jpg');
        await layersPanelPage.isLayerWithNameSelected('exif_top_right');
        await designPanelPage.checkSizeWidth('1800');
        await designPanelPage.checkSizeHeight('1200');
      },
    );
  },
);
