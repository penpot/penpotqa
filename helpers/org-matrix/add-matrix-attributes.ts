import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { AttributesPage } from '@pages/admin-console/attributes-page';
import type { MatrixOrg } from 'helpers/org-matrix/org-matrix-types';

/**
 * Creates the attributes of an organization of the matrix and gives each one
 * to its holders, through the owner's Admin Console (attributes have no Penpot
 * API). Leaves the owner's page on the organization's Attributes section.
 *
 * @param org - The organization.
 * @param attributes - Attribute name → names of the users who hold it.
 */
export async function addMatrixAttributes(
  org: MatrixOrg,
  attributes: Record<string, string[]>,
) {
  // Opened by URL: switching orgs in the Admin Console can keep showing the
  // previous org's members for a while.
  await new AdminConsolePage(org.owner.page).gotoOrganization(org, 'attributes');
  const attributesPage = new AttributesPage(org.owner.page);
  for (const [attribute, holders] of Object.entries(attributes)) {
    await attributesPage.createAttribute(attribute);
    if (holders.length) {
      await attributesPage.addPeopleToAttribute(attribute, holders);
    }
  }
}
