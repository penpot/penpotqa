/**
 * Qase suite: Admin Console > Sidebar Menu > People > Members (tab) > Remove
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base fixture: `ownerAndInviteeActivatedTest` (see enterprise-fixtures.ts)
 * — the owner is Enterprise-entitled via the activation-code path,
 * skipping the Stripe checkout UI. PRE/dev environments only — skips
 * automatically wherever `LICENSES_MANAGER_URL` is unset. Per-case
 * "Accounts:" notes cover invitees needing a real, readable inbox instead
 * (see the enterprise-demo-account-email memory).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { waitMessage, waitSecondMessage } from 'helpers/gmail';
import { createInviteeSession } from 'helpers/accounts/create-invitee-session';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { ownerAndInviteeActivatedTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

ownerAndInviteeActivatedTest.describe(
  'Admin Console > Sidebar Menu > People > Members (tab) > Remove',
  () => {
    ownerAndInviteeActivatedTest(
      qase([3143], 'Consequences for a removed member: navigation and message'),
      async ({ invitee, orgPage, adminConsolePage }) => {
        const orgName = createOrgName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);

        await ownerAndInviteeActivatedTest.step(
          'Setup: create an org (Enterprise-activated) and invite the second account',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.invitePersonToOrganization(invitee.email);
          },
        );

        await ownerAndInviteeActivatedTest.step(
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

        await ownerAndInviteeActivatedTest.step(
          'Owner removes the member from the People table → gone from the list',
          async () => {
            await adminConsolePage.page.reload();
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.removeMemberFromPeopleTable(invitee.name);
            await adminConsolePage.isMemberListedInPeopleTable(invitee.name, false);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          "Invitee's own dashboard shows a live notice and reverts to a zero-org account (no org switcher left to open)",
          async () => {
            await inviteeOrgPage.isNoLongerOrgMemberMessageShown(orgName);
            await inviteeOrgPage.isZeroOrgAccountStateShown();
          },
        );
      },
    );

    ownerAndInviteeActivatedTest(
      qase([3145], 'Remove a member who is the owner of a team'),
      async ({ browser, invitee, orgPage, adminConsolePage }) => {
        // Real Gmail waits for 2 accepted invites (invitee's own, plus the
        // team admin's) don't fit the default per-test budget.
        ownerAndInviteeActivatedTest.slow();

        const orgName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);
        const admin = await createInviteeSession(browser, 'admin');

        await ownerAndInviteeActivatedTest.step(
          'Setup: create an org (Enterprise-activated) and invite the second account',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.invitePersonToOrganization(invitee.email);
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgName);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Invitee creates a team (becomes its owner) and invites a third account as Admin',
          async () => {
            // Without this, the new team lands outside the org (invitee's
            // personal team list), so the org never sees invitee as
            // belonging to any team — no removal dialog, ever.
            await inviteeOrgPage.switchToOrg(orgName);
            await inviteeTeamPage.createTeam(teamName);
            await inviteeTeamPage.openInvitationsPageViaOptionsMenu();
            await inviteeTeamPage.clickInviteMembersToTeamButton();
            await inviteeTeamPage.enterEmailToInviteMembersPopUp(admin.email);
            await inviteeTeamPage.selectInvitationRoleInPopUp('Admin');
            await inviteeTeamPage.clickSendInvitationButton();

            await waitSecondMessage(invitee.page, admin.email, 40);
            const invite = await waitMessage(invitee.page, admin.email, 40);
            const adminDashboardPage = new DashboardPage(admin.page);
            await admin.page.goto(invite!.inviteUrl);
            await adminDashboardPage.isSuccessMessageDisplayed(
              'Joined the team successfully',
            );
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Owner removes the team-owning member → confirmation dialog → confirm',
          async () => {
            await adminConsolePage.page.reload();
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.removeMemberFromPeopleTable(invitee.name);
            await adminConsolePage.isRemoveMemberDialogShown(
              invitee.name,
              'The user will also be removed from all teams they were part of.',
            );
            await adminConsolePage.confirmRemoveMember(invitee.name);
            await adminConsolePage.isMemberListedInPeopleTable(invitee.name, false);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          "Team's Owner is now automatically the admin who remained",
          async () => {
            await adminConsolePage.openTeamsTab();
            await adminConsolePage.hasTeamOwnerInTeamsTable(teamName, admin.name);
          },
        );

        await admin.close();
      },
    );

    ownerAndInviteeActivatedTest(
      qase([3152], 'Remove a member who belongs to multiple teams'),
      async ({ invitee, orgPage, adminConsolePage, teamPage }) => {
        // 3 sequential team-invite-accept cycles, each a real Gmail wait,
        // don't fit the default per-test budget.
        ownerAndInviteeActivatedTest.slow();

        const orgName = createOrgName();
        const teamNames = [createTeamName(), createTeamName(), createTeamName()];

        await ownerAndInviteeActivatedTest.step(
          'Setup: create an org (Enterprise-activated)',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Owner creates 3 teams and invites the second account to each',
          async () => {
            await adminConsolePage.goToFiles();
            const inviteeDashboardPage = new DashboardPage(invitee.page);
            for (const teamName of teamNames) {
              await teamPage.createTeam(teamName);
              await teamPage.openInvitationsPageViaOptionsMenu();
              await teamPage.clickInviteMembersToTeamButton();
              await teamPage.enterEmailToInviteMembersPopUp(invitee.email);
              await teamPage.clickSendInvitationButton();

              await waitSecondMessage(orgPage.page, invitee.email, 40);
              const invite = await waitMessage(orgPage.page, invitee.email, 40);
              await invitee.page.goto(invite!.inviteUrl);
              await inviteeDashboardPage.isSuccessMessageDisplayed(
                'Joined the team successfully',
              );
            }
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Owner → Admin Console → member is listed as belonging to 3 teams',
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.clickGoToAdminConsole();
            await adminConsolePage.openPeopleTab();
            await adminConsolePage.hasMemberTeamsCountInPeopleTable(invitee.name, 3);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'Owner removes the member → confirmation dialog → confirm',
          async () => {
            await adminConsolePage.removeMemberFromPeopleTable(invitee.name);
            await adminConsolePage.isRemoveMemberDialogShown(
              invitee.name,
              'The user will also be removed from all teams they were part of.',
            );
            await adminConsolePage.confirmRemoveMember(invitee.name);
            await adminConsolePage.isMemberListedInPeopleTable(invitee.name, false);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          'All 3 teams still exist, each down to just the owner',
          async () => {
            await adminConsolePage.openTeamsTab();
            for (const teamName of teamNames) {
              await adminConsolePage.isTeamListedInTeamsTable(teamName);
              await adminConsolePage.hasTeamCountsInTeamsTable(teamName, {
                projects: 0,
                files: 0,
                members: 1,
              });
            }
          },
        );
      },
    );
  },
);
