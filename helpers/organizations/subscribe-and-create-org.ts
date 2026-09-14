import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { StripePage } from '@pages/dashboard/stripe-page';

/**
 * The most common Enterprise test setup: from the dashboard sidebar's
 * "+ Create org" button, through a real Stripe test-mode checkout, to a
 * newly named organization. Extracted here because this exact 5-step
 * sequence was duplicated verbatim across 17 call sites in 11 spec files —
 * see `tests/enterprise/README.md`'s "How Enterprise entitlement actually
 * works" section for why every one of them still has to go through Stripe
 * for real, rather than some cheaper shortcut.
 *
 * Not a fit for every case, though — some deliberately exercise a
 * *different* entry point (the Admin Console welcome screen directly, e.g.
 * PENPOT-3324; the org switcher dropdown's "Create org" item for a second,
 * already-Enterprise org, e.g. PENPOT-3236) precisely because that's what
 * they're testing. Those keep their own inline steps rather than calling
 * this.
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
}
