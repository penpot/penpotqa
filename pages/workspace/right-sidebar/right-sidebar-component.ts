import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';
import { DesignTabComponent } from '@pages/workspace/right-sidebar/design-tab/design-tab-component';

export class RightSidebarComponent extends BaseComponent {
  readonly design: DesignTabComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.design = new DesignTabComponent(
      page,
      root.getByRole('tabpanel', { name: 'design' }),
    );
  }
}
