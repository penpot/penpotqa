import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';

/** An Enterprise organization, as Penpot's API identifies it. */
export type OwnedOrganization = { id: string; name: string; slug: string };

/**
 * Finds one of the user's own organizations by name via the API.
 *
 * @param ownerRequest - API session of the organization's owner.
 * @param orgName - Name the organization was created with.
 * @returns The organization's id, name and slug (the slug is part of its
 * Admin Console URL).
 */
export async function getOwnedOrganization(
  ownerRequest: APIRequestContext,
  orgName: string,
): Promise<OwnedOrganization> {
  const organizations: OwnedOrganization[] = await callPenpotApi(
    ownerRequest,
    'get-owned-organizations-summary',
  );
  const organization = organizations.find(({ name }) => name === orgName);
  if (!organization) {
    throw new Error(`The user owns no organization named "${orgName}"`);
  }
  const { id, name, slug } = organization;
  return { id, name, slug };
}
