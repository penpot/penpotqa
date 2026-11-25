import type { APIRequestContext, Page } from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';
import type {
  CreateDemoMember,
  MatrixUser,
  OrgMatrix,
} from 'helpers/org-matrix/org-matrix-types';

/**
 * Reads the profile id of the user an API session belongs to.
 *
 * @param request - The user's API session.
 * @returns The Penpot profile id.
 */
async function getProfileId(request: APIRequestContext): Promise<string> {
  const { id } = await callPenpotApi<{ id: string }>(request, 'get-profile');
  return id;
}

/**
 * Turns the test's own logged-in account into a matrix user, renamed so the
 * Admin Console lists it by its matrix name.
 *
 * @param name - The logged-in user's name in the matrix.
 * @param loggedInPage - The test's own page.
 * @returns The matrix user, whose `page` is `loggedInPage`.
 */
async function adoptLoggedInUser(
  name: string,
  loggedInPage: Page,
): Promise<MatrixUser> {
  const request = loggedInPage.context().request;
  await setDemoUserName(request, name);
  const { id, email } = await callPenpotApi<{ id: string; email: string }>(
    request,
    'get-profile',
  );
  return { name, id, email, request, page: loggedInPage };
}

/**
 * Creates a demo account for every user of the matrix but the logged-in one,
 * which is the test's own account. Their pages stay blank (no dashboard load).
 *
 * @param matrix - The matrix.
 * @param loggedInPage - The test's own page.
 * @param createDemoMember - The fixture that creates the other accounts and
 * closes them when the test ends.
 * @returns The users, by name.
 */
export async function createMatrixUsers(
  matrix: OrgMatrix,
  loggedInPage: Page,
  createDemoMember: CreateDemoMember,
): Promise<Record<string, MatrixUser>> {
  const users: Record<string, MatrixUser> = {};
  for (const name of matrix.users) {
    if (name === matrix.loggedInUser) {
      users[name] = await adoptLoggedInUser(name, loggedInPage);
    } else {
      // Only the API session is needed to build the matrix; the page opens
      // when the test (or the owner's licensing) uses it.
      const member = await createDemoMember(name, { openDashboard: false });
      users[name] = { ...member, id: await getProfileId(member.request) };
    }
  }
  return users;
}
