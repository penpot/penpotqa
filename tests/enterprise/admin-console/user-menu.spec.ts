/**
 * Qase suite: Admin Console > User menu (Organization owner)
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterprisePageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeTest` for cases needing a real second account.
 * Per-case "Accounts:" notes cover invitees needing a real, readable
 * inbox instead (see the enterprise-demo-account-email memory).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { AdminConsoleUserMenuItem } from '@pages/admin-console/admin-console-page';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe('Admin Console > User menu (Organization owner)', () => {
  enterprisePageTest(
    qase([3099], 'User menu is accessible and displays correct content structure'),
    async ({ page, adminConsolePage }) => {
      await enterprisePageTest.step(
        'Open the user menu → all top-level options shown',
        async () => {
          await page.goto('/admin-console');
          await adminConsolePage.openUserMenu();
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.YourAccount,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.DownloadUsageReport,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.HelpAndLearning,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.CommunityAndContributions,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.AboutPenpot,
          );
          await adminConsolePage.isLogoutMenuItemVisible();
        },
      );

      await enterprisePageTest.step(
        'Hover "Help & Learning" → Help Center, Learning Center, Penpot Hub, Give Feedback',
        async () => {
          await adminConsolePage.hoverUserMenuItem(
            AdminConsoleUserMenuItem.HelpAndLearning,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.HelpCenter,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.LearningCenter,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.PenpotHub,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.GiveFeedback,
          );
        },
      );

      await enterprisePageTest.step(
        'Hover "Community & Contributions" → Github repository, Community',
        async () => {
          await adminConsolePage.hoverUserMenuItem(
            AdminConsoleUserMenuItem.CommunityAndContributions,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.GithubRepository,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.Community,
          );
        },
      );

      await enterprisePageTest.step(
        'Hover "About Penpot" → Version notes, Penpot Changelog, Terms of service',
        async () => {
          await adminConsolePage.hoverUserMenuItem(
            AdminConsoleUserMenuItem.AboutPenpot,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.VersionNotes,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.PenpotChangelog,
          );
          await adminConsolePage.isUserMenuItemVisible(
            AdminConsoleUserMenuItem.TermsOfService,
          );
        },
      );
    },
  );
});
