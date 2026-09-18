import { OrganizationPage } from '@pages/dashboard/organization-page';

/**
 * Enterprise org creation counterpart to `subscribeAndCreateOrg`, for an
 * account already Enterprise-entitled via `activateEnterpriseLicense`
 * (`enterpriseActivatedPageTest`) rather than a Stripe checkout. The
 * sidebar's promo widget already reads "Create organization" in that state
 * and jumps straight to the naming modal — see `sidebarPromoCreateOrgButton`
 * in `organization-page.ts` — so there's no "Unlock Enterprise features"
 * modal or checkout step to drive through first.
 */
export async function createOrgForLicensedAccount(
  orgPage: OrganizationPage,
  orgName: string,
) {
  await orgPage.sidebarPromoCreateOrgButton.click();
  await orgPage.createOrganization(orgName);
}
