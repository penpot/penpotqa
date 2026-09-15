/**
 * Qase suite: Admin Console > Sidebar Menu > People > Members (tab) > Remove
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base fixture: `demoAccountApiFixture` (does NOT grant Enterprise
 * entitlement by itself — see enterprise-fixtures.ts's `enterprisePageTest`/
 * `ownerAndInviteeTest`). Per-case "Accounts:" notes cover invitees
 * needing a real, readable inbox instead (see the
 * enterprise-demo-account-email memory).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { ownerAndInviteeTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

ownerAndInviteeTest.describe(
  'Admin Console > Sidebar Menu > People > Members (tab) > Remove',
  () => {
    ownerAndInviteeTest(
      qase([3143], 'Consequences for a removed member: navigation and message'),
      async ({ invitee, orgPage, adminConsolePage, stripePage }) => {
        const orgName = createOrgName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);

        await ownerAndInviteeTest.step(
          'Setup: subscribe to Enterprise, create an org, and invite the second account',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeTest.step(
          'Invitee accepts the org invite and stays on their own dashboard',
          async () => {
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgName);
            // A fresh navigation — this establishes the live
            // connection the "no longer a member" push needs; otherwise it
            // can silently fail to arrive.
            await invitee.page.goto('/');
            await invitee.page.waitForLoadState('networkidle');
          },
        );

        await ownerAndInviteeTest.step(
          'Owner removes the member from the People table → gone from the list',
          async () => {
            await adminConsolePage.page.reload();
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.removeMemberFromPeopleTable(invitee.name);
            await adminConsolePage.isMemberListedInPeopleTable(invitee.name, false);
          },
        );

        await ownerAndInviteeTest.step(
          "Invitee's own dashboard shows a live notice and reverts to a zero-org account (no org switcher left to open)",
          async () => {
            await inviteeOrgPage.isNoLongerOrgMemberMessageShown(orgName);
            await inviteeOrgPage.isZeroOrgAccountStateShown();
          },
        );
      },
    );

    ownerAndInviteeTest.skip(
      qase([3145], 'Remove a member who is the owner of a team'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3145 for full detail):
         * 1. Log in as org owner, open OrgA members list
         * 2. Click remove next to the team-owning member → confirmation dialog warns about team removal too
         * 3. Confirm → removed from members list, counter updates, success notification
         * 4. Open the team → the team's only admin is now automatically the owner
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    ownerAndInviteeTest.skip(
      qase([3152], 'Remove a member who belongs to multiple teams'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3152 for full detail):
         * 1. Open OrgA members list, click remove on a member of 3 teams → confirmation dialog
         * 2. Confirm → removed from members list, counter updates, success notification
         * 3. Check all 3 teams → member removed from every one, teams still exist
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );
  },
);
