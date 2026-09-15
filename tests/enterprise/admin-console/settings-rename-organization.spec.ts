/**
 * Qase suite: Admin Console > Settings > Rename organization
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

enterprisePageTest.describe('Admin Console > Settings > Rename organization', () => {
  enterprisePageTest(
    qase([3165], 'Rename organization'),
    async ({ orgPage, adminConsolePage, stripePage }) => {
      const orgName = createOrgName();
      const newOrgName = createOrgName();

      await enterprisePageTest.step(
        'Setup: subscribe to Enterprise and create an organization',
        async () => {
          await subscribeAndCreateOrg(
            orgPage,
            adminConsolePage,
            stripePage,
            orgName,
          );
        },
      );

      await enterprisePageTest.step(
        'Open the organization settings modal → pre-filled with current name, creation date shown, Save disabled',
        async () => {
          await adminConsolePage.openSettings();
          await adminConsolePage.isOrgNameInputValue(orgName);
          await adminConsolePage.isOrgCreatedDateVisible();
          await adminConsolePage.isSaveChangesButtonDisabled();
        },
      );

      await enterprisePageTest.step(
        'Change the organization name and click Save changes → success message shown',
        async () => {
          await adminConsolePage.orgNameInput.fill(newOrgName);
          await adminConsolePage.isSaveChangesButtonDisabled(false);
          await adminConsolePage.renameOrganization(newOrgName);
        },
      );
    },
  );

  enterprisePageTest(
    qase([3166], 'Successful rename updates header and organization lists'),
    async ({ orgPage, adminConsolePage, stripePage }) => {
      const orgName = createOrgName();
      const newOrgName = createOrgName();

      await enterprisePageTest.step(
        'Setup: subscribe to Enterprise, create an organization, and rename it',
        async () => {
          await subscribeAndCreateOrg(
            orgPage,
            adminConsolePage,
            stripePage,
            orgName,
          );
          await adminConsolePage.openSettings();
          await adminConsolePage.renameOrganization(newOrgName);
          await adminConsolePage.closeSettingsModal();
        },
      );

      await enterprisePageTest.step(
        'Observe the Admin Console header → displays the new organization name',
        async () => {
          await adminConsolePage.isDisplayingOrganization(newOrgName);
        },
      );

      await enterprisePageTest.step(
        'Open the organization menu dropdown → list is displayed with the new name',
        async () => {
          await adminConsolePage.openOrgSwitcher();
          await adminConsolePage.isOrgListedInSwitcher(newOrgName);
        },
      );
    },
  );
});
