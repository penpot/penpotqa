import { ProfilePage } from '@pages/profile-page';
import { integrationsTest } from '../your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

integrationsTest(
  qase(
    2749,
    'Delete an existing access token and verify it is removed from the list',
  ),
  async ({ profilePage }: { profilePage: ProfilePage }) => {
    await integrationsTest.step('Create an access token', async () => {
      const accessTokenName = 'Access token test';
      await profilePage.createAccessToken(accessTokenName);
    });
    await integrationsTest.step('Delete the created access token', async () => {
      await profilePage.deleteAccessToken();
    });
    await integrationsTest.step(
      'Reload page and check that the created access token is deleted',
      async () => {
        await profilePage.reloadPage();
        await profilePage.checkNoAccessTokens();
      },
    );
  },
);
