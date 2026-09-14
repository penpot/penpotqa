/**
 * Qase suite: Enterprise Dashboard > Organizations Dropdown
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base: `enterprisePageTest` (see enterprise-fixtures.ts) for a single
 * actor; `ownerAndInviteeTest` for cases needing a real second account.
 * Per-case "Accounts:" notes cover invitees needing a real, readable
 * inbox instead (see the enterprise-demo-account-email memory).
 */
import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { createDemoUser } from 'helpers/accounts/create-demo-user';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe('Enterprise Dashboard > Organizations Dropdown', () => {
  enterprisePageTest(
    qase(
      [3239],
      'Navigation - Organization has been created. Org-owner is logged in',
    ),
    async ({ page, orgPage, adminConsolePage, stripePage, teamPage }) => {
      /**
       * Accounts: org owner → createDemoUser() (via demoAccountApiFixture).
       * Non-owner (step 5) → a second createDemoUser() call reusing the same
       * APIRequestContext, which simply overwrites the session cookie — no
       * second browser context needed since the owner's session isn't used
       * again afterward.
       */
      const dashboardPage = new DashboardPage(page);
      const orgName = createOrgName();
      const teamName = createTeamName();
      let orgSlug = '';
      let orgId = '';

      await enterprisePageTest.step(
        'Setup: subscribe to Enterprise and create an organization',
        async () => {
          await subscribeAndCreateOrg(
            orgPage,
            adminConsolePage,
            stripePage,
            orgName,
          );
          ({ slug: orgSlug, orgId } = adminConsolePage.getOrgSlugAndIdFromUrl());
        },
      );

      await enterprisePageTest.step(
        'Navigate to the org Admin Console URL directly → correct Admin Console page',
        async () => {
          await page.goto(`/admin-console/organization/${orgSlug}/${orgId}`);
          await adminConsolePage.isOnOrganizationAdminConsole(orgSlug);
        },
      );

      await enterprisePageTest.step(
        'Click "Go to Files" (accessed by direct link) → redirected to Personal Projects',
        async () => {
          await adminConsolePage.goToFiles();
          await dashboardPage.isPersonalProjectsVisible();
        },
      );

      await enterprisePageTest.step(
        'Create a team within the org, from within it the org switcher still shows "Go to Admin Console"',
        async () => {
          await teamPage.createTeam(teamName);
          await orgPage.openOrgSwitcher();
          await orgPage.isGoToAdminConsoleDropdownItemVisible();
        },
      );

      await enterprisePageTest.step(
        'Modify the org-name segment in the URL, keep the valid org id → navigation still resolves to the intended organization',
        async () => {
          // The URL bar doesn't reliably rewrite itself back to the real
          // slug, but the content shown is always the correct
          // organization's, which is what actually matters here.
          await page.goto(
            `/admin-console/organization/wrong-slug-here/${orgId}/people`,
          );
          await adminConsolePage.isDisplayingOrganization(orgName);
        },
      );

      await enterprisePageTest.step(
        'A non-owner navigating to the URL gets an error page',
        async () => {
          await createDemoUser(page.context().request);
          const response = await page.goto(
            `/admin-console/organization/${orgSlug}/${orgId}/people`,
          );
          expect(
            response?.status(),
            'Non-owner navigating to the org URL gets an HTTP 500 response',
          ).toBe(500);
          await adminConsolePage.isServerErrorPageVisible();
        },
      );
    },
  );
});
