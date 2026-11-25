/**
 * Qase suite: Admin Console > Sidebar Menu > People > Members (tab) > Member profile
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts), with the
 * members as extra demo accounts that join the org via the API
 * (`createDemoMember()` + `joinOrganization()`), so no email is involved.
 */
import { type AssignableAttribute } from '@pages/admin-console/member-profile-component';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { joinOrganization } from 'helpers/organizations/join-organization';
import { qase } from 'playwright-qase-reporter/playwright';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > People > Members (tab) > Member profile',
  () => {
    enterpriseActivatedPageTest(
      qase([4080], "Assign an attribute from a member's profile"),
      async ({
        page,
        orgPage,
        adminConsolePage,
        attributesPage,
        createDemoMember,
      }) => {
        const user2 = await createDemoMember('User2');
        const profile = adminConsolePage.memberProfile;
        const auditor: AssignableAttribute = {
          name: 'Auditor',
          people: 0,
          description: 'Read-only access for the yearly audit',
        };
        const legal: AssignableAttribute = {
          name: 'Legal',
          people: 0,
          description: 'Legal department',
        };
        const qaDepartment: AssignableAttribute = {
          name: 'QA department',
          people: 0,
        };
        const teamLead: AssignableAttribute = { name: 'Team lead', people: 0 };

        await enterpriseActivatedPageTest.step(
          `Setup: Enterprise already active (activation code), create an org with the attributes "${auditor.name}", "${legal.name}", "${qaDepartment.name}" and "${teamLead.name}", and make "${user2.name}" a member`,
          async () => {
            await createOrgForLicensedAccount(orgPage, createOrgName());
            await joinOrganization(
              page.context().request,
              adminConsolePage.getOrganizationId(),
              [user2],
            );
            await adminConsolePage.refreshPage();
            await adminConsolePage.openAttributesTab();
            for (const { name, description } of [
              auditor,
              legal,
              qaDepartment,
              teamLead,
            ]) {
              await attributesPage.createAttribute(name, description);
            }
            await adminConsolePage.openPeopleTab();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open "${user2.name}"'s profile → no attributes, only "Assign attribute"`,
          async () => {
            await adminConsolePage.openMemberProfile(user2.name);
            await profile.checkMemberProfileIsVisible(user2.name, user2.email);
            await profile.checkAssignedAttributes([]);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Open "Assign attribute" → the 4 attributes with their people count and description',
          async () => {
            await profile.openAssignAttributeDropdown();
            await profile.checkAssignableAttributes([
              auditor,
              legal,
              qaDepartment,
              teamLead,
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Search "leg" → only "${legal.name}" is left`,
          async () => {
            await profile.searchAttribute('leg');
            await profile.checkAssignableAttributes([legal]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Assign "${legal.name}" → listed straight away, with no confirmation`,
          async () => {
            await profile.assignAttribute(legal.name);
            await profile.checkAssignedAttributes([legal.name]);
            await adminConsolePage.checkConfirmationIsVisible(false);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open "Assign attribute" again → "${legal.name}" is not offered`,
          async () => {
            await profile.openAssignAttributeDropdown();
            await profile.checkAssignableAttributes([
              auditor,
              qaDepartment,
              teamLead,
            ]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Close the dropdown and reload → "${user2.name}"'s profile is still open with "${legal.name}"`,
          async () => {
            await profile.closeAssignAttributeDropdown();
            await adminConsolePage.refreshPage();
            await profile.checkMemberProfileIsVisible(user2.name, user2.email);
            await profile.checkAssignedAttributes([legal.name]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open Attributes → "${legal.name}" shows 1 under People`,
          async () => {
            await adminConsolePage.openAttributesTab();
            await attributesPage.checkAttributePeopleCount(legal.name, 1);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase([4081], "Remove an attribute from a member's profile"),
      async ({
        page,
        orgPage,
        adminConsolePage,
        attributesPage,
        createDemoMember,
      }) => {
        const user3 = await createDemoMember('User3');
        const profile = adminConsolePage.memberProfile;
        const legal = 'Legal';
        const qaDepartment = 'QA department';

        await enterpriseActivatedPageTest.step(
          `Setup: Enterprise already active (activation code), create an org where member "${user3.name}" holds "${legal}" and "${qaDepartment}"`,
          async () => {
            await createOrgForLicensedAccount(orgPage, createOrgName());
            await joinOrganization(
              page.context().request,
              adminConsolePage.getOrganizationId(),
              [user3],
            );
            await adminConsolePage.refreshPage();
            await adminConsolePage.openAttributesTab();
            for (const name of [legal, qaDepartment]) {
              await attributesPage.createAttribute(name);
              await attributesPage.addPeopleToAttribute(name, [user3.name]);
            }
            await adminConsolePage.openPeopleTab();
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open "${user3.name}"'s profile → "${legal}" and "${qaDepartment}" are listed`,
          async () => {
            await adminConsolePage.openMemberProfile(user3.name);
            await profile.checkAssignedAttributes([legal, qaDepartment]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Remove "${legal}" → gone straight away, with no confirmation or message, and "${qaDepartment}" stays`,
          async () => {
            await profile.removeAttribute(legal);
            await profile.checkAssignedAttributes([qaDepartment]);
            await adminConsolePage.checkConfirmationIsVisible(false);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Open "Assign attribute" → "${legal}" is offered again, with 0 people`,
          async () => {
            await profile.openAssignAttributeDropdown();
            await profile.checkAssignableAttributes([{ name: legal, people: 0 }]);
          },
        );

        await enterpriseActivatedPageTest.step(
          `Close the dropdown and open Attributes → "${legal}" shows 0 and "${qaDepartment}" 1 under People`,
          async () => {
            await profile.closeAssignAttributeDropdown();
            await adminConsolePage.openAttributesTab();
            await attributesPage.checkAttributePeopleCount(legal, 0);
            await attributesPage.checkAttributePeopleCount(qaDepartment, 1);
          },
        );
      },
    );
  },
);
