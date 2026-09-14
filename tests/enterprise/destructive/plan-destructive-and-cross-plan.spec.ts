/**
 * Qase suite: Cross-cutting: Admin Console > Settings > Delete organization; Admin Console > Subscriptions & Billing; Enterprise Dashboard (direct)
 *
 * These 7 cases permanently mutate plan/org state (delete org, delete account, downgrade, cancel plan) or require a non-Enterprise starting plan (cross-plan checks). Kept in their own file per the automation plan (section 2.6) — each needs a disposable org, not shared with the rest of the suite.
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
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Cross-cutting: Admin Console > Settings > Delete organization; Admin Console > Subscriptions & Billing; Enterprise Dashboard (direct)',
  () => {
    enterprisePageTest.skip(
      qase(
        [3555],
        'Delete an Enterprise account with organizations shows the extended warning and removes them immediately',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3555 for full detail):
         * 1. Open user menu > "Your account"
         * 2. Scroll to account deletion, click "Delete account" → confirmation modal
         * 3. Warning box: irreversible, account/subscription/orgs deleted immediately
         * 4. Expand "Organizations that will be deleted" → every owned org listed with icon, name, team/member counts
         * 5. Click "Yes, delete my account" → deleted immediately, signed out, listed orgs no longer exist
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    enterprisePageTest(
      qase(
        [3223],
        'Delete organization with no members redirects user to the most recent organization',
      ),
      async ({ orgPage, adminConsolePage, stripePage }) => {
        /**
         * A single-member
         * (no other members) org is the easiest way to get
         * a deterministic "redirected elsewhere" outcome — with a second org
         * still owned by the same profile, deleting the first one redirects
         * back to that remaining org rather than to the empty welcome state.
         */
        const firstOrgName = createOrgName();
        const secondOrgName = createOrgName();

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise and create two organizations',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              firstOrgName,
            );

            // Second org: already Enterprise, so this goes straight through
            // the org switcher's own "Create org" item — no Stripe involved.
            await adminConsolePage.openOrgSwitcher();
            await adminConsolePage.createOrganizationSwitcherItem.click();
            await orgPage.createOrganization(secondOrgName);
            await adminConsolePage.isDisplayingOrganization(secondOrgName);
          },
        );

        await enterprisePageTest.step(
          'Delete the second (current) organization → success toast',
          async () => {
            await adminConsolePage.openSettings();
            await adminConsolePage.deleteOrganization();
          },
        );

        await enterprisePageTest.step(
          'Redirected to the other, most-recently-active organization',
          async () => {
            await adminConsolePage.isDisplayingOrganization(firstOrgName);
          },
        );

        await enterprisePageTest.step(
          'The deleted organization no longer appears in the org switcher',
          async () => {
            await adminConsolePage.openOrgSwitcher();
            await adminConsolePage.isOrgListedInSwitcher(secondOrgName, false);
          },
        );
      },
    );

    enterprisePageTest(
      qase(
        [3226],
        'Delete organization with at least one team and one file moves teams and files to default organization',
      ),
      async ({ page, orgPage, adminConsolePage, stripePage, teamPage }) => {
        const dashboardPage = new DashboardPage(page);
        const orgName = createOrgName();
        const teamName = createTeamName();
        let orgAdminConsoleUrl = '';

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise, create an org, a team in it, and a file in that team',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            orgAdminConsoleUrl = page.url();

            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);
            await dashboardPage.createFileViaPlaceholder();
          },
        );

        await enterprisePageTest.step(
          "Back on the org's Admin Console, open the delete-organization explanation panel",
          async () => {
            await page.goto(orgAdminConsoleUrl);
            await adminConsolePage.openSettings();
            await adminConsolePage.openDeleteOrganizationPanel();
          },
        );

        await enterprisePageTest.step(
          'Confirm → "Are you sure?" dialog shows the correct affected member/team/file counts',
          async () => {
            await adminConsolePage.clickDeleteOrganizationExplanationConfirm();
            await adminConsolePage.isDeleteOrgConfirmDialogVisible();
            await adminConsolePage.hasDeleteOrgAffectedCountsText(
              '1 members, 1 teams and their 1 files will be affected. This action cannot be undone.',
            );
          },
        );

        await enterprisePageTest.step(
          'Expand "Affected teams" → the real team is listed',
          async () => {
            await adminConsolePage.expandAffectedTeams();
            await adminConsolePage.isTeamListedInAffectedTeams(teamName);
          },
        );

        await enterprisePageTest.step(
          'Confirm deletion → success toast',
          async () => {
            await adminConsolePage.confirmDeleteOrganization();
          },
        );

        await enterprisePageTest.step(
          'The team survives, now ungrouped (no longer associated with any organization)',
          async () => {
            // A real navigation, not the Admin Console's own "Go to Files"
            // link — that link's href is rendered with the org's team-id
            // from before the deletion above, and following it straight
            // afterward 404s (the id no longer resolves once the org is
            // gone).
            await page.goto('/');
            await teamPage.openTeamsListIfClosed();
            await teamPage.isTeamListed(teamName);
          },
        );
      },
    );

    enterprisePageTest.skip(
      qase(
        [3353],
        'Show downgrade warning before switching from the Enterprise plan to Professional',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3353 for full detail):
         * 1. Open Subscription page → Enterprise current, Professional listed with Subscribe button
         * 2. Click Subscribe on Professional → warning modal (loses orgs, admin console, org config)
         * 3. Close without confirming → no downgrade started, still Enterprise
         * 4. Click Subscribe again, confirm warning → taken to Stripe cancel-Enterprise page
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    enterprisePageTest.skip(
      qase(
        [3434],
        'Cancel the Enterprise plan and fall back to the Professional plan',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3434 for full detail):
         * 1. Your subscription page → Manage your subscription → Stripe customer portal
         * 2. Cancel plan → review changes screen, optional reason, confirm
         * 3. "Plan canceled" confirmation with end date shown
         * 4. Stripe active-plan list shows Canceled badge + end date
         * 5. Reactivate plan before end date → confirmation screen → confirm → Canceled badge cleared
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    enterprisePageTest.skip(
      qase(
        [3358],
        'Cannot switch to the Enterprise plan from Stripe when on the Unlimited plan',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3358 for full detail):
         * 1. Manage your subscription → Stripe payment page shows current Unlimited plan
         * 2. "Update your subscription" only allows seat-count changes, no Enterprise option
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    enterprisePageTest.skip(
      qase([3592], 'Cannot switch between Enterprise and Unlimited plans'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3592 for full detail):
         * 1. User A (Unlimited): Manage subscription → Stripe "Update subscription" only changes seats, no Enterprise switch
         * 2. User A: click Subscribe/Try free on Enterprise (page + dashboard widget) → Contact Sales modal, no Stripe checkout
         * 3. User B (Enterprise): Manage subscription → Stripe "Update subscription" only changes billing period, no Unlimited switch
         * 4. User B: click to switch to Unlimited → Contact Sales modal, no Stripe checkout
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );
  },
);
