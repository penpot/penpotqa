import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { openDashboardAfterApiLogin } from 'helpers/accounts/login-as-demo-account';
import { activateEnterpriseLicense } from 'helpers/organizations/activate-enterprise-license';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createSecondOrgFromAdminConsole } from 'helpers/organizations/create-second-org-from-admin-console';
import { getOwnedOrganization } from 'helpers/organizations/get-owned-organization';
import type {
  MatrixOrg,
  MatrixUser,
  OrgMatrix,
} from 'helpers/org-matrix/org-matrix-types';

/**
 * Gives a matrix user an Enterprise license of their own, and reloads their
 * dashboard so it offers "Create organization".
 *
 * @param owner - The user who will own organizations.
 */
async function licenseOwner(owner: MatrixUser) {
  await activateEnterpriseLicense(owner.request);
  await openDashboardAfterApiLogin(owner.page);
}

/**
 * Creates an organization through its owner's UI: the owner's first one from
 * their dashboard, any later one from the org switcher of the Admin Console,
 * where creating the first one left them.
 *
 * @param owner - The organization's owner, already Enterprise-licensed.
 * @param isOwnersFirstOrg - Whether the owner has no organization yet.
 * @returns The new organization's name.
 */
async function createOrgAsOwner(
  owner: MatrixUser,
  isOwnersFirstOrg: boolean,
): Promise<string> {
  const orgPage = new OrganizationPage(owner.page);
  const name = createOrgName();
  if (isOwnersFirstOrg) {
    await createOrgForLicensedAccount(orgPage, name);
  } else {
    await createSecondOrgFromAdminConsole(
      new AdminConsolePage(owner.page),
      orgPage,
      name,
    );
  }
  return name;
}

/**
 * Creates the organizations of the matrix, in order. Each owner other than the
 * logged-in user (licensed by the fixture) first gets a license of their own.
 *
 * @param matrix - The matrix.
 * @param users - The matrix users, by name.
 * @returns The organizations, by org key (e.g. 'orgA'), with no teams yet.
 */
export async function createMatrixOrgs(
  matrix: OrgMatrix,
  users: Record<string, MatrixUser>,
): Promise<Record<string, MatrixOrg>> {
  const orgs: Record<string, MatrixOrg> = {};
  const ownersWithAnOrg = new Set<string>();

  for (const [orgKey, orgDefinition] of Object.entries(matrix.orgs)) {
    const owner = users[orgDefinition.owner ?? matrix.loggedInUser];
    const isOwnersFirstOrg = !ownersWithAnOrg.has(owner.name);
    if (isOwnersFirstOrg && owner.name !== matrix.loggedInUser) {
      await licenseOwner(owner);
    }

    const name = await createOrgAsOwner(owner, isOwnersFirstOrg);
    ownersWithAnOrg.add(owner.name);
    const { id, slug } = await getOwnedOrganization(owner.request, name);
    orgs[orgKey] = { id, name, slug, owner, teams: {} };
  }
  return orgs;
}
