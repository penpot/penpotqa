import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';
import { LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import { MainMenuComponent } from '@pages/workspace/left-sidebar/main-menu-component';

export class LeftSidebarComponent extends BaseComponent {
  readonly mainMenu: MainMenuComponent;
  readonly layers: LayersPanelComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);

    this.mainMenu = new MainMenuComponent(
      page,
      root.locator('[class*="left_header__menu-section"]'),
    );
    this.layers = new LayersPanelComponent(page, root.getByTestId('layer-tree'));
  }
}
