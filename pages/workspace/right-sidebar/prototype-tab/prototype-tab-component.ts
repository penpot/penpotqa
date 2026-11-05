import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';
import { FlowSectionComponent } from '@pages/workspace/right-sidebar/prototype-tab/flow-section-component';
import { InteractionsSectionComponent } from '@pages/workspace/right-sidebar/prototype-tab/interactions-section-component';

export class PrototypeTabComponent extends BaseComponent {
  readonly flow: FlowSectionComponent;
  readonly interactions: InteractionsSectionComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    // Both sections share one class; tell them apart by their title button.
    const section = (title: string) =>
      root
        .locator('[class*="interactions__section"]')
        .filter({ has: page.getByRole('button', { name: title, exact: true }) });
    this.flow = new FlowSectionComponent(page, section('Flow'));
    this.interactions = new InteractionsSectionComponent(
      page,
      section('Interactions'),
    );
  }
}
