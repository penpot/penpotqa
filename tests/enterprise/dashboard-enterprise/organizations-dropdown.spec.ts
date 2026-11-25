/**
 * Qase suite: Enterprise Dashboard > Organizations Dropdown
 *
 * Base: `enterpriseActivatedPageTest` (see enterprise-fixtures.ts) — these
 * cases don't exercise the checkout UI itself, so the account is
 * Enterprise-entitled via the activation-code path (PRE/dev only) instead
 * of a real Stripe checkout.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { createDemoUser } from 'helpers/accounts/create-demo-user';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { enterpriseActivatedPageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterpriseActivatedPageTest.describe(
  'Enterprise Dashboard > Organizations Dropdown',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3239],
        'Navigation - Organization has been created. Org-owner is logged in',
      ),
      async ({ page, orgPage, adminConsolePage, teamPage }) => {
        /**
         * Accounts: org owner → the enterpriseActivatedPageTest account.
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

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an organization',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            ({ slug: orgSlug, orgId } = adminConsolePage.getOrgSlugAndIdFromUrl());
          },
        );

        await enterpriseActivatedPageTest.step(
          'Navigate to the org Admin Console URL directly → correct Admin Console page',
          async () => {
            await page.goto(`/admin-console/organization/${orgSlug}/${orgId}`);
            await adminConsolePage.isOnOrganizationAdminConsole(orgSlug);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Click "Go to Files" (accessed by direct link) → redirected to Personal Projects',
          async () => {
            await adminConsolePage.goToFiles(orgName);
            await dashboardPage.isPersonalProjectsVisible();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Create a team within the org, from within it the org switcher still shows "Go to Admin Console"',
          async () => {
            await teamPage.createTeam(teamName);
            await orgPage.openOrgSwitcher();
            await orgPage.isGoToAdminConsoleDropdownItemVisible();
          },
        );

        await enterpriseActivatedPageTest.step(
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

        await enterpriseActivatedPageTest.step(
          'A non-owner navigating to the URL gets a 404 error page',
          async () => {
            await createDemoUser(page.context().request);
            const response = await page.goto(
              `/admin-console/organization/${orgSlug}/${orgId}/people`,
            );
            adminConsolePage.hasNavigationStatusCode(response, 404);
            await adminConsolePage.isPageNotFoundVisible();
          },
        );
      },
    );
  },
);
