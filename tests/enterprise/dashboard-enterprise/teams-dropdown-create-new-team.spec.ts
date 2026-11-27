/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Create new team
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) — these
 * cases don't exercise the checkout UI itself, so the account is
 * Enterprise-entitled via the activation-code path (PRE/dev only) instead
 * of a real Stripe checkout.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Enterprise Dashboard > Teams Dropdown > Create new team',
  () => {
    enterpriseActivatedPageTest(
      qase([3106], 'User is redirected to new team dashboard after creation'),
      async ({ orgPage, adminConsolePage, teamPage }) => {
        /**
         * TeamPage.createTeam() already asserts the new team's name is shown
         * as the active team (isTeamSelected()) — this case also checks the
         * URL itself carries that team's own team-id, confirming the
         * redirect landed on its real dashboard, not just a UI label change.
         */
        const orgName = createOrgName();
        const teamName = createTeamName();

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            await adminConsolePage.goToFiles(orgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Click "Create team", fill in a name, submit → redirected to the new team’s own dashboard',
          async () => {
            await teamPage.createTeam(teamName);
            await teamPage.isOnTeamDashboardUrl();
          },
        );
      },
    );
  },
);
