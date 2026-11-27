/**
 * Qase suite: Admin Console > Settings > Organization logo > Update logo
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) — these
 * cases don't exercise the checkout UI itself, so the account is
 * Enterprise-entitled via the activation-code path (PRE/dev only) instead
 * of a real Stripe checkout.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Admin Console > Settings > Organization logo > Update logo',
  () => {
    enterpriseActivatedPageTest(
      qase([3240], 'Change logo successfully'),
      async ({ orgPage, adminConsolePage }) => {
        const orgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization, and open its settings',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openSettings();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Select a local image → preview updates instantly (not yet saved)',
          async () => {
            await adminConsolePage.isSaveChangesButtonDisabled();
            await adminConsolePage.uploadOrgLogo('images/images.png');
            await adminConsolePage.isOrgLogoShown(orgName);
            await adminConsolePage.isSaveChangesButtonDisabled(false);
          },
        );

        await enterpriseActivatedPageTest.step(
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
