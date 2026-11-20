import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignTabComponent } from '@pages/workspace/right-sidebar/design-tab/design-tab-component';
import { GridCellSectionComponent } from '@pages/workspace/right-sidebar/design-tab/grid-cell-section-component';
import { LayoutContainerSectionComponent } from '@pages/workspace/right-sidebar/design-tab/layout-container-section-component';
import { LayoutItemSectionComponent } from '@pages/workspace/right-sidebar/design-tab/layout-item-section-component';
import { InspectTabComponent } from '@pages/workspace/right-sidebar/inspect-tab-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountFileTest } from 'fixtures';

type LayoutFixtures = {
  workspacePage: WorkspacePage;
  design: DesignTabComponent;
  layoutContainer: LayoutContainerSectionComponent;
  layoutItem: LayoutItemSectionComponent;
  gridCell: GridCellSectionComponent;
  inspect: InspectTabComponent;
  designPanelPage: DesignPanelPage;
  layersPanelPage: LayersPanelPage;
  inspectPanelPage: InspectPanelPage;
  colorPalettePage: ColorPalettePage;
};

// Fresh demo account with a blank file open in the workspace, plus the page
// objects the flex and grid layout specs use.
export const layoutTest = demoAccountFileTest.extend<LayoutFixtures>({
  workspacePage: async ({ page }, use) => use(new WorkspacePage(page)),
  design: async ({ workspacePage }, use) => use(workspacePage.rightSidebar.design),
  layoutContainer: async ({ design }, use) => use(design.layoutContainer),
  layoutItem: async ({ design }, use) => use(design.layoutItem),
  gridCell: async ({ design }, use) => use(design.gridCell),
  inspect: async ({ workspacePage }, use) =>
    use(workspacePage.rightSidebar.inspectTabComponent),
  designPanelPage: async ({ page }, use) => use(new DesignPanelPage(page)),
  layersPanelPage: async ({ page }, use) => use(new LayersPanelPage(page)),
  inspectPanelPage: async ({ page }, use) => use(new InspectPanelPage(page)),
  colorPalettePage: async ({ page }, use) => use(new ColorPalettePage(page)),
});
