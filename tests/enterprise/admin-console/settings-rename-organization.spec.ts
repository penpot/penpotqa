/**
 * Qase suite: Admin Console > Settings > Rename organization
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
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
      qase([3165], 'Rename organization'),
      async ({ orgPage, adminConsolePage }) => {
        const orgName = createOrgName();
        const newOrgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: create an organization',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Open the organization settings modal → pre-filled with current name, creation date shown, Save disabled',
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
      },
    );

    enterpriseActivatedPageTest(
      qase([3166], 'Successful rename updates header and organization lists'),
      async ({ orgPage, adminConsolePage }) => {
        const orgName = createOrgName();
        const newOrgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: create an organization and rename it',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openSettings();
            await adminConsolePage.renameOrganization(newOrgName);
            await adminConsolePage.closeSettingsModal();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Observe the Admin Console header → displays the new organization name',
          async () => {
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
