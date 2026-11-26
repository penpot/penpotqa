/**
 * Qase suite: Admin Console > Settings > Rename organization
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
  'Admin Console > Settings > Rename organization',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3165, 3166],
        'Rename organization, and the header and organization lists show the new name',
      ),
      async ({ orgPage, adminConsolePage }) => {
        const orgName = createOrgName();
        const newOrgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          '(3165) Open the organization settings modal → pre-filled with current name, creation date shown, Save disabled',
          async () => {
            await adminConsolePage.openSettings();
            await adminConsolePage.isOrgNameInputValue(orgName);
            await adminConsolePage.isOrgCreatedDateVisible();
            await adminConsolePage.isSaveChangesButtonDisabled();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Change the organization name and click Save changes → success message shown',
          async () => {
            await adminConsolePage.orgNameInput.fill(newOrgName);
            await adminConsolePage.isSaveChangesButtonDisabled(false);
            await adminConsolePage.renameOrganization(newOrgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          '(3166) Close the settings modal and observe the Admin Console header → displays the new organization name',
          async () => {
            await adminConsolePage.closeSettingsModal();
            await adminConsolePage.isDisplayingOrganization(newOrgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Open the organization menu dropdown → list is displayed with the new name',
          async () => {
            await adminConsolePage.openOrgSwitcher();
            await adminConsolePage.isOrgListedInSwitcher(newOrgName);
          },
        );
      },
    );
  },
);
