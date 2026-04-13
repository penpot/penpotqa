const { ProfilePage } = require('@pages/profile-page');
const { integrationsTest } = require('./your-account-fixture');
const { qase } = require('playwright-qase-reporter/playwright');

integrationsTest(
  qase(
    2749,
    'Delete an existing access token and verify it is removed from the list',
  ),
  async ({ profilePage }) => {
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
