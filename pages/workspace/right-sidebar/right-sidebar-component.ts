import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';
import { DesignTabComponent } from '@pages/workspace/right-sidebar/design-tab/design-tab-component';
import { ExportProgressComponent } from '@pages/workspace/right-sidebar/export-progress-component';
import { InspectTabComponent } from '@pages/workspace/right-sidebar/inspect-tab-component';

export class RightSidebarComponent extends BaseComponent {
  readonly design: DesignTabComponent;
  readonly inspectTabComponent: InspectTabComponent;
  readonly exportProgress: ExportProgressComponent;
  readonly viewerInspectComponent: InspectTabComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.design = new DesignTabComponent(
      page,
      root.getByRole('tabpanel', { name: 'design' }),
    );
    // Editors: the Inspect tab's panel.
    this.inspectTabComponent = new InspectTabComponent(
      page,
      root.getByRole('tabpanel', { name: 'inspect' }),
    );
    this.exportProgress = new ExportProgressComponent(
      page,
      root.locator('[class*="export-progress-modal"]'),
    );
    // Viewers have no tab switcher: the inspect content is the sidebar itself.
    this.viewerInspectComponent = new InspectTabComponent(page, root);
  }
}
