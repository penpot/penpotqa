import { type Page } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { RightSidebarComponent } from '@pages/workspace/right-sidebar/right-sidebar-component';

/** The file workspace. Exposes one component per UI region. */
export class WorkspacePage extends BasePage {
  readonly rightSidebar: RightSidebarComponent;

  constructor(page: Page) {
    super(page);
    this.rightSidebar = new RightSidebarComponent(
      page,
      page.getByTestId('right-sidebar'),
    );
  }
}
