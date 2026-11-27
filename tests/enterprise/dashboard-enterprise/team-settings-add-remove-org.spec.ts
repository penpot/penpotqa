/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Team Settings > Team Organization Options > Add/Remove team from organization
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) — these
 * cases don't exercise the checkout UI itself, so the account is
 * Enterprise-entitled via the activation-code path (PRE/dev only) instead
 * of a real Stripe checkout.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { goToOtherTeam } from 'helpers/teams/go-to-other-team';
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
          'Setup: Enterprise already active (activation code), create a team before any organization exists, then create an organization',
          async () => {
            await teamPage.createTeam(teamName);
            await createOrgForLicensedAccount(orgPage, orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Switch to the pre-existing team → Team Settings shows "not part of any organization" and an "Add to an organization" link',
          async () => {
            await adminConsolePage.goToFiles(orgName);
            // The pre-existing team isn't in the org, so it's under "Other teams".
            await goToOtherTeam(orgPage, teamPage, teamName);
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
          'Setup: Enterprise already active (activation code), create an org with a team already in it',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.goToFiles(orgName);
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
