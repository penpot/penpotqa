import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { StripePage } from '@pages/dashboard/stripe-page';

/**
 * The most common Enterprise test setup: from the org/team switcher's
 * "Create new organization" item, through a real Stripe checkout, to a named
 * organization. Deduplicated from 17 call sites in 11 spec files — see
 * `tests/enterprise/README.md`'s "How Enterprise entitlement actually
 * works" for the Stripe vs. activation-code (`enterpriseActivatedPageTest`)
 * split.
 *
 * Not a fit for cases exercising a different entry point (e.g. PENPOT-3324,
 * PENPOT-3236) or the checkout UI itself — those keep their own steps.
 */
export async function subscribeAndCreateOrg(
  orgPage: OrganizationPage,
  adminConsolePage: AdminConsolePage,
  stripePage: StripePage,
  orgName: string,
) {
  await orgPage.clickCreateOrgFromSidebar();
  await orgPage.clickTryItFreeButton();
  await stripePage.completeEnterpriseTrialCheckout();
  await adminConsolePage.clickWelcomeCreateOrganizationButton();
  await orgPage.createOrganization(orgName);
  // The naming modal closing doesn't guarantee the SPA has actually routed
  // into the new org's Admin Console yet — a caller creating a team right
  // after can otherwise race it and land the team outside the org entirely.
  await adminConsolePage.isOnOrganizationAdminConsole(orgName);
}
