import { BaseComponent } from '@pages/base-component';
import { AccessTokensComponent } from '@pages/your-account/access-tokens-component';
import { McpServerComponent } from '@pages/your-account/mcp-server-component';
import { type Locator, type Page } from '@playwright/test';

/** Your account > Integrations: the MCP Server and Personal access tokens blocks. */
export class IntegrationsSectionComponent extends BaseComponent {
  readonly mcpServer: McpServerComponent;
  readonly accessTokens: AccessTokensComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    // The two blocks are unnamed <section>s, so they're rooted on their class
    this.mcpServer = new McpServerComponent(
      page,
      root.locator('section[class*="mcp-server-section"]'),
    );
    this.accessTokens = new AccessTokensComponent(
      page,
      root.locator('section[class*="access-tokens-section"]'),
    );
  }
}
