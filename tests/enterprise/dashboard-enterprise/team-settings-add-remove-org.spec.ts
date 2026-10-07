/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Add/Remove team from organization
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeActivatedTest` for cases needing a real second account.
 * Per-case "Accounts:" notes cover invitees needing a real, readable
 * inbox instead (see the enterprise-demo-account-email memory).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Add/Remove team from organization',
  () => {
    enterpriseActivatedPageTest(
      qase([3192], 'Team owner adds a team to an organization'),
      async ({ page, orgPage, adminConsolePage, teamPage }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();

        await enterpriseActivatedPageTest.step(
          'Setup: create a team before any organization exists, then create an Enterprise-activated one',
          async () => {
            await teamPage.createTeam(teamName);
            await createOrgForLicensedAccount(orgPage, orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Switch to the pre-existing team → Team Settings shows "not part of any organization" and an "Add to an organization" link',
          async () => {
            await adminConsolePage.goToFiles();
            // A real reload — the dashboard's in-memory team list can go
            // stale right after an Admin Console round-trip, otherwise.
            await page.goto('/');
            await teamPage.switchTeam(teamName);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.isTeamNotPartOfAnyOrg();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Click "Add to an organization", choose the org, confirm → success message, Team organization section now shows it, no refresh needed',
          async () => {
            await teamPage.addTeamToOrganization(orgName);
            await teamPage.isTeamPartOfOrganization(orgName);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase([3198], 'Team owner removes a team from an organization'),
      async ({ orgPage, adminConsolePage, teamPage }) => {
        const orgName = createOrgName();
        const teamName = createTeamName();

        await enterpriseActivatedPageTest.step(
          'Setup: create an Enterprise-activated org with a team already in it',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            await teamPage.openTeamSettingsPageViaOptionsMenu();
            await teamPage.isTeamPartOfOrganization(orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Click the options menu beside the org name → "Remove team from organization" → confirmation dialog with team + org names',
          async () => {
            await teamPage.openRemoveTeamFromOrgDialog();
            await teamPage.isRemoveTeamConfirmDialogShown(teamName, orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Confirm → success message, section shows "not part of any organization" again',
          async () => {
            await teamPage.removeTeamFromOrgConfirmButton.click();
            await teamPage.isRemovedFromOrgMessageShown();
            await teamPage.isTeamNotPartOfAnyOrg();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Team switcher → the team reappears ungrouped ("TEAMS" section), no longer under the org',
          async () => {
            await teamPage.openTeamsListIfClosed();
            await teamPage.isTeamListed(teamName);
          },
        );
      },
    );
  },
);
