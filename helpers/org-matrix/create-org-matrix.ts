import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { type Page, test } from '@playwright/test';
import { addMatrixAttributes } from 'helpers/org-matrix/add-matrix-attributes';
import { addMatrixTeams } from 'helpers/org-matrix/add-matrix-teams';
import { createMatrixOrgs } from 'helpers/org-matrix/create-matrix-orgs';
import { createMatrixUsers } from 'helpers/org-matrix/create-matrix-users';
import type {
  BuiltOrgMatrix,
  CreateDemoMember,
  MatrixOrg,
  OrgMatrix,
} from 'helpers/org-matrix/org-matrix-types';
import { validateOrgMatrix } from 'helpers/org-matrix/validate-org-matrix';

/**
 * Leaves the logged-in user in the Admin Console of the first organization
 * they own, if any, ready for the test to start.
 *
 * @param matrix - The matrix.
 * @param orgs - The built organizations, by org key (e.g. 'orgA').
 * @param loggedInPage - The test's own page.
 */
async function openLoggedInUsersFirstOrg(
  matrix: OrgMatrix,
  orgs: Record<string, MatrixOrg>,
  loggedInPage: Page,
) {
  const firstOwnedOrg = Object.values(orgs).find(
    (org) => org.owner.name === matrix.loggedInUser,
  );
  if (firstOwnedOrg) {
    await new AdminConsolePage(loggedInPage).gotoOrganization(firstOwnedOrg);
  }
}

/**
 * Builds everything an `OrgMatrix` describes, each phase as its own report
 * step:
 *
 * 1. **Users**: the logged-in user is the test's own account; every other user
 *    is a demo account from `createDemoMember()`.
 * 2. **Organizations**: created through each owner's UI, in matrix order.
 * 3. **Teams**: through Penpot's API, with team invitation tokens instead of
 *    email (see `addMatrixTeams()`).
 * 4. **Attributes**: through each owner's Admin Console.
 *
 * Then leaves the logged-in user in the Admin Console of their first
 * organization. Use it through the `buildOrgMatrix` fixture.
 *
 * @param matrix - The matrix to build; checked first by `validateOrgMatrix()`.
 * @param loggedInPage - The test's own page, logged in as an Enterprise-licensed
 * account on its dashboard.
 * @param createDemoMember - The fixture that creates the other accounts.
 * @returns The users and organizations, named as in the matrix.
 */
export async function createOrgMatrix(
  matrix: OrgMatrix,
  loggedInPage: Page,
  createDemoMember: CreateDemoMember,
): Promise<BuiltOrgMatrix> {
  validateOrgMatrix(matrix);
  const orgDefinitions = Object.entries(matrix.orgs);

  const users = await test.step(`Org matrix: users ${matrix.users.join(', ')}`, () =>
    createMatrixUsers(matrix, loggedInPage, createDemoMember));
  const orgs =
    await test.step(`Org matrix: organizations ${Object.keys(matrix.orgs).join(', ')}`, () =>
      createMatrixOrgs(matrix, users));
  for (const [orgKey, orgDefinition] of orgDefinitions) {
    if (!orgDefinition.teams && !orgDefinition.members) continue;
    await test.step(`Org matrix: teams and members of ${orgKey}`, () =>
      addMatrixTeams(orgs[orgKey], orgDefinition, users));
  }
  for (const [orgKey, { attributes, attributeDescriptions }] of orgDefinitions) {
    if (!attributes) continue;
    await test.step(`Org matrix: attributes of ${orgKey}`, () =>
      addMatrixAttributes(orgs[orgKey], attributes, attributeDescriptions));
  }

  await openLoggedInUsersFirstOrg(matrix, orgs, loggedInPage);
  return { users, orgs };
}
