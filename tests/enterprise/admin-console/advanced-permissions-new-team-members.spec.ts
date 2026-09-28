/**
 * Qase suite: Admin Console > Sidebar Menu > Advanced Permissions > New team members (Permission)
 *
 * Base: `enterpriseActivatedPageTest` for a single-actor case (activation-code
 * entitled, no Stripe checkout UI — see enterprise-fixtures.ts).
 * `ownerAndInviteeActivatedTest` for a case needing exactly one genuine
 * second account — its `invitee` handles registration/teardown. A case
 * needing a SECOND extra account beyond that (e.g. a team admin distinct
 * from the org-member invitee) creates it directly via
 * `createTeamInviteeSession()`/`createOrgInviteeSession()`, closed in a
 * `finally` block.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { waitMessage, waitSecondMessage, waitForMessageCount } from 'helpers/gmail';
import { createTeamInviteeSession } from 'helpers/accounts/create-invitee-session';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createSecondOrgFromAdminConsole } from 'helpers/organizations/create-second-org-from-admin-console';
import { goToOtherTeam } from 'helpers/teams/go-to-other-team';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { NewTeamMembersPermission } from '@pages/admin-console/advanced-permissions-page';
import {
  enterpriseActivatedPageTest,
  ownerAndInviteeActivatedTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Admin Console > Sidebar Menu > Advanced Permissions > New team members (Permission)',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3569, 3571],
        'Org owner restricts new team members to organization members only, revoking pending external invitations',
      ),
      async ({
        page,
        orgPage,
        adminConsolePage,
        teamPage,
        advancedPermissionsPage,
      }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();
        const externalInviteEmail = `pending-external-${Date.now()}@demo.example.com`;
        const orgInviteEmail = `pending-org-${Date.now()}@demo.example.com`;

        await enterpriseActivatedPageTest.step(
          'Setup: create an organization and a team with a pending external team invitation, plus a pending direct org invitation',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(externalInviteEmail);
            await teamPage.clickSendInvitationButton();
            // Gates on the actual precondition 3569 depends on (a genuinely
            // pending external invite), not just the send toast — confirmed
            // live that the toast alone isn't enough of a guarantee for the
            // Advanced Permissions warning check below, which can otherwise
            // run before this invite is visible to it.
            await teamPage.isInvitationRecordDisplayed([
              { email: externalInviteEmail, role: 'Editor', status: 'Pending' },
            ]);

            await orgPage.openOrgSwitcher();
            await orgPage.clickGoToAdminConsole();
            // A client-side-only navigation here can serve a stale People
            // list — force a fresh fetch (see PENPOT-3145/3152's PR).
            await page.reload();
            await adminConsolePage.invitePersonToOrganization(orgInviteEmail);
          },
        );

        await enterpriseActivatedPageTest.step(
          '3569: Select "Organization members only" while a pending external team invitation exists → confirmation warning appears',
          async () => {
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.clickOrganizationMembersOnlyExpectingWarning();
            await advancedPermissionsPage.isRevokeInvitationsWarningVisible();
          },
        );

        await enterpriseActivatedPageTest.step(
          '3571: Confirm the restriction → applied, the pending direct org invitation is untouched, the external team invitation is revoked',
          async () => {
            await advancedPermissionsPage.confirmApplyAndRevokeInvitations();
            await advancedPermissionsPage.isPermissionSelected(
              NewTeamMembersPermission.OrganizationMembersOnly,
            );

            await adminConsolePage.openPeopleTab();
            await adminConsolePage.openPendingTab();
            await adminConsolePage.isPendingInvitationListed(orgInviteEmail);

            await adminConsolePage.goToFiles();
            await teamPage.goto();
            await teamPage.switchTeam(teamName);
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.isInvitationRecordRemoved(externalInviteEmail);
          },
        );
      },
    );

    ownerAndInviteeActivatedTest(
      qase(
        [3573, 3574],
        'Team admin can only invite organization members to a team once new members are restricted',
      ),
      async ({
        browser,
        invitee,
        orgPage,
        adminConsolePage,
        teamPage,
        advancedPermissionsPage,
      }) => {
        // Real Gmail waits for 3 accepted invites (invitee's own org invite,
        // the team admin's team invite, then invitee's own team invite) don't
        // fit the default per-test budget.
        ownerAndInviteeActivatedTest.slow();

        // Qase's own 4 actors, mapped to this test: the fixture's owner is
        // the org owner (User1); `invitee` (kept under its own fixture name,
        // not aliased) is User5 — an org member who isn't yet on
        // Team-Apple; `teamAdmin` below is User2. User3 (the address that
        // gets blocked) doesn't need a real account at all — the
        // org-membership block is checked by email address alone,
        // confirmed live with synthetic, never-registered addresses — so
        // `externalEmail` (a plain string) plays that role.
        const orgName = createOrgName();
        const teamName = createTeamName();
        const externalEmail = `pending-external-${Date.now()}@demo.example.com`;
        const inviteeOrgPage = new OrganizationPage(invitee.page);

        // The team admin doesn't need to belong to the organization
        // themselves — only the people THEY invite to the team do. A
        // second extra account beyond `invitee`, so created and closed
        // directly rather than via a fixture.
        const teamAdmin = await createTeamInviteeSession(
          browser,
          InvitationRole.Admin,
        );
        const teamAdminTeamPage = new TeamPage(teamAdmin.page);

        let teamId = '';

        try {
          await ownerAndInviteeActivatedTest.step(
            'Setup: create an organization and team, add the org member, promote a second real account to team admin, then restrict new team members',
            async () => {
              await createOrgForLicensedAccount(orgPage, orgName);
              await adminConsolePage.goToFiles();
              await teamPage.createTeam(teamName);
              teamId = teamPage.getTeamIdFromUrl();

              await orgPage.openOrgSwitcher();
              await orgPage.clickGoToAdminConsole();
              // A client-side-only navigation here can serve a stale People
              // list — force a fresh fetch (see PENPOT-3145/3152's PR).
              await adminConsolePage.page.reload();
              await adminConsolePage.invitePersonToOrganization(invitee.email);
              await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgName);

              await adminConsolePage.goToFiles();
              await teamPage.goto();
              await teamPage.switchTeam(teamName);
              await teamPage.openInvitationsPageViaOptionsMenu();
              await teamPage.clickInviteMembersToTeamButton();
              await teamPage.selectInvitationRoleInPopUp(InvitationRole.Admin);
              await teamPage.enterEmailToInviteMembersPopUp(teamAdmin.email);
              await teamPage.clickSendInvitationButton();

              await waitSecondMessage(teamAdmin.page, teamAdmin.email, 40);
              const teamAdminInvite = await waitMessage(
                teamAdmin.page,
                teamAdmin.email,
                40,
              );
              await teamAdmin.page.goto(teamAdminInvite!.inviteUrl);
              await new DashboardPage(teamAdmin.page).isSuccessMessageDisplayed(
                'Joined the team successfully',
              );

              await orgPage.openOrgSwitcher();
              await orgPage.clickGoToAdminConsole();
              await adminConsolePage.openAdvancedPermissionsTab();
              await advancedPermissionsPage.selectPermission(
                NewTeamMembersPermission.OrganizationMembersOnly,
              );
            },
          );

          await ownerAndInviteeActivatedTest.step(
            '3573: Team admin invites a mix of an org member and an external address → blocked, the external address is listed',
            async () => {
              await teamAdminTeamPage.goToTeamDashboard(teamId);
              // A hash-only URL change is a same-document navigation at the
              // browser level — it doesn't reload the page, so org policy
              // the SPA already loaded into memory (before the owner
              // restricted new team members, above) can persist stale.
              // Force a real reload so this session sees the current
              // policy before it tries to invite anyone under it.
              await teamAdmin.page.reload();
              await teamAdminTeamPage.openInvitationsPageViaOptionsMenu();
              await teamAdminTeamPage.clickInviteMembersToTeamButton();
              await teamAdminTeamPage.enterEmailToInviteMembersPopUp([
                invitee.email,
                externalEmail,
              ]);
              await teamAdminTeamPage.clickSendInvitationButton();

              await teamAdminTeamPage.isBlockedInvitationsModalVisible();
              await teamAdminTeamPage.openBlockedInvitationsList();
              await teamAdminTeamPage.isEmailBlockedFromInvitation(externalEmail);
              await teamAdminTeamPage.cancelBlockedInvitationsModal();
            },
          );

          await ownerAndInviteeActivatedTest.step(
            '3574: Team admin invites only the org member → sent without any warning, then the org member accepts and joins the team',
            async () => {
              await teamAdminTeamPage.clickInviteMembersToTeamButton();
              await teamAdminTeamPage.enterEmailToInviteMembersPopUp(invitee.email);
              await teamAdminTeamPage.clickSendInvitationButton();
              await teamAdminTeamPage.isBlockedInvitationsModalVisible(false);
              await teamAdminTeamPage.isSuccessMessageDisplayed(
                'Invitation sent successfully',
              );

              await waitForMessageCount(invitee.page, invitee.email, 3, 40);
              const invite = await waitMessage(invitee.page, invitee.email, 40);
              await invitee.page.goto(invite!.inviteUrl);
              await new DashboardPage(invitee.page).isSuccessMessageDisplayed(
                'Joined the team successfully',
              );
            },
          );
        } finally {
          await teamAdmin.close();
        }
      },
    );

    ownerAndInviteeActivatedTest(
      qase(
        [3576, 3579],
        'Organization picker disables a destination org the team owner belongs to but a team member does not, blocking the move entirely once no organization qualifies',
      ),
      async ({
        browser,
        invitee,
        orgPage,
        adminConsolePage,
        advancedPermissionsPage,
      }) => {
        ownerAndInviteeActivatedTest.slow();

        const orgAName = createOrgName();
        const orgBName = createOrgName();
        const teamName = createTeamName();
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        // Team-Coconut's owner is `invitee` (User2) — a different person
        // from the org owner (User1, this test's own account). A third
        // real account (User3) is a plain team member who never joins
        // either org — that's what makes a restricted org ineligible.
        //
        // User2 joins BOTH OrgA and OrgB below, even though Qase's own
        // precondition only says "User2 is a member of OrgB" (silent on
        // OrgA). Confirmed live: an org never appears in someone's own
        // "Add to an organization" picker — disabled or otherwise — unless
        // they're already a member of it, so OrgA couldn't render as
        // "disabled" at all without User2 belonging to it too. Treating
        // Qase's precondition as incomplete here, not as something to
        // reproduce literally, since the literal version can't produce the
        // literal expected result.
        const teamMember = await createTeamInviteeSession(
          browser,
          InvitationRole.Editor,
        );

        let orgBAdminConsoleUrl = '';

        try {
          await ownerAndInviteeActivatedTest.step(
            "Setup: User2 creates their own team and adds a team member (User3) BEFORE joining any organization — confirmed live that accepting a 2nd org invite can switch User2's active dashboard context, which would silently attach a team created afterward to the wrong org (or block inviting User3 outright, since it wouldn't be org-less anymore)",
            async () => {
              await inviteeTeamPage.createTeam(teamName);

              await inviteeTeamPage.openInvitationsPageViaOptionsMenu();
              await inviteeTeamPage.clickInviteMembersToTeamButton();
              await inviteeTeamPage.enterEmailToInviteMembersPopUp(teamMember.email);
              await inviteeTeamPage.clickSendInvitationButton();

              await waitSecondMessage(teamMember.page, teamMember.email, 40);
              const invite = await waitMessage(
                teamMember.page,
                teamMember.email,
                40,
              );
              await teamMember.page.goto(invite!.inviteUrl);
              await new DashboardPage(teamMember.page).isSuccessMessageDisplayed(
                'Joined the team successfully',
              );

              // Confirm User3 is a genuine member, not still just a pending
              // invitation — the two are visibly different states (Members
              // vs. Invitations tabs) and only membership is what the
              // org-picker's eligibility rule actually checks.
              await inviteeTeamPage.openMembersPageViaOptionsMenu();
              await inviteeTeamPage.isMultipleMemberRecordDisplayed(
                teamMember.name,
                teamMember.email,
                'Editor',
              );
            },
          );

          await ownerAndInviteeActivatedTest.step(
            "Setup: owner creates a restricted OrgA and an open OrgB, invites User2 into both — confirmed live that an org must be a membership, not just exist, to appear in someone else's own org picker at all",
            async () => {
              await createOrgForLicensedAccount(orgPage, orgAName);
              await adminConsolePage.openAdvancedPermissionsTab();
              await advancedPermissionsPage.selectPermission(
                NewTeamMembersPermission.OrganizationMembersOnly,
              );
              await adminConsolePage.invitePersonToOrganization(invitee.email);
              await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgAName);

              await createSecondOrgFromAdminConsole(
                adminConsolePage,
                orgPage,
                orgBName,
              );
              // About to invite into OrgB right away, which reads org
              // membership — confirmed live that even once routed here, this
              // client-side org switch can leave that read seeing OrgA's
              // stale cached member list (which does contain `invitee`)
              // instead of OrgB's, wrongly blocking the invite with "This
              // user is already a member." Same category of
              // stale-fetch-after-client-side-navigation issue as
              // PENPOT-3145/3152 (see the People tab reload in the
              // 3573/3574 setup step above), just a different data source.
              await adminConsolePage.page.reload();
              // Captured now (rather than re-derived later via the switcher)
              // since the org-less team's own pages offer no "Go to Admin
              // Console" entry point to get back here from.
              orgBAdminConsoleUrl = adminConsolePage.page.url();
              await adminConsolePage.invitePersonToOrganization(invitee.email);

              // invitee's inbox already has registration + the OrgA invite
              // (2 messages) — wait for the OrgB invite to actually arrive
              // as a 3rd before accepting it, or acceptOrgInviteFromInbox's
              // own hardcoded >=2 check would no-op and could grab the
              // stale OrgA invite instead.
              await waitForMessageCount(invitee.page, invitee.email, 3, 40);
              await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgBName);
            },
          );

          await ownerAndInviteeActivatedTest.step(
            "3576: User2 opens the org picker on their own team → the restricted OrgA is disabled (User3 isn't a member), the open OrgB is enabled",
            async () => {
              // Accepting the org invites switched User2's active dashboard
              // context to an org — see goToOtherTeam()'s own comment.
              await goToOtherTeam(inviteeOrgPage, inviteeTeamPage, teamName);
              await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
              await inviteeTeamPage.openAddTeamToOrgComboboxOptions();
              await inviteeTeamPage.isOrgPickerOptionDisabled(orgAName);
              await inviteeTeamPage.isOrgPickerOptionDisabled(orgBName, false);
              await invitee.page.keyboard.press('Escape');
            },
          );

          await ownerAndInviteeActivatedTest.step(
            "3579: Owner restricts OrgB too → no organization qualifies for User2's team (User3 belongs to neither), attempting to add it shows a permission-denied modal instead of the picker",
            async () => {
              await adminConsolePage.page.goto(orgBAdminConsoleUrl);
              await adminConsolePage.openAdvancedPermissionsTab();
              await advancedPermissionsPage.selectPermission(
                NewTeamMembersPermission.OrganizationMembersOnly,
              );

              // A fresh navigation, rather than reusing 3576's page state —
              // Escape only closed the picker's own option list, not the
              // "Add team to an organization" panel itself, which would
              // otherwise still intercept clicks here.
              await goToOtherTeam(inviteeOrgPage, inviteeTeamPage, teamName);
              await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
              await inviteeTeamPage.openAddTeamToOrgModal();
              await inviteeTeamPage.isNoOrgAllowsTeamMoveMessageVisible();
            },
          );
        } finally {
          await teamMember.close();
        }
      },
    );

    ownerAndInviteeActivatedTest(
      qase(
        [3577],
        'Moving a team to a restricted organization warns that its pending external invitations will be canceled',
      ),
      async ({ invitee, orgPage, adminConsolePage, advancedPermissionsPage }) => {
        // Qase's precondition names both OrgA and OrgB as restricted, but
        // the case only ever selects one destination org in the picker — a
        // 2nd restricted org that's never selected doesn't exercise any
        // behavior beyond what this one already covers, so it's omitted
        // rather than set up and left unused.
        const orgName = createOrgName();
        const teamName = createTeamName();
        const externalEmail = `pending-external-${Date.now()}@demo.example.com`;
        const inviteeOrgPage = new OrganizationPage(invitee.page);
        const inviteeTeamPage = new TeamPage(invitee.page);

        await ownerAndInviteeActivatedTest.step(
          "Setup: User2 creates their own team and sends a pending invitation to someone outside any organization — BEFORE joining any organization themselves, since a team created (or invited to) while an org is the active dashboard context auto-associates with it, and only an already-org-less team fits this case's precondition",
          async () => {
            await inviteeTeamPage.createTeam(teamName);
            await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
            await inviteeTeamPage.isTeamNotPartOfAnyOrg();

            await inviteeTeamPage.openInvitationsPageViaOptionsMenu();
            await inviteeTeamPage.clickInviteMembersToTeamButton();
            await inviteeTeamPage.enterEmailToInviteMembersPopUp(externalEmail);
            await inviteeTeamPage.clickSendInvitationButton();
            // Gates on the actual precondition the move-flow step below
            // depends on (a genuinely pending external invite), not just the
            // send toast — same fix as 3569/3571's setup: the toast can
            // precede the server-visible pending record, and the move step
            // needs that record to exist for the cancellation warning to
            // render.
            await inviteeTeamPage.isInvitationRecordDisplayed([
              { email: externalEmail, role: 'Editor', status: 'Pending' },
            ]);
          },
        );

        await ownerAndInviteeActivatedTest.step(
          "Setup: owner (User1) creates a restricted org and invites Team-Coconut's owner (User2) into it",
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.openAdvancedPermissionsTab();
            await advancedPermissionsPage.selectPermission(
              NewTeamMembersPermission.OrganizationMembersOnly,
            );
            await adminConsolePage.invitePersonToOrganization(invitee.email);
            await inviteeOrgPage.acceptOrgInviteFromInbox(invitee.email, orgName);

            // Accepting the org invite may have changed User2's active
            // dashboard context — reach their own team via the org
            // switcher's "Other teams" entry rather than assuming state
            // (confirmed necessary for this exact scenario, see 3576/3579).
            await goToOtherTeam(inviteeOrgPage, inviteeTeamPage, teamName);
            await inviteeTeamPage.openTeamSettingsPageViaOptionsMenu();
          },
        );

        await ownerAndInviteeActivatedTest.step(
          "User2 selects the org (eligible — they're a member) in the picker → a cancellation warning appears but doesn't block the move; confirming moves the team and revokes the pending invitation",
          async () => {
            await inviteeTeamPage.openAddTeamToOrgComboboxOptions();
            await inviteeTeamPage.selectOrgInPicker(orgName);
            await inviteeTeamPage.isExternalInvitationsCancelWarningVisible();

            await inviteeTeamPage.submitAddToOrg();
            await inviteeTeamPage.isTeamPartOfOrganization(orgName);

            await inviteeTeamPage.openInvitationsPageViaOptionsMenu();
            await inviteeTeamPage.isInvitationRecordRemoved(externalEmail);
          },
        );
      },
    );
  },
);
