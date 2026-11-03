import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';
import { MainMenuComponent } from '@pages/workspace/left-sidebar/main-menu-component';

export class LeftSidebarComponent extends BaseComponent {
  readonly mainMenu: MainMenuComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    // The ⋮ button, the menu and its open submenu; it has no role or label
    this.mainMenu = new MainMenuComponent(
      page,
      root.locator('[class*="left_header__menu-section"]'),
    );
  }
}
