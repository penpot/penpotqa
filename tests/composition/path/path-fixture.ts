import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import { PathEditorPage } from '@pages/workspace/toolbar/path-editor/path-editor-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountFileTest } from 'fixtures';

type PathFixtures = {
  workspacePage: WorkspacePage;
  pathEditorPage: PathEditorPage;
  layers: LayersPanelComponent;
  layersPanelPage: LayersPanelPage;
  designPanelPage: DesignPanelPage;
};

// Fresh demo account with a blank file open in the workspace, for tests that
// draw their own shapes.
export const pathTest = demoAccountFileTest.extend<PathFixtures>({
  workspacePage: async ({ page }, use) => use(new WorkspacePage(page)),
  pathEditorPage: async ({ page }, use) => use(new PathEditorPage(page)),
  layers: async ({ workspacePage }, use) => use(workspacePage.leftSidebar.layers),
  layersPanelPage: async ({ page }, use) => use(new LayersPanelPage(page)),
  designPanelPage: async ({ page }, use) => use(new DesignPanelPage(page)),
});

// Same, with documents/straight-curved-path.penpot open instead of a blank file
// (see ./straight-curved-path.ts). The path editor is not opened, so tests can
// prepare the canvas first.
export const pathEditorTest = pathTest.extend({
  penpotFile: 'documents/straight-curved-path.penpot',
});
