/**
 * Qase suite: Enterprise Dashboard > Organizations Dropdown > Organization Management > Leave Org
 *
 * Base fixture: `ownerAndInviteeActivatedTest` (see enterprise-fixtures.ts)
 * — the owner is Enterprise-entitled via the activation-code path,
 * skipping the Stripe checkout UI. PRE/dev environments only — skips
 * automatically wherever `LICENSES_MANAGER_URL` is unset. `invitee` needs
 * a real, readable inbox (see the enterprise-demo-account-email memory).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { waitMessage, waitSecondMessage } from 'helpers/gmail';
import { createTeamInviteeSession } from 'helpers/accounts/create-invitee-session';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { ownerAndInviteeActivatedTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

ownerAndInviteeActivatedTest.describe(
  'Enterprise Dashboard > Organizations Dropdown > Organization Management > Leave Org',
  () => {
    ownerAndInviteeActivatedTest(
      qase(
        [3120, 3123, 3127],
        'Team owner leaves organization: ownership transfers, lands on the zero-org dashboard',
      ),
      async ({ browser, invitee, orgPage, adminConsolePage }) => {
        // Real Gmail waits for 2 accepted invites (invitee's own, plus the
        // team admin's) don't fit the default per-test budget.
        ownerAndInviteeActivatedTest.slow();

        const orgName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);
        const admin = await createTeamInviteeSession(browser, InvitationRole.Admin);

        try {
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
              await inviteeOrgPage.switchToOrg(orgName);
              await inviteeTeamPage.createTeam(teamName);
              await inviteeTeamPage.openInvitationsPageViaOptionsMenu();
              await inviteeTeamPage.clickInviteMembersToTeamButton();
              await inviteeTeamPage.enterEmailToInviteMembersPopUp(admin.email);
              await inviteeTeamPage.selectInvitationRoleInPopUp(
                InvitationRole.Admin,
              );
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
            '3120: Invitee leaves the organization → confirmation dialog → confirm',
            async () => {
              await invitee.page.reload();
              await invitee.page.waitForLoadState('networkidle');

              await inviteeOrgPage.openOrganizationOptionsMenu();
              await inviteeOrgPage.clickLeaveOrg();
              await inviteeOrgPage.isLeaveOrgDialogShown();
              await inviteeOrgPage.confirmPromoteAndLeave();
            },
          );

          await ownerAndInviteeActivatedTest.step(
            '3123: Team ownership transferred to the promoted admin',
            async () => {
              await adminConsolePage.page.reload();
              await adminConsolePage.openTeamsTab();
              await adminConsolePage.hasTeamOwnerInTeamsTable(teamName, admin.name);
            },
          );

          await ownerAndInviteeActivatedTest.step(
            '3127: Invitee lands on the zero-org (ghost organization) Personal Projects dashboard',
            async () => {
              await inviteeOrgPage.isLeftOrganizationMessageShown(orgName);
              await inviteeOrgPage.isZeroOrgAccountStateShown();
            },
          );
        } finally {
          await admin.close();
        }
      },
    );
  },
);
