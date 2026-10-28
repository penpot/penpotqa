import { ExportPage } from '@pages/workspace/design-panel/export-page';
import { ExportedSvgPage } from '@pages/workspace/exported-svg-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import {
  EXPORT_QA_PAGE,
  EXPORTER_FILE,
} from '@tests/panels-features/export/test-exporter-file';
import { demoAccountFileTest } from 'fixtures';

type ExportFixtures = {
  exportPage: ExportPage;
  layersPanelPage: LayersPanelPage;
  pagesPanelPage: PagesPanelPage;
  exportedSvgPage: ExportedSvgPage;
  exporterFileRendered: void;
};

// Fresh demo account (WASM, so WebGL rendering is on) with
// documents/test_exporter_file.penpot open in the workspace (see
// ./test-exporter-file.ts). Set `penpotFile: undefined` to start from a blank
// file instead.
// `exportedSvgPage` opens exported SVGs in its own browser context, without a
// Penpot session, as when the downloaded file is opened outside Penpot.
export const exportTest = demoAccountFileTest.extend<ExportFixtures>({
  penpotFile: EXPORTER_FILE,
  exportPage: async ({ page }, use) => use(new ExportPage(page)),
  layersPanelPage: async ({ page }, use) => use(new LayersPanelPage(page)),
  pagesPanelPage: async ({ page }, use) => use(new PagesPanelPage(page)),
  exportedSvgPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(new ExportedSvgPage(await context.newPage()));
    await context.close();
  },
  // The helper file opens on its "Export QA" page, and its first WebGL render
  // blocks the browser for seconds (longer on CI, which renders WebGL on the
  // CPU), so wait for it once before the test starts (after mainPage opens it).
  exporterFileRendered: [
    async ({ mainPage, penpotFile, pagesPanelPage }, use) => {
      if (penpotFile === EXPORTER_FILE) {
        await pagesPanelPage.isPageNameSelected(EXPORT_QA_PAGE, true, 60000);
      }
      await use();
    },
    { auto: true },
  ],
});
