/**
 * Qase suite: Admin Console (direct cases) / Subscriptions & Billing
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
import { LoginPage } from '@pages/login-page';
import { createDemoUser } from 'helpers/accounts/create-demo-user';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Admin Console (direct cases) / Subscriptions & Billing',
  () => {
    enterprisePageTest(
      qase([3093], 'Access Admin Console URL while already logged in'),
      async ({ page, adminConsolePage }) => {
        await enterprisePageTest.step(
          'Navigate to /admin-console while logged in → lands on it directly, no redirect to login',
          async () => {
            await page.goto('/admin-console');
            await adminConsolePage.isWelcomeCreateOrganizationButtonVisible();
            await adminConsolePage.isOnAdminConsoleRootUrl();
          },
        );
      },
    );

    enterprisePageTest(
      qase([3094], 'Access Admin Console URL while NOT logged in (valid URL)'),
      async ({ page, adminConsolePage }) => {
        /**
         * Uses its own fresh
         * createDemoUser() call (instead of the demoAccountApiFixture profile)
         * so the password is available for the re-login step — the fixture
         * itself never exposes it.
         */
        const loginPage = new LoginPage(page);
        const { email, password } = await createDemoUser(page.context().request);

        await enterprisePageTest.step(
          'Log out via the Admin Console user menu',
          async () => {
            await page.goto('/admin-console');
            await adminConsolePage.logout();
            await loginPage.isLoginPageUrlShown();
          },
        );

        await enterprisePageTest.step(
          'Navigate to /admin-console while logged out → redirected to the login page',
          async () => {
            await page.goto('/admin-console');
            await loginPage.isLoginPageUrlShown();
          },
        );

        await enterprisePageTest.step(
          'Log in → redirected back to the originally requested /admin-console path',
          async () => {
            await loginPage.enterEmailAndClickOnContinue(email);
            await loginPage.enterPwd(password);
            await loginPage.clickLoginButton();
            await adminConsolePage.isOnAdminConsoleRootUrl();
          },
        );
      },
    );

    enterprisePageTest(
      qase([3097], 'Log out of the Admin Console'),
      async ({ page, adminConsolePage }) => {
        const loginPage = new LoginPage(page);

        await enterprisePageTest.step(
          'Open the user menu → Logout option shown',
          async () => {
            await page.goto('/admin-console');
            await adminConsolePage.openUserMenu();
            await adminConsolePage.isLogoutMenuItemVisible();
          },
        );

        await enterprisePageTest.step(
          'Click Logout → session terminated, redirected to the login page',
          async () => {
            await adminConsolePage.clickLogout();
            await loginPage.isLoginPageUrlShown();
          },
        );
      },
    );

    enterprisePageTest(
      qase([3180], 'Access Admin Console via direct URL'),
      async ({ page, orgPage, adminConsolePage, stripePage }) => {
        const firstOrgName = createOrgName();
        const secondOrgName = createOrgName();
        let firstOrgSlug = '';
        let firstOrgId = '';

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise and create two organizations',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              firstOrgName,
            );
            ({ slug: firstOrgSlug, orgId: firstOrgId } =
              adminConsolePage.getOrgSlugAndIdFromUrl());

            // Second org: already Enterprise, so this goes straight through
            // the org switcher's own "Create org" item — no Stripe involved.
            // Also makes it the most-recently-visited org.
            await adminConsolePage.openOrgSwitcher();
            await adminConsolePage.createOrganizationSwitcherItem.click();
            await orgPage.createOrganization(secondOrgName);
          },
        );

        await enterprisePageTest.step(
          'Navigate to bare /admin-console (no org) → lands on the last-visited organization',
          async () => {
            // Second org was created (and is thus last-visited) right above
            // — checked here, before the next step's direct-URL visit to the
            // first org would make IT the new last-visited one instead.
            await page.goto('/admin-console');
            await adminConsolePage.isDisplayingOrganization(secondOrgName);
          },
        );

        await enterprisePageTest.step(
          'Navigate to /admin-console/organization/[org-name]/[org-id] directly → lands on that org’s console',
          async () => {
            await page.goto(
              `/admin-console/organization/${firstOrgSlug}/${firstOrgId}`,
            );
            await adminConsolePage.isOnOrganizationAdminConsole(firstOrgSlug);
            await adminConsolePage.isDisplayingOrganization(firstOrgName);
          },
        );
      },
    );

    enterprisePageTest(
      qase([3182], 'Access Admin Console from org navigation menu in design app'),
      async ({ orgPage, adminConsolePage, stripePage }) => {
        /**
         * Only step 1 is
         * automated here: opening the org nav menu from a team dashboard for
         * an org the account owns, and following its "Go to Admin Console"
         * link there. Step 2 (the active org NOT owned by the user) needs a
         * second account invited into another org's team first — deferred,
         * not automated in this case.
         */
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
            await adminConsolePage.goToFiles();
          },
        );

        await enterprisePageTest.step(
          'From the dashboard, open the org nav menu → "Go to Admin Console" → the active (owned) org’s console',
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.clickGoToAdminConsole();
            await adminConsolePage.isDisplayingOrganization(orgName);
          },
        );
      },
    );

    enterprisePageTest(
      qase([3184], 'Navigate between organizations from within Admin Console'),
      async ({ orgPage, adminConsolePage, stripePage }) => {
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

            await adminConsolePage.openOrgSwitcher();
            await adminConsolePage.createOrganizationSwitcherItem.click();
            await orgPage.createOrganization(secondOrgName);
          },
        );

        await enterprisePageTest.step(
          'Open the org nav menu in Admin Console → both organizations are listed',
          async () => {
            await adminConsolePage.openOrgSwitcher();
            await adminConsolePage.isOrgListedInSwitcher(firstOrgName);
            await adminConsolePage.isOrgListedInSwitcher(secondOrgName);
          },
        );

        await enterprisePageTest.step(
          'Click a different organization → taken to its Admin Console, correct details shown',
          async () => {
            await adminConsolePage.switchToOrg(firstOrgName);
            await adminConsolePage.isDisplayingOrganization(firstOrgName);
          },
        );
      },
    );
  },
);
