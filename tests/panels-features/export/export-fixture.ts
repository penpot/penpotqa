import { ExportPage } from '@pages/workspace/design-panel/export-page';
import { ExportedSvgPage } from '@pages/workspace/exported-svg-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { RendererPage } from '@pages/workspace/main-menu/renderer-page';
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
  rendererPage: RendererPage;
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
  rendererPage: async ({ page }, use) => use(new RendererPage(page)),
  exportedSvgPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(new ExportedSvgPage(await context.newPage()));
    await context.close();
  },
  // Opens the test's page before it starts (after mainPage opens the file), so
  // the test doesn't begin with the page switch. Nothing waits for the canvas
  // render: the pages are kept light so it doesn't block the browser on CI.
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
