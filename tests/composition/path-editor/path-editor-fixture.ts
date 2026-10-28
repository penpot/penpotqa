import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PathEditorPage } from '@pages/workspace/toolbar/path-editor/path-editor-page';
import { demoAccountFileTest } from 'fixtures';

type PathEditorFixtures = {
  pathEditorPage: PathEditorPage;
  layersPanelPage: LayersPanelPage;
  designPanelPage: DesignPanelPage;
};

// Fresh demo account (WASM) with documents/straight-curved-path.penpot open in the
// workspace (see ./straight-curved-path.ts). The path editor is not opened, so
// tests can prepare the canvas first.
export const pathEditorTest = demoAccountFileTest.extend<PathEditorFixtures>({
  penpotFile: 'documents/straight-curved-path.penpot',
  pathEditorPage: async ({ page }, use) => use(new PathEditorPage(page)),
  layersPanelPage: async ({ page }, use) => use(new LayersPanelPage(page)),
  designPanelPage: async ({ page }, use) => use(new DesignPanelPage(page)),
});
