/**
 * Qase suite: Admin Console > Sidebar Menu > Attributes
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts). Attributes
 * have no Penpot API, so the setup creates them from the Attributes tab.
 */
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { qase } from 'playwright-qase-reporter/playwright';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Attributes',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [4048],
        'List attributes alphabetically and bring a newly created one into view',
      ),
      async ({ orgPage, adminConsolePage, attributesPage }) => {
        // More than fit in the list's visible area, so it scrolls
        const attributes = [
          'Accounting',
          'Brand',
          'Contractors',
          'Design',
          'Engineering',
          'Finance',
          'HR',
          'Legal',
          'Marketing',
          'Operations',
          'Product',
          'Research',
          'Sales',
          'Support',
          'UX',
        ];
        const zebraTeam = 'Zebra team';
        const agil = 'Ágil';

        await enterpriseActivatedPageTest.step(
          `Setup: create an org with ${attributes.length} attributes, in reverse alphabetical order`,
          async () => {
            await createOrgForLicensedAccount(orgPage, createOrgName());
            await adminConsolePage.openAttributesTab();
            for (const name of [...attributes].reverse()) {
              await attributesPage.createAttribute(name);
            }
            await adminConsolePage.refreshPage();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Check the order of the list → alphabetical by name, ascending',
          async () => {
            await attributesPage.checkAttributeNames(attributes);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Scroll to the top and create "${zebraTeam}" → the list scrolls down to it, last in the list, and highlights it`,
          async () => {
            await attributesPage.scrollAttributesListToTop();
            await attributesPage.checkAttributeIsOutOfView(attributes.at(-1)!);
            await attributesPage.createAttribute(zebraTeam);
            await attributesPage.checkNewAttributeIsInViewAndHighlighted(zebraTeam);
            await attributesPage.checkAttributeNames([...attributes, zebraTeam]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Scroll to the bottom and create "${agil}" → the list scrolls to it and highlights it`,
          async () => {
            await attributesPage.scrollAttributesListToBottom();
            await attributesPage.createAttribute(agil);
            await attributesPage.checkNewAttributeIsInViewAndHighlighted(agil);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase([4053], 'Reject a duplicate attribute name regardless of letter case'),
      async ({ orgPage, adminConsolePage, attributesPage }) => {
        const ops = 'Ops';
        const opsUpperCase = 'OPS';
        const opsLowerCase = 'ops';
        const opsTeam = 'Ops team';

        await enterpriseActivatedPageTest.step(
          `Setup: create an org with the attribute "${ops}"`,
          async () => {
            await createOrgForLicensedAccount(orgPage, createOrgName());
            await adminConsolePage.openAttributesTab();
            await attributesPage.createAttribute(ops);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Click "New attribute", type "${opsUpperCase}" and click "Create attribute" → duplicate name error, name kept and "Create attribute" disabled`,
          async () => {
            await attributesPage.openCreateAttributeDialog();
            await attributesPage.typeAttributeName(opsUpperCase);
            await attributesPage.clickCreateAttributeButton();
            await attributesPage.checkDuplicateNameErrorIsVisible(opsUpperCase);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Change the name to "${opsLowerCase}" → the error clears`,
          async () => {
            await attributesPage.typeAttributeName(opsLowerCase);
            await attributesPage.checkDuplicateNameErrorIsHidden();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Click "Create attribute" → the error appears again and nothing is created',
          async () => {
            await attributesPage.clickCreateAttributeButton();
            await attributesPage.checkDuplicateNameErrorIsVisible(opsLowerCase);
            await attributesPage.checkAttributeNames([ops]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Change the name to "${opsTeam}" and click "Create attribute" → "${ops}" kept as typed and "${opsTeam}" created`,
          async () => {
            await attributesPage.typeAttributeName(opsTeam);
            await attributesPage.clickCreateAttributeButton();
            await attributesPage.checkCreateAttributeDialogIsHidden();
            await attributesPage.checkAttributeNames([ops, opsTeam]);
          },
        );
      },
    );
  },
);
