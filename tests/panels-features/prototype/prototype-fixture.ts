import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PrototypeTabComponent } from '@pages/workspace/right-sidebar/prototype-tab/prototype-tab-component';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { PrototypeOverlayComponent } from '@pages/workspace/viewport/prototype-overlay-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountFileTest } from 'fixtures';

type PrototypeFixtures = {
  workspacePage: WorkspacePage;
  prototypeTab: PrototypeTabComponent;
  prototypeOverlay: PrototypeOverlayComponent;
  layersPanelPage: LayersPanelPage;
  viewModePage: ViewModePage;
};

// Fresh demo account (WASM) with a blank file open in the workspace. The
// Prototype tab is not opened, so tests can draw their boards first.
// `viewModePage` drives the workspace tab; view mode itself opens in a popup.
export const prototypeTest = demoAccountFileTest.extend<PrototypeFixtures>({
  workspacePage: async ({ page }, use) => use(new WorkspacePage(page)),
  prototypeTab: async ({ workspacePage }, use) =>
    use(workspacePage.rightSidebar.prototype),
  prototypeOverlay: async ({ workspacePage }, use) =>
    use(workspacePage.prototypeOverlay),
  layersPanelPage: async ({ page }, use) => use(new LayersPanelPage(page)),
  viewModePage: async ({ page }, use) => use(new ViewModePage(page)),
});
