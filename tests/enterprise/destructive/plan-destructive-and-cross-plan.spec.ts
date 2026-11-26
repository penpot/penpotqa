/**
 * Qase suite: Cross-cutting: Admin Console > Settings > Delete organization; Admin Console > Subscriptions & Billing; Enterprise Dashboard (direct)
 *
 * These 6 cases permanently mutate plan/org state (delete org, delete account, downgrade, cancel plan) or require a non-Enterprise starting plan (cross-plan checks). Kept in their own file: each needs a disposable org, not shared with the rest of the suite.
 *
 * PENPOT-3353 and PENPOT-3434 are merged into one test (same org/owner,
 * sequential state). PENPOT-3358 is dropped as a strict subset of 3592.
 *
 * Base: `enterpriseActivatedPageTest` (activation code, PRE/dev only) for
 * the delete cases, which don't touch billing; `enterprisePageTest` (real
 * Stripe checkout) for the ones that test the Stripe billing portal
 * (3353/3434, 3592). PENPOT-3592 needs a second,
 * fully independent account/plan, so it opens its own browser context
 * rather than using `ownerAndInviteeTest` (whose invitee joins the same org).
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { YourAccountPage } from '@pages/your-account/your-account-page';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { createSecondOrgFromAdminConsole } from 'helpers/organizations/create-second-org-from-admin-console';
import { loginAsDemoAccount } from 'helpers/accounts/login-as-demo-account';
import { LoginPage } from '@pages/login-page';
import {
  enterprisePageTest,
  enterpriseActivatedPageTest,
} from '@tests/enterprise/fixtures/enterprise-fixtures';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';

enterprisePageTest.describe(
  'Cross-cutting: Admin Console > Settings > Delete organization; Admin Console > Subscriptions & Billing; Enterprise Dashboard (direct)',
  () => {
    enterpriseActivatedPageTest(
      qase(
        [3555],
        'Delete an Enterprise account with organizations shows the extended warning and removes them immediately',
      ),
      async ({ page, orgPage, adminConsolePage, teamPage }) => {
        const yourAccountPage = new YourAccountPage(page);
        const loginPage = new LoginPage(page);
        const firstOrgName = createOrgName();
        const secondOrgName = createOrgName();
        const teamName = createTeamName();

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create two organizations, and a team in the second one',
          async () => {
            await createOrgForLicensedAccount(orgPage, firstOrgName);

            await createSecondOrgFromAdminConsole(
              adminConsolePage,
              orgPage,
              secondOrgName,
            );
            await adminConsolePage.isDisplayingOrganization(secondOrgName);

            await adminConsolePage.goToFiles(secondOrgName);

            await teamPage.createTeam(teamName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Open user menu > "Your account" > click "Want to remove your account?" → confirmation modal',
          async () => {
            await yourAccountPage.open();
            await yourAccountPage.profile.openDeleteAccountModal();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Warning box: irreversible, account/subscription/orgs deleted immediately',
          async () => {
            await yourAccountPage.profile.checkDeleteAccountWarningIsVisible();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Expand "Organizations that will be deleted" → every owned org listed with team/member counts',
          async () => {
            await yourAccountPage.profile.expandOrganizationsToDelete();
            await yourAccountPage.profile.checkOrganizationIsListedToDelete(
              firstOrgName,
              0,
              1,
            );
            await yourAccountPage.profile.checkOrganizationIsListedToDelete(
              secondOrgName,
              1,
              1,
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          // Redirect to login is the checkable signal of immediate deletion.
          'Click "Yes, delete my account" → deleted immediately, signed out',
          async () => {
            await yourAccountPage.profile.confirmDeleteAccount();
            await loginPage.isLoginPageUrlShown();
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3223],
        'Delete organization with no members redirects user to the most recent organization',
      ),
      async ({ orgPage, adminConsolePage }) => {
        /**
         * A single-member
         * (no other members) org is the easiest way to get
         * a deterministic "redirected elsewhere" outcome — with a second org
         * still owned by the same profile, deleting the first one redirects
         * back to that remaining org rather than to the empty welcome state.
         */
        const firstOrgName = createOrgName();
        const secondOrgName = createOrgName();

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create two organizations',
          async () => {
            await createOrgForLicensedAccount(orgPage, firstOrgName);

            // Second org: already Enterprise, so this goes straight through
            // the org switcher's own "Create org" item — no Stripe involved.
            await createSecondOrgFromAdminConsole(
              adminConsolePage,
              orgPage,
              secondOrgName,
            );
            await adminConsolePage.isDisplayingOrganization(secondOrgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Delete the second (current) organization → success toast',
          async () => {
            await adminConsolePage.openSettings();
            await adminConsolePage.deleteOrganization();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Redirected to the other, most-recently-active organization',
          async () => {
            await adminConsolePage.isDisplayingOrganization(firstOrgName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'The deleted organization no longer appears in the org switcher',
          async () => {
            await adminConsolePage.openOrgSwitcher();
            await adminConsolePage.isOrgListedInSwitcher(secondOrgName, false);
          },
        );
      },
    );

    enterpriseActivatedPageTest(
      qase(
        [3226],
        'Delete organization with at least one team and one file moves teams and files to default organization',
      ),
      async ({ page, orgPage, adminConsolePage, teamPage }) => {
        const dashboardPage = new DashboardPage(page);
        const mainPage = new MainPage(page);
        const orgName = createOrgName();
        const teamName = createTeamName();
        let orgAdminConsoleUrl = '';

        await enterpriseActivatedPageTest.step(
          'Setup: Enterprise already active (activation code), create an org, a team in it, and a file in that team',
          async () => {
            await createOrgForLicensedAccount(orgPage, orgName);
            orgAdminConsoleUrl = page.url();

            await adminConsolePage.goToFiles(orgName);

            await teamPage.createTeam(teamName);
            await dashboardPage.createFileViaPlaceholder();
            await mainPage.isMainPageLoaded();
            await mainPage.waitForChangeIsSaved();
          },
        );

        await enterpriseActivatedPageTest.step(
          "Back on the org's Admin Console, open the delete-organization explanation panel",
          async () => {
            await page.goto(orgAdminConsoleUrl);
            await adminConsolePage.page.reload();
            await adminConsolePage.openSettings();
            await adminConsolePage.openDeleteOrganizationPanel();
          },
        );

        await enterpriseActivatedPageTest.step(
          'Confirm → "Are you sure?" dialog shows the correct affected member/team/file counts',
          async () => {
            await adminConsolePage.clickDeleteOrganizationExplanationConfirm();
            await adminConsolePage.isDeleteOrgConfirmDialogVisible();
            await adminConsolePage.hasDeleteOrgAffectedCountsText(
              '1 members, 1 teams and their 1 files will be affected. This action cannot be undone.',
            );
          },
        );

        await enterpriseActivatedPageTest.step(
          'Expand "Affected teams" → the real team is listed',
          async () => {
            await adminConsolePage.expandAffectedTeams();
            await adminConsolePage.isTeamListedInAffectedTeams(teamName);
          },
        );

        await enterpriseActivatedPageTest.step(
          'Confirm deletion → success toast',
          async () => {
            await adminConsolePage.confirmDeleteOrganization();
          },
        );

        await enterpriseActivatedPageTest.step(
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

    enterprisePageTest(
      qase(
        [3353, 3434],
        'Show downgrade warning before switching plans, then cancel and reactivate the Enterprise plan',
      ),
      async ({ page, orgPage, adminConsolePage, stripePage }) => {
        const yourAccountPage = new YourAccountPage(page);
        const orgName = createOrgName();

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise and create an organization',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.goToFiles(orgName);
          },
        );

        // --- PENPOT-3353: downgrade warning, closed without confirming ---

        await enterprisePageTest.step(
          'Open Subscription page → Enterprise current, Professional listed with a Subscribe button',
          async () => {
            await yourAccountPage.open();
            await yourAccountPage.openSection('Subscription');
            await yourAccountPage.subscription.checkCurrentPlan(
              'Enterprise (trial)',
            );
          },
        );

        await enterprisePageTest.step(
          'Click Subscribe on Professional → warning modal (loses orgs, admin console, org config)',
          async () => {
            await yourAccountPage.subscription.clickSubscribeToProfessional();
            await yourAccountPage.subscription.checkDowngradeWarningIsVisible();
          },
        );

        await enterprisePageTest.step(
          'Close without confirming → no downgrade started, still Enterprise',
          async () => {
            await yourAccountPage.subscription.closeDowngradeWarningWithoutConfirming();
            await yourAccountPage.subscription.checkCurrentPlan(
              'Enterprise (trial)',
            );
          },
        );

        // --- PENPOT-3434: cancel, then reactivate, the same Enterprise plan ---

        await enterprisePageTest.step(
          'Manage your subscription → Stripe customer portal',
          async () => {
            await yourAccountPage.subscription.clickManageSubscription();
            await stripePage.isOnStripeBillingPage();
          },
        );

        await enterprisePageTest.step(
          'Cancel plan → review changes screen, optional reason, confirm → "Plan canceled" with end date shown',
          async () => {
            await stripePage.cancelSubscription();
          },
        );

        await enterprisePageTest.step(
          "Stripe's own active-plan detail shows the Canceled badge and end date",
          async () => {
            await stripePage.clickOnActivePlanLink();
            await stripePage.isCanceledBadgeVisible();
          },
        );

        await enterprisePageTest.step(
          'Back in Penpot: subscription page shows the plan active-until end date',
          async () => {
            await yourAccountPage.goto('Subscription');
            await stripePage.isCancelsEndsVisible();
          },
        );

        await enterprisePageTest.step(
          'Reactivate plan before the end date → confirm',
          async () => {
            await yourAccountPage.subscription.clickManageSubscription();
            await stripePage.isOnStripeBillingPage();
            await stripePage.reactivateSubscription();
          },
        );

        await enterprisePageTest.step(
          'Back in Penpot: Canceled/active-until state is cleared',
          async () => {
            await yourAccountPage.goto('Subscription');
            await stripePage.isCancelsEndsVisible(false);
            await yourAccountPage.subscription.checkCurrentPlan(
              'Enterprise (trial)',
            );
          },
        );
      },
    );

    enterprisePageTest(
      qase([3592], 'Cannot switch between Enterprise and Unlimited plans'),
      async ({ page, browser, stripePage }) => {
        // User A: this test's own demo account, put on the Unlimited plan.
        const yourAccountPageA = new YourAccountPage(page);

        // User B: a second, independent Enterprise account in its own org.
        const userBContext = await browser.newContext({
          baseURL: process.env.BASE_URL,
        });
        const userBPage = await userBContext.newPage();
        const yourAccountPageB = new YourAccountPage(userBPage);
        const orgPageB = new OrganizationPage(userBPage);
        const adminConsolePageB = new AdminConsolePage(userBPage);
        const stripePageB = new StripePage(userBPage);

        try {
          await enterprisePageTest.step(
            'Setup: User A on Unlimited, User B on Enterprise (its own org)',
            async () => {
              await yourAccountPageA.open();
              await yourAccountPageA.openSection('Subscription');
              await yourAccountPageA.subscription.startTrial('Unlimited');
              await yourAccountPageA.backToDashboard();

              await loginAsDemoAccount(userBPage);
              const orgBName = createOrgName();
              await subscribeAndCreateOrg(
                orgPageB,
                adminConsolePageB,
                stripePageB,
                orgBName,
              );
              // Back to the dashboard — the Admin Console's user menu has
              // no "profile-btn" testid, needed by YourAccountPage.open().
              await adminConsolePageB.goToFiles(orgBName);
            },
          );

          await enterprisePageTest.step(
            'User A (Unlimited): Manage subscription → Stripe "Update plan" only offers seat changes, no Enterprise switch',
            async () => {
              await yourAccountPageA.open();
              await yourAccountPageA.openSection('Subscription');
              await yourAccountPageA.subscription.clickManageSubscription();
              await stripePage.isOnStripeBillingPage();
              await stripePage.clickOnActivePlanLink();
              await stripePage.isUpdatePlanOptionAvailable();
            },
          );

          await enterprisePageTest.step(
            'User A: "Try it free for 14 days" on the Enterprise sidebar widget → Contact Sales modal, no Stripe checkout',
            async () => {
              await yourAccountPageA.goto('Subscription');
              await yourAccountPageA.subscription.clickTryItFreeFor14Days();
              await yourAccountPageA.subscription.checkContactSalesModalIsVisible();
              await stripePage.isOnStripeBillingPage(false);
              await yourAccountPageA.subscription.closeContactSalesModal();
            },
          );

          await enterprisePageTest.step(
            'User A: "Try 14 days for free" on the Enterprise plan card → Contact Sales modal, no Stripe checkout',
            async () => {
              await yourAccountPageA.subscription.clickTry14DaysForFree();
              await yourAccountPageA.subscription.checkContactSalesModalIsVisible();
              await stripePage.isOnStripeBillingPage(false);
              await yourAccountPageA.subscription.closeContactSalesModal();
            },
          );

          await enterprisePageTest.step(
            'User B (Enterprise): Manage subscription → Stripe offers no self-serve plan-switch option at all',
            async () => {
              await yourAccountPageB.open();
              await yourAccountPageB.openSection('Subscription');
              await yourAccountPageB.subscription.clickManageSubscription();
              await stripePageB.isOnStripeBillingPage();
              await stripePageB.clickOnActivePlanLink();
              // Enterprise's plan page never offers "Update plan" at all.
              await stripePageB.isUpdatePlanOptionAvailable(false);
            },
          );

          await enterprisePageTest.step(
            'User B: "Try it free for 14 days" on the Unlimited plan card → Contact Sales modal, no Stripe checkout',
            async () => {
              await yourAccountPageB.goto('Subscription');
              await yourAccountPageB.subscription.clickTryItFreeFor14Days();
              await yourAccountPageB.subscription.checkContactSalesModalIsVisible();
              await stripePageB.isOnStripeBillingPage(false);
              await yourAccountPageB.subscription.closeContactSalesModal();
            },
          );
        } finally {
          await userBContext.close();
        }
      },
    );
  },
);
