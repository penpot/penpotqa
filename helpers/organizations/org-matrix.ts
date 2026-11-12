import {
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Page,
  expect,
} from '@playwright/test';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { AdminConsolePage } from '@pages/admin-console/admin-console-page';
import { callPenpotApi } from 'helpers/api/penpot-api';
import { createDemoUser } from 'helpers/accounts/create-demo-user';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';
import { openDashboardAfterApiLogin } from 'helpers/accounts/login-as-demo-account';
import { createTeamInvitations } from 'helpers/teams/create-team-invitations';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { createOrgForLicensedAccount } from 'helpers/organizations/create-org-for-licensed-account';
import { createSecondOrgFromAdminConsole } from 'helpers/organizations/create-second-org-from-admin-console';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { random } from 'helpers/string-generator';

/** A member's role in a team. `owner` is the team's creator. */
export type MatrixTeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

/** One organization of the matrix. Every key is a user key of `OrgMatrix.users`. */
export type MatrixOrg = {
  /** Teams of the organization: team key → { user key → role }. Each team has
   * exactly one owner. */
  teams?: Record<string, Record<string, MatrixTeamRole>>;
  /** Organization members who belong to none of its teams. */
  members?: string[];
  /** Attributes of the organization: attribute name → user keys holding it.
   * Every holder must be a member of this organization. */
  attributes?: Record<string, string[]>;
};

/**
 * Declarative description of the people, organizations, teams, roles and
 * attributes a test needs, keyed by the names the Qase case uses ('user2',
 * 'orgA', 'apple'…). Every user is a demo account, so no email is involved.
 *
 * All organizations belong to `orgOwner`, the licensed account the test is
 * logged in with, so they share its Enterprise subscription.
 */
export type OrgMatrix = {
  /** Every user key the matrix uses, `orgOwner` included. */
  users: string[];
  /** The user that owns every organization (the test's licensed account). */
  orgOwner: string;
  /** Organizations, created in this order. */
  orgs: Record<string, MatrixOrg>;
};

export type MatrixUser = {
  key: string;
  id: string;
  /** Display name, `<key>-<random>`, as the Admin Console lists it. */
  name: string;
  email: string;
  request: APIRequestContext;
  /** Opens (once) a page logged in as this user, on its dashboard. For the
   * org owner, the test's own page. */
  page: () => Promise<Page>;
};

export type BuiltMatrixOrg = {
  id: string;
  name: string;
  teams: Record<string, { id: string; name: string }>;
};

export type BuiltOrgMatrix = {
  users: Record<string, MatrixUser>;
  orgs: Record<string, BuiltMatrixOrg>;
  /** Closes the browser contexts of the users other than the org owner. */
  close: () => Promise<void>;
};

const roleToInvitation: Record<Exclude<MatrixTeamRole, 'owner'>, InvitationRole> = {
  admin: InvitationRole.Admin,
  editor: InvitationRole.Editor,
  viewer: InvitationRole.Viewer,
};

function ownerOf(teamKey: string, members: Record<string, MatrixTeamRole>) {
  const owners = Object.entries(members).filter(([, role]) => role === 'owner');
  if (owners.length !== 1) {
    throw new Error(`Org matrix: team '${teamKey}' needs exactly one owner`);
  }
  return owners[0][0];
}

/** Throws on a matrix that can't be built, before anything is created. */
function validateMatrix(matrix: OrgMatrix) {
  const known = new Set(matrix.users);
  const check = (key: string, where: string) => {
    if (!known.has(key)) {
      throw new Error(`Org matrix: unknown user '${key}' in ${where}`);
    }
  };
  check(matrix.orgOwner, 'orgOwner');
  for (const [orgKey, org] of Object.entries(matrix.orgs)) {
    const orgMembers = new Set([matrix.orgOwner, ...(org.members ?? [])]);
    (org.members ?? []).forEach((u) => check(u, `${orgKey}.members`));
    for (const [teamKey, members] of Object.entries(org.teams ?? {})) {
      ownerOf(teamKey, members);
      Object.keys(members).forEach((u) => {
        check(u, `${orgKey}.teams.${teamKey}`);
        orgMembers.add(u);
      });
    }
    for (const [attribute, holders] of Object.entries(org.attributes ?? {})) {
      for (const u of holders) {
        check(u, `${orgKey}.attributes.${attribute}`);
        if (!orgMembers.has(u)) {
          throw new Error(
            `Org matrix: '${u}' holds '${attribute}' in ${orgKey} but isn't a member of it`,
          );
        }
      }
    }
  }
}

async function joinTeam(
  inviter: APIRequestContext,
  member: MatrixUser,
  teamId: string,
  role: InvitationRole,
) {
  const [token] = await createTeamInvitations(inviter, teamId, [member.email], role);
  if (!token) throw new Error(`Org matrix: no invitation token for ${member.key}`);
  await callPenpotApi(member.request, 'verify-token', { token });
}

/**
 * Builds `matrix` for the licensed account logged in on `ownerPage`, which
 * must be on its dashboard with no organization yet:
 *
 * - the organizations are created through the UI (the first from the
 *   dashboard, the others from the Admin Console's org switcher);
 * - every other user is a new demo account in its own browser context, named
 *   `<key>-<random>` so it can be told apart in the UI;
 * - teams and memberships go through Penpot's API. A user joins an
 *   organization by accepting an invitation (token, no email) to one of its
 *   teams. Team owners other than the org owner, and members with no team,
 *   join first through a temporary team of the org owner, which is deleted
 *   afterwards: leaving a team keeps the organization membership;
 * - attributes are created and assigned through the Admin Console UI, since
 *   they have no Penpot API.
 *
 * Leaves `ownerPage` in the Admin Console of the first organization.
 */
export async function buildOrgMatrix(
  browser: Browser,
  ownerPage: Page,
  matrix: OrgMatrix,
): Promise<BuiltOrgMatrix> {
  validateMatrix(matrix);
  const orgPage = new OrganizationPage(ownerPage);
  const adminConsolePage = new AdminConsolePage(ownerPage);
  const contexts: BrowserContext[] = [];
  const users: Record<string, MatrixUser> = {};
  const suffix = random().slice(0, 6);

  // Organizations first: creating one routes the owner's page into it.
  const orgs: Record<string, BuiltMatrixOrg> = {};
  for (const [index, orgKey] of Object.keys(matrix.orgs).entries()) {
    const name = createOrgName();
    if (index === 0) await createOrgForLicensedAccount(orgPage, name);
    else await createSecondOrgFromAdminConsole(adminConsolePage, orgPage, name);
    const id = new URL(ownerPage.url()).pathname.split('/')[4];
    orgs[orgKey] = { id, name, teams: {} };
  }

  const ownerRequest = ownerPage.context().request;
  const ownerProfile = await callPenpotApi(ownerRequest, 'get-profile');
  users[matrix.orgOwner] = {
    key: matrix.orgOwner,
    id: ownerProfile.id,
    name: ownerProfile.fullname,
    email: ownerProfile.email,
    request: ownerRequest,
    page: async () => ownerPage,
  };

  for (const key of matrix.users.filter((u) => u !== matrix.orgOwner)) {
    const context = await browser.newContext();
    contexts.push(context);
    const { email } = await createDemoUser(context.request);
    const name = `${key}-${suffix}`;
    await setDemoUserName(context.request, name);
    const { id } = await callPenpotApi(context.request, 'get-profile');
    let page: Page | undefined;
    users[key] = {
      key,
      id,
      name,
      email,
      request: context.request,
      page: async () => {
        if (!page) {
          page = await context.newPage();
          await openDashboardAfterApiLogin(page);
        }
        return page;
      },
    };
  }

  for (const [orgKey, org] of Object.entries(matrix.orgs)) {
    await buildOrgTeams(orgs[orgKey], org, matrix.orgOwner, users, suffix);
  }

  for (const [orgKey, org] of Object.entries(matrix.orgs)) {
    if (!org.attributes || !Object.keys(org.attributes).length) continue;
    await openOrgAdminConsole(adminConsolePage, orgs[orgKey]);
    await createMatrixAttributes(ownerPage, org.attributes, users);
  }
  await openOrgAdminConsole(adminConsolePage, Object.values(orgs)[0]);

  return {
    users,
    orgs,
    close: async () => {
      await Promise.all(contexts.map((c) => c.close()));
    },
  };
}

async function buildOrgTeams(
  built: BuiltMatrixOrg,
  org: MatrixOrg,
  orgOwner: string,
  users: Record<string, MatrixUser>,
  suffix: string,
) {
  const ownerRequest = users[orgOwner].request;
  const teams = Object.entries(org.teams ?? {});

  const createOrgTeam = async (owner: MatrixUser, name: string) => {
    const { id } = await callPenpotApi(owner.request, 'create-team', { name });
    await callPenpotApi(owner.request, 'add-team-to-organization', {
      teamId: id,
      organizationId: built.id,
    });
    return id as string;
  };

  // Who must already be an org member before the teams exist: owners of their
  // own team (to add it to the org), and members with no team at all.
  const toBootstrap = [
    ...new Set([
      ...teams.map(([teamKey, members]) => ownerOf(teamKey, members)),
      ...(org.members ?? []),
    ]),
  ].filter((u) => u !== orgOwner);

  let bootstrapTeamId: string | undefined;
  if (toBootstrap.length) {
    bootstrapTeamId = await createOrgTeam(users[orgOwner], `bootstrap-${suffix}`);
    for (const key of toBootstrap) {
      await joinTeam(
        ownerRequest,
        users[key],
        bootstrapTeamId,
        InvitationRole.Editor,
      );
    }
  }

  for (const [teamKey, members] of teams) {
    const owner = users[ownerOf(teamKey, members)];
    const name = `${teamKey}-${suffix}`;
    const id = await createOrgTeam(owner, name);
    built.teams[teamKey] = { id, name };
    for (const [userKey, role] of Object.entries(members)) {
      if (role === 'owner') continue;
      await joinTeam(owner.request, users[userKey], id, roleToInvitation[role]);
    }
  }

  if (bootstrapTeamId) {
    for (const key of toBootstrap) {
      await callPenpotApi(ownerRequest, 'delete-team-member', {
        teamId: bootstrapTeamId,
        memberId: users[key].id,
      });
    }
    await callPenpotApi(ownerRequest, 'delete-team', { id: bootstrapTeamId });
  }
}

async function openOrgAdminConsole(
  adminConsolePage: AdminConsolePage,
  org: BuiltMatrixOrg,
) {
  if (!adminConsolePage.page.url().includes(org.id)) {
    await adminConsolePage.switchToOrg(org.name);
    await expect(adminConsolePage.page).toHaveURL(new RegExp(org.id));
  }
  // After a switch (or creating another org) the Admin Console can still read
  // the previous org's cached data, e.g. its members: reload to drop it.
  await adminConsolePage.page.reload();
  await adminConsolePage.isOnOrganizationAdminConsole(org.name);
}

/**
 * Creates the attributes and assigns their holders through the Admin Console
 * UI, as the org owner. Expects `ownerPage` in the organization's Admin
 * Console; leaves it on Attributes.
 */
async function createMatrixAttributes(
  ownerPage: Page,
  attributes: Record<string, string[]>,
  users: Record<string, MatrixUser>,
) {
  // Client-side navigation: clicks after a direct goto don't always register.
  await ownerPage.getByRole('link', { name: 'Attributes' }).click();
  await expect(ownerPage).toHaveURL(/\/attributes$/);

  for (const [attribute, holders] of Object.entries(attributes)) {
    // Right after a reload a click can land before the page is interactive:
    // retry until the name field of the new attribute has the focus.
    await expect(async () => {
      await ownerPage.getByRole('button', { name: 'New attribute' }).first().click();
      await expect(ownerPage.getByRole('textbox').first()).toBeFocused({
        timeout: 2000,
      });
    }).toPass({ timeout: 15000 });
    await ownerPage.keyboard.type(attribute);
    await ownerPage.keyboard.press('Enter');
    const cell = ownerPage.getByRole('cell', { name: attribute, exact: true });
    await expect(cell).toBeVisible();
    await ownerPage.keyboard.press('Escape');
    if (!holders.length) continue;

    await cell.click();
    const panel = ownerPage.getByRole('complementary', {
      name: `${attribute} attribute`,
    });
    await panel.getByRole('button', { name: 'Add people' }).click();
    const dialog = ownerPage.getByRole('dialog', {
      name: `Add people to ${attribute}`,
    });
    for (const key of holders) {
      // The <input> is hidden behind its styled box: click the member's name.
      await dialog.getByText(users[key].name, { exact: true }).click();
      await expect(
        dialog.getByRole('checkbox', { name: new RegExp(`^${users[key].name} `) }),
      ).toBeChecked();
    }
    await ownerPage.keyboard.press('Escape');
    await expect(
      panel.getByRole('heading', { name: `People ${holders.length}` }),
    ).toBeVisible();
    await panel.getByRole('button', { name: 'Close attribute' }).click();
  }
}
