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
  // The naming modal closing doesn't guarantee the SPA has actually routed
  // into the new org's Admin Console yet — a caller creating a team right
  // after can otherwise race it and land the team outside the org entirely.
  await orgPage.isOnOrgAdminConsoleUrl(orgName);
}
