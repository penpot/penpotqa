/**
 * Qase suite: Admin Console > Settings > Organization logo > Update logo
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
import { createOrgName } from 'helpers/organizations/create-org-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Admin Console > Settings > Organization logo > Update logo',
  () => {
    enterprisePageTest(
      qase([3240], 'Change logo successfully'),
      async ({ orgPage, adminConsolePage, stripePage }) => {
        const orgName = createOrgName();

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise, create an organization, and open its settings',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.openSettings();
          },
        );

        await enterprisePageTest.step(
          'Select a local image → preview updates instantly (not yet saved)',
          async () => {
            await adminConsolePage.isSaveChangesButtonDisabled();
            await adminConsolePage.uploadOrgLogo('images/images.png');
            await adminConsolePage.isOrgLogoShown(orgName);
            await adminConsolePage.isSaveChangesButtonDisabled(false);
          },
        );

        await enterprisePageTest.step(
          'Click "Save changes" → upload completes, success message shown, logo updated',
          async () => {
            await adminConsolePage.saveSettingsChanges();
            await adminConsolePage.isOrgLogoShown(orgName);
          },
        );
      },
    );
  },
);
