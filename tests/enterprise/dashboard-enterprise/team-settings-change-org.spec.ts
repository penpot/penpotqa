/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Change team organization
 *
 * PENPOT-3211/3212/3213 merged into one test (Qase notes them sequential).
 * This test's own account owns OrgC; User1 and User2 are `createDemoMember()`
 * accounts that join the org and the team via the API, so no email is involved.
 *
 * Base: `enterpriseActivatedPageTest` — this test's own account and User1 are
 * both Enterprise-entitled via the activation-code path (PRE/dev only), no
 * Stripe checkout.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { addTeamMember } from 'helpers/teams/add-team-member';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { joinOrganization } from 'helpers/organizations/join-organization';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { activateEnterpriseLicense } from 'helpers/organizations/activate-enterprise-license';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Change team organization',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3211, 3212, 3213],
        'Move a team between organizations, across owners, observed live',
      ),
      async ({ page, orgPage, adminConsolePage, createDemoMember }) => {
        enterpriseActivatedPageTest.slow();

        const orgAName = createOrgName();
        const orgBName = createOrgName();
        const orgCName = createOrgName();
        const teamName = createTeamName();

        const user1 = await createDemoMember('User1');
        const user1OrgPage = new OrganizationPage(user1.page);
        const user1AdminConsolePage = new AdminConsolePage(user1.page);
        const user1TeamPage = new TeamPage(user1.page);

        const user2 = await createDemoMember('User2');
        const user2TeamPage = new TeamPage(user2.page);

        let teamId = '';

        await enterpriseActivatedPageTest.step(
          'Setup: User1 activates Enterprise, creates OrgA and OrgB, and a team in OrgA',
          async () => {
            await activateEnterpriseLicense(user1.request);
            await user1.page.goto('/');
            await createOrgForLicensedAccount(user1OrgPage, orgAName);
            await user1AdminConsolePage.goToFiles(orgAName);
            await user1TeamPage.createTeam(teamName);
            teamId = user1TeamPage.getTeamIdFromUrl();

            await user1OrgPage.openOrgSwitcher();
            await user1OrgPage.clickCreateOrgFromDropdown();
            await user1OrgPage.createOrganization(orgBName);
            await user1AdminConsolePage.isOnOrganizationAdminConsole(orgBName);
            // Otherwise "Go to Files" can still link to OrgA's team.
            await user1AdminConsolePage.page.reload();
            await user1AdminConsolePage.goToFiles(orgBName);
          },
        );

        await enterpriseActivatedPageTest.step(
          '3211: Move the team from OrgA to OrgB (same user)',
          async () => {
            await user1TeamPage.goToTeamDashboard(teamId);
            await user1TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user1TeamPage.isTeamPartOfOrganization(orgAName);

            await user1TeamPage.changeTeamOrganization(orgBName);
            await user1TeamPage.isTeamPartOfOrganization(orgBName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), a different user creates OrgC and User1 joins it',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgCName);
            await joinOrganization(
              page.context().request,
              adminConsolePage.getOrganizationId(),
              [user1],
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          '3212: Move the team from OrgB to OrgC (an organization belonging to a different user)',
          async () => {
            await user1TeamPage.goToTeamDashboard(teamId);
            await user1TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user1TeamPage.isTeamPartOfOrganization(orgBName);

            await user1TeamPage.changeTeamOrganization(orgCName);
            await user1TeamPage.isTeamPartOfOrganization(orgCName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Setup: User2 joins the team and opens its dashboard',
          async () => {
            await addTeamMember(user1.request, user2, teamId, InvitationRole.Editor);
            // A fresh navigation right before the move, or the live push can
            // silently never arrive.
            await user2TeamPage.goToTeamDashboard(teamId);
            await user2.page.waitForLoadState('networkidle');
          },
        );

        await enterpriseActivatedPageTest.step(
          '3213: User1 moves the team from OrgC to OrgA; User2, already viewing the dashboard, sees the move without refreshing',
          async () => {
            await user1TeamPage.openTeamSettingsPageViaOptionsMenu();
            await user1TeamPage.changeTeamOrganization(orgAName);

            await user2TeamPage.isSuccessMessageDisplayed(
              `${teamName} now belongs to ${orgAName}`,
            );
          },
        );
      },
    );
  },
);
