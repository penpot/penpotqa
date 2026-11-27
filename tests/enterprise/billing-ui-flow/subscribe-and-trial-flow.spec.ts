/**
 * Qase suite: Cross-cutting: Enterprise Dashboard (direct) / Admin Console > Subscriptions & Billing / Admin Console (direct)
 *
 * These cases drive the real Stripe checkout, so they're slower and flakier
 * than the rest of the suite, and kept in their own file.
 *
 * Base: `enterprisePageTest` (see enterprise-fixtures.ts), which goes through
 * the real Stripe checkout.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { requestActivationCode } from 'helpers/organizations/activate-enterprise-license';
import { enterprisePageTest } from '@tests/enterprise/fixtures/enterprise-fixtures';

enterprisePageTest.describe(
  'Cross-cutting: Enterprise Dashboard (direct) / Admin Console > Subscriptions & Billing / Admin Console (direct)',
  () => {
    enterprisePageTest(
      qase(
        [3235, 3236],
        'Create an organization from the dashboard when the user is not part of any organization, then a second one from the org navigation dropdown',
      ),
      async ({ page, orgPage, adminConsolePage, stripePage }) => {
        const orgName = createOrgName();
        const secondOrgName = createOrgName();

        await enterprisePageTest.step(
          '(3235) Click "+ Create org" → "Unlock Enterprise features" modal opens',
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

        await enterprisePageTest.step(
          '(3236) Open organizations navigation dropdown → existing org listed, "Create org" option visible',
          async () => {
            await adminConsolePage.goToFiles(orgName);
            await orgPage.openOrgSwitcher();
            await orgPage.isOrgListedInDropdown(orgName);
            await orgPage.isCreateOrgDropdownItemVisible();
          },
        );

        await enterprisePageTest.step(
          'Click Create org → follow every step to create a new organization → lands on its Admin Console, with no new checkout',
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
            // No confirmation URL marker on this entry point (unlike 3235's):
            // the welcome CTA coming back is the signal checkout finished.
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

    enterprisePageTest(
      qase(
        [3336, 3413],
        'The "Unlock Enterprise features" widget starts the subscription process, with the 14-day free trial copy across the flow',
      ),
      async ({ orgPage, stripePage }) => {
        await enterprisePageTest.step(
          '(3336) Dashboard → "Unlock Enterprise features" widget shown, reads "Try it free for 14 days"',
          async () => {
            await orgPage.isSidebarPromoVisible();
            await orgPage.hasSidebarPromoTryButtonText('Try it free for 14 days');
          },
        );

        await enterprisePageTest.step(
          'Click it → Enterprise subscription flow starts (modal opens), button reads the same',
          async () => {
            await orgPage.sidebarPromoTryItFreeButton.click();
            await orgPage.isEnterpriseModalVisible();
            await orgPage.hasTryItFreeButtonText('Try it free for 14 days');
          },
        );

        await enterprisePageTest.step(
          '(3413) Check 14-day free trial copy across the Enterprise subscription flow',
          async () => {
            await enterprisePageTest.step(
              '"See my current plan" → subscriptions settings page → Enterprise plan\'s own button',
              async () => {
                await orgPage.currentPlanLink.click();
                await orgPage.isOnSubscriptionsSettingsPage();
                await orgPage.hasSubscriptionsPageEnterpriseTryButtonText(
                  'Try 14 days for free',
                );
              },
            );

            await enterprisePageTest.step(
              'Click it → its own confirmation modal reopens with matching copy',
              async () => {
                await orgPage.clickSubscriptionsPageEnterpriseTryButton();
                await orgPage.isSubscriptionConfirmModalVisible();
                await orgPage.hasSubscriptionConfirmModalTryButtonValue(
                  'Try 14 days for free',
                );
              },
            );

            await enterprisePageTest.step(
              'Continue to Stripe → checkout shows the trial duration and post-trial price',
              async () => {
                await orgPage.clickSubscriptionConfirmModalPrimaryButton();
                await stripePage.isOnStripeCheckoutPage();
                await stripePage.isTrialCopyVisible();
              },
            );
          },
        );
      },
    );

    enterprisePageTest(
      qase(
        [3437],
        'Activate an Enterprise plan subscription with a valid manual activation code',
      ),
      async ({ page, orgPage }) => {
        await enterprisePageTest.step(
          'The activation-code option is also present on the subscriptions settings page',
          async () => {
            await orgPage.clickCreateOrgFromSidebar();
            await orgPage.isEnterpriseModalVisible();
            await orgPage.currentPlanLink.click();
            await orgPage.isOnSubscriptionsSettingsPage();
            await orgPage.isSubscriptionsPageActivationCodeButtonVisible();
            await page.goBack();
          },
        );

        await enterprisePageTest.step(
          'Enter a valid activation code from the dashboard\'s own modal → "Welcome to Enterprise!"',
          async () => {
            await orgPage.clickCreateOrgFromSidebar();
            await orgPage.isEnterpriseModalVisible();
            await orgPage.clickActivationCodeLink();

            const code = await requestActivationCode(page.context().request);
            await orgPage.enterActivationCode(code);
            await orgPage.clickActivateCode();
            await orgPage.isWelcomeToEnterpriseModalShown();
          },
        );

        await enterprisePageTest.step(
          'Closing the modal leaves Enterprise active as the current plan',
          async () => {
            await orgPage.closeWelcomeToEnterpriseModal();
            await orgPage.hasCurrentPlanSidebarText('Enterprise');
          },
        );
      },
    );
  },
);
