import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';
import { DesignTabComponent } from '@pages/workspace/right-sidebar/design-tab/design-tab-component';
import { InspectTabComponent } from '@pages/workspace/right-sidebar/inspect-tab-component';

export class RightSidebarComponent extends BaseComponent {
  readonly design: DesignTabComponent;
  readonly inspectTabComponent: InspectTabComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.design = new DesignTabComponent(
      page,
      root.getByRole('tabpanel', { name: 'design' }),
    );
    // Viewers get the inspect content straight in the sidebar, with no tab panel.
    this.inspectTabComponent = new InspectTabComponent(page, root);
  }
}
