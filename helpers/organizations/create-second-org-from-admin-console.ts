import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';

/**
 * Creates an additional org via the Admin Console's own org switcher
 * ("+ Create org" item) rather than the dashboard sidebar — reliable, and
 * avoids ever losing the org context currently in (see PENPOT-3184).
 * Already Enterprise-entitled, so this is a straight shot to the naming
 * modal, no Stripe/activation step needed.
 *
 * Confirms the SPA has actually routed into the new org's own Admin
 * Console before returning — the naming modal closing alone doesn't
 * guarantee the route change is done yet. Doesn't force a reload itself:
 * a caller about to act on fresh cross-entity data right after (e.g.
 * inviting someone, which reads org membership) should reload explicitly
 * at that point — confirmed live that even once routed here, that data can
 * still read the previous org's stale cache otherwise — but callers that
 * only check UI listing state afterward don't need to pay for it.
 */
export async function createSecondOrgFromAdminConsole(
  adminConsolePage: AdminConsolePage,
  orgPage: OrganizationPage,
  orgName: string,
) {
  await adminConsolePage.openOrgSwitcher();
  await adminConsolePage.createOrganizationSwitcherItem.click();
  await orgPage.createOrganization(orgName);
  await adminConsolePage.isOnOrganizationAdminConsole(orgName);
}
