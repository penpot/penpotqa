import { integrationsTest } from '@tests/profile-menu/your-account/your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

integrationsTest(
  qase(
    [2749],
    'Delete an existing access token and verify it is removed from the list',
  ),
  async ({ yourAccountPage }) => {
    const { accessTokens } = yourAccountPage.integrations;
    await integrationsTest.step('Create an access token', async () => {
      const accessTokenName = 'Access token test';
      await accessTokens.createToken(accessTokenName);
    });
    await integrationsTest.step('Delete the created access token', async () => {
      await accessTokens.deleteToken();
    });
    await integrationsTest.step(
      'Reload page and check that the created access token is deleted',
      async () => {
        await yourAccountPage.reloadPage();
        await accessTokens.checkNoTokens();
      },
    );
  },
);
