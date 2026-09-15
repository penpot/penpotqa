/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Create new team
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterprisePageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeTest` for cases needing a real second account.
 * Per-case "Accounts:" notes cover invitees needing a real, readable
 * inbox instead (see the enterprise-demo-account-email memory).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Enterprise Dashboard > Teams Dropdown > Create new team',
  () => {
    enterprisePageTest(
      qase([3106], 'User is redirected to new team dashboard after creation'),
      async ({ orgPage, adminConsolePage, stripePage, teamPage }) => {
        /**
         * TeamPage.createTeam() already asserts the new team's name is shown
         * as the active team (isTeamSelected()) — this case also checks the
         * URL itself carries that team's own team-id, confirming the
         * redirect landed on its real dashboard, not just a UI label change.
         */
        const orgName = createOrgName();
        const teamName = createTeamName();

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise and create an organization',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.goToFiles();
          },
        );

        await enterprisePageTest.step(
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
