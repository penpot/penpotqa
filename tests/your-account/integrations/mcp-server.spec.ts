import { ProfilePage } from '@pages/profile-page';
import { integrationsTest } from '../your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

integrationsTest(
  qase(
    [2771, 2787, 2770, 2775],
    'Enable MCP generating key, disable MCP, enable MCP with an existing key and delete key',
  ),
  async ({ profilePage }: { profilePage: ProfilePage }) => {
    await integrationsTest.step('Enable MCP', async () => {
      await profilePage.enableMCPServerWithoutKey();
    });
    await integrationsTest.step('Generate MCP key', async () => {
      await profilePage.generateMCPKey();
    });
    await integrationsTest.step('Disable MCP', async () => {
      await profilePage.disableMCPServer();
    });
    await integrationsTest.step(
      'Enable MCP server with an existing MCP key',
      async () => {
        await profilePage.enableMCPServerWithKey();
      },
    );
    await integrationsTest.step('Delete MCP key', async () => {
      await profilePage.deleteMCPKey();
    });
    await integrationsTest.step(
      'Verify state persistence after reload',
      async () => {
        await profilePage.reloadPage();
        await profilePage.checkNoMCPKey();
      },
    );
  },
);
