import { ExportPage } from '@pages/workspace/design-panel/export-page';
import { ExportedSvgPage } from '@pages/workspace/exported-svg-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import {
  EXPORTER_FILE,
  ExporterPage,
  type ExporterPageName,
} from '@tests/panels-features/export/test-exporter-file';
import { demoAccountFileTest } from 'fixtures';

type ExportFixtures = {
  /** Option: page of the helper file the test starts on. */
  exporterPage: ExporterPageName;
  exportPage: ExportPage;
  layersPanelPage: LayersPanelPage;
  pagesPanelPage: PagesPanelPage;
  exportedSvgPage: ExportedSvgPage;
  exporterPageOpened: void;
};

// Fresh demo account (WASM, so WebGL rendering is on) with
// documents/test_exporter_file.penpot open in the workspace (see
// ./test-exporter-file.ts), on its `exporterPage` ("Boards" by default). Set
// `penpotFile: undefined` to start from a blank file instead.
// `exportedSvgPage` opens exported SVGs in its own browser context, without a
// Penpot session, as when the downloaded file is opened outside Penpot.
export const exportTest = demoAccountFileTest.extend<ExportFixtures>({
  penpotFile: EXPORTER_FILE,
  exporterPage: [ExporterPage.Boards, { option: true }],
  exportPage: async ({ page }, use) => use(new ExportPage(page)),
  layersPanelPage: async ({ page }, use) => use(new LayersPanelPage(page)),
  pagesPanelPage: async ({ page }, use) => use(new PagesPanelPage(page)),
  exportedSvgPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(new ExportedSvgPage(await context.newPage()));
    await context.close();
  },
  // The first WebGL render of a page blocks the browser for seconds on CI,
  // which renders WebGL on the CPU, so open the page and wait for it before the
  // test starts (after mainPage opens the file).
  exporterPageOpened: [
    async ({ mainPage, penpotFile, exporterPage, pagesPanelPage }, use) => {
      if (penpotFile === EXPORTER_FILE) {
        await pagesPanelPage.clickPageByName(exporterPage);
        await pagesPanelPage.isPageNameSelected(exporterPage);
      }
      await use();
    },
    { auto: true },
  ],
});
