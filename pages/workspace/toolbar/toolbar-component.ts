import { BaseComponent } from '@pages/base-component';
import { McpMenuComponent } from '@pages/components/mcp-menu-component';
import { type Locator, type Page } from '@playwright/test';

/**
 * Drawing toolbar at the top of the viewport. Its drawing tools still live in
 * MainPage (and ToolbarPage) and move here progressively.
 */
export class ToolbarComponent extends BaseComponent {
  readonly mcpMenu: McpMenuComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.mcpMenu = new McpMenuComponent(page, root);
  }
}
