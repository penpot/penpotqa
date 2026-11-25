import { yourAccountTest } from '@tests/profile-menu/your-account/your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

yourAccountTest(
  qase([1204], 'User menu - check menu items (links)'),
  async ({ dashboardPage, yourAccountPage }) => {
    const { profileMenu } = yourAccountPage;

    await yourAccountTest.step('Open account page and verify header', async () => {
      await dashboardPage.isHeaderDisplayed('Personal Projects');
      await yourAccountPage.open();
    });

    await yourAccountTest.step(
      'Open feedback page and verify button state',
      async () => {
        await profileMenu.openGiveFeedback();
        await yourAccountPage.giveFeedback.checkSendButtonIsDisabled();
      },
    );

    await yourAccountTest.step(
      'Verify support links open the correct pages',
      async () => {
        await profileMenu.checkLinkOpensUrl(
          'HelpCenter',
          'https://help.penpot.app/',
        );
        await profileMenu.checkLinkOpensUrl(
          'LearningCenter',
          'https://penpot.app/learning-center',
        );
        await profileMenu.checkLinkOpensUrl(
          'PenpotHub',
          'https://penpot.app/penpothub',
        );
        await profileMenu.checkLinkOpensUrl(
          'GithubRepository',
          'https://github.com/penpot/penpot',
        );
      },
    );

    await yourAccountTest.step(
      'Verify community and legal links open the correct pages',
      async () => {
        await profileMenu.checkLinkOpensUrl(
          'Community',
          'https://community.penpot.app/',
        );
        await profileMenu.checkLinkOpensUrl(
          'PenpotChangelog',
          'https://github.com/penpot/penpot/blob/develop/CHANGES.md',
        );
        await profileMenu.checkLinkOpensUrl(
          'TermsOfService',
          'https://penpot.app/terms',
        );
      },
    );
  },
);
