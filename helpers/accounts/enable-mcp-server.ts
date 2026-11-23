import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';

/**
 * Enables the MCP server for the logged-in profile, as Your account > Integrations
 * does: generates the "MCP key" and turns the MCP server switch on. Call it before
 * the app loads (or reload afterwards) so the UI starts with MCP enabled.
 */
export async function enableMcpServer(request: APIRequestContext) {
  await callPenpotApi(request, 'create-access-token', {
    name: 'MCP key',
    perms: null,
    type: 'mcp',
  });
  await callPenpotApi(request, 'update-profile-props', {
    props: { mcpEnabled: true },
  });
}
