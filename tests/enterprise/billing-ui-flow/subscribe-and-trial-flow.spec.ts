/**
 * Qase suite: Cross-cutting: Enterprise Dashboard (direct) / Admin Console > Subscriptions & Billing / Admin Console (direct)
 *
 * These cases drive the real Stripe test-mode checkout/trial UI itself, not just an org that happens to have the Enterprise plan. Kept in their own file per the automation plan (section 2.6) — inherently slower/flakier than the rest of the suite.
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
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Cross-cutting: Enterprise Dashboard (direct) / Admin Console > Subscriptions & Billing / Admin Console (direct)',
  () => {
    enterprisePageTest(
      qase(
        [3235],
        'Create organization from dashboard when user is not part of any organization',
      ),
      async ({ page, orgPage, adminConsolePage, stripePage }) => {
        const orgName = createOrgName();

        await enterprisePageTest.step(
          'Click "+ Create org" → "Unlock Enterprise features" modal opens',
          async () => {
            await orgPage.clickCreateOrgFromSidebar();
            await orgPage.isEnterpriseModalVisible();
            await orgPage.isActivationCodeLinkVisible();
            await orgPage.isCurrentPlanLinkVisible();
          },
        );

        await enterprisePageTest.step(
          '"See my current plan" redirects to the subscriptions settings page',
          async () => {
            await orgPage.currentPlanLink.click();
            await orgPage.isOnSubscriptionsSettingsPage();
            await page.goBack();
          },
        );

        await enterprisePageTest.step(
          'Click the plan CTA → redirected to Stripe → complete payment',
          async () => {
            await orgPage.clickCreateOrgFromSidebar();
            await orgPage.clickTryItFreeButton();
            await stripePage.completeEnterpriseTrialCheckout();
            await orgPage.isSubscriptionConfirmedInUrl();
          },
        );

        await enterprisePageTest.step(
          'Enter a name and create → org created, redirected to the new org’s Admin Console',
          async () => {
            await adminConsolePage.clickWelcomeCreateOrganizationButton();
            await orgPage.createOrganization(orgName);
            await adminConsolePage.isOnOrganizationAdminConsole();
          },
        );
      },
    );

    enterprisePageTest(
      qase([3236], 'Create organization from the org navigation dropdown'),
      async ({ orgPage, adminConsolePage, stripePage }) => {
        const firstOrgName = createOrgName();
        const secondOrgName = createOrgName();

        await enterprisePageTest.step(
          'Setup: subscribe to Enterprise and create a first organization',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              firstOrgName,
            );
            await adminConsolePage.goToFiles();
          },
        );

        await enterprisePageTest.step(
          'Open organizations navigation dropdown → existing org listed, "Create org" option visible',
          async () => {
            await orgPage.openOrgSwitcher();
            await orgPage.isOrgListedInDropdown(firstOrgName);
            await orgPage.isCreateOrgDropdownItemVisible();
          },
        );

        await enterprisePageTest.step(
          'Click Create org → follow every step to create a new organization → lands on its Admin Console',
          async () => {
            await orgPage.clickCreateOrgFromDropdown();
            await orgPage.createOrganization(secondOrgName);
            await adminConsolePage.isOnOrganizationAdminConsole();
            await stripePage.isOnStripeCheckoutPage(false);
          },
        );
      },
    );

    enterprisePageTest(
      qase(
        [3336],
        'Check the "Unlock Enterprise features" widget starts the subscription process from the dashboard',
      ),
      async ({ orgPage }) => {
        await enterprisePageTest.step(
          'Navigate to the dashboard → "Unlock Enterprise features" widget is shown',
          async () => {
            await orgPage.isSidebarPromoVisible();
          },
        );

        await enterprisePageTest.step(
          'Click "Try it free for 14 days" → Enterprise subscription flow starts (modal opens)',
          async () => {
            await orgPage.sidebarPromoTryItFreeButton.click();
            await orgPage.isEnterpriseModalVisible();
          },
        );
      },
    );

    enterprisePageTest(
      qase(
        [3324],
        'Subscribe to an Enterprise plan and create an organization from the Admin Console',
      ),
      async ({ page, orgPage, adminConsolePage, stripePage }) => {
        const orgName = createOrgName();

        await enterprisePageTest.step(
          'Navigate directly to /admin-console → empty state with "Create organization" button',
          async () => {
            await page.goto('/admin-console');
            await adminConsolePage.isWelcomeCreateOrganizationButtonVisible();
          },
        );

        await enterprisePageTest.step(
          'Click "Create organization" → "Unlock Enterprise features" trial modal',
          async () => {
            await adminConsolePage.clickWelcomeCreateOrganizationButton();
            await adminConsolePage.isEnterpriseModalVisible();
            await adminConsolePage.isCurrentPlanLinkVisible();
          },
        );

        await enterprisePageTest.step(
          'Click "Try 14 days for free" → redirected to Stripe → complete trial signup',
          async () => {
            await adminConsolePage.clickTryItFreeButton();
            await stripePage.completeEnterpriseTrialCheckout();
            // This entry point's post-checkout redirect goes
            // through /admin-console/licenses/finish?session_id=...&callback=
            // and lands back on plain /admin-console/ — no
            // `?subscription=subscribed-to-penpot-nitrate` marker like the
            // dashboard entry point (PENPOT-3235) has. The welcome CTA being
            // clickable again is the real signal that checkout succeeded and
            // we're back, ready to name the org.
            await stripePage.isOnStripeCheckoutPage(false);
            await adminConsolePage.isWelcomeCreateOrganizationButtonVisible();
          },
        );

        await enterprisePageTest.step(
          'Enter a name and confirm → org created, redirected to the new org’s Admin Console as its only member',
          async () => {
            await adminConsolePage.clickWelcomeCreateOrganizationButton();
            await orgPage.createOrganization(orgName);
            await adminConsolePage.isOnOrganizationAdminConsole();
          },
        );
      },
    );

    enterprisePageTest.skip(
      qase(
        [3413],
        'Check 14-day free trial copy across the Enterprise subscription flow',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3413 for full detail):
         * 1. Dashboard → "Unlock Enterprise features" widget shown
         * 2. Widget button reads "Try it free for 14 days"
         * 3. Click it → subscription modal button reads the same
         * 4. Your subscription page → Enterprise button reads the same
         * 5. Click it → modal reopens with same copy
         * 6. Continue to Stripe → checkout shows the 14-day trial period
         * 7. Stripe shows the post-trial price next to the trial duration
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    enterprisePageTest.skip(
      qase(
        [3437],
        'Activate an Enterprise plan subscription with a valid manual activation code',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3437 for full detail):
         * 1. Dashboard shows "Activate with code" link next to the promo widget
         * 2. Click it → modal with code input + Activate button
         * 3. Same link/modal also present on the subscription page
         * 4. Enter a valid code, Activate → loading state, then validation completes
         * 5. "Welcome to Enterprise!" modal: active-until date, edit note, CREATE ORGANIZATION button
         * 6. Close modal → subscription page now shows Enterprise as active plan
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    enterprisePageTest.skip(
      qase([3664], 'Complete the Enterprise onboarding survey in the Admin Console'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3664 for full detail):
         * 1. Land on Admin Console welcome page after a fresh signup + Stripe payment → no survey yet
         * 2. Wait / move cursor → "Help us get to know you" modal appears with 2 dropdowns, Send disabled
         * 3. Modal explains why the answers are collected
         * 4. Answer "What kind of work do you do?" → Send still disabled
         * 5. Answer "What is your company size?" → Send enabled
         * 6. Click Send → modal closes
         * 7. User remains on the Admin Console, no redirect
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );
  },
);
