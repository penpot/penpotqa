import {
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Page,
  expect,
} from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';
import { createDemoUser } from 'helpers/accounts/create-demo-user';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';
import { openDashboardAfterApiLogin } from 'helpers/accounts/login-as-demo-account';
import { createTeamInvitations } from 'helpers/teams/create-team-invitations';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { random } from 'helpers/string-generator';

/** A member's role in a team. `owner` is the team's creator. */
export type MatrixTeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * Declarative description of the people, teams and roles a test needs, keyed
 * by the names the Qase case uses ('user2', 'apple'…). Every user is a demo
 * account, so no email is involved. Each team must have exactly one owner.
 */
export type OrgMatrix = {
  /** Every user key the matrix uses, the org owner included. */
  users: string[];
  /** The user that owns the organization (the logged-in licensed account). */
  orgOwner: string;
  /** Teams of the organization: team key → { user key → role }. */
  teams: Record<string, Record<string, MatrixTeamRole>>;
  /** Attributes of the organization: attribute name → user keys holding it. */
  attributes?: Record<string, string[]>;
};

export type MatrixUser = {
  key: string;
  id: string;
  name: string;
  email: string;
  request: APIRequestContext;
  /** Opens (once) a page logged in as this user, on its dashboard. */
  page: () => Promise<Page>;
};

export type BuiltOrgMatrix = {
  users: Record<string, MatrixUser>;
  teams: Record<string, { id: string; name: string }>;
  close: () => Promise<void>;
};

const roleToInvitation: Record<Exclude<MatrixTeamRole, 'owner'>, InvitationRole> = {
  admin: InvitationRole.Admin,
  editor: InvitationRole.Editor,
  viewer: InvitationRole.Viewer,
};

async function joinTeam(
  inviter: APIRequestContext,
  member: MatrixUser,
  teamId: string,
  role: InvitationRole,
) {
  const [token] = await createTeamInvitations(inviter, teamId, [member.email], role);
  if (!token) throw new Error(`No invitation token for ${member.key}`);
  await callPenpotApi(member.request, 'verify-token', { token });
}

/**
 * Builds the teams and memberships of `matrix` inside an existing organization
 * owned by `ownerPage`'s account. All through Penpot's API:
 *
 * - every other user is a new demo account in its own browser context, named
 *   `<key>-<random>` so it can be told apart in the UI;
 * - a user joins the organization by accepting an invitation (token, no
 *   email) to one of its teams;
 * - a team owned by someone other than the org owner is created by that user,
 *   who first joins the org through a temporary team of the org owner, then
 *   leaves it, so the temporary team leaves no trace in roles.
 */
export async function buildOrgMatrix(
  browser: Browser,
  ownerPage: Page,
  organizationId: string,
  matrix: OrgMatrix,
): Promise<BuiltOrgMatrix> {
  const contexts: BrowserContext[] = [];
  const users: Record<string, MatrixUser> = {};
  const suffix = random().slice(0, 6);

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

  const ownerOf = (teamKey: string) => {
    const owners = Object.entries(matrix.teams[teamKey]).filter(
      ([, role]) => role === 'owner',
    );
    if (owners.length !== 1)
      throw new Error(`Team ${teamKey} needs exactly one owner`);
    return owners[0][0];
  };

  const createOrgTeam = async (owner: MatrixUser, name: string) => {
    const { id } = await callPenpotApi(owner.request, 'create-team', { name });
    await callPenpotApi(owner.request, 'add-team-to-organization', {
      teamId: id,
      organizationId,
    });
    return id as string;
  };

  // Team owners other than the org owner must be org members before they can
  // add their own team: let them in through a temporary team of the org owner.
  const otherOwners = [
    ...new Set(
      Object.keys(matrix.teams)
        .map(ownerOf)
        .filter((u) => u !== matrix.orgOwner),
    ),
  ];
  let bootstrapTeamId: string | undefined;
  if (otherOwners.length) {
    bootstrapTeamId = await createOrgTeam(
      users[matrix.orgOwner],
      `bootstrap-${suffix}`,
    );
    for (const key of otherOwners) {
      await joinTeam(
        ownerRequest,
        users[key],
        bootstrapTeamId,
        InvitationRole.Editor,
      );
    }
  }

  const teams: BuiltOrgMatrix['teams'] = {};
  for (const [teamKey, members] of Object.entries(matrix.teams)) {
    const owner = users[ownerOf(teamKey)];
    const name = `${teamKey}-${suffix}`;
    const id = await createOrgTeam(owner, name);
    teams[teamKey] = { id, name };
    for (const [userKey, role] of Object.entries(members)) {
      if (role === 'owner') continue;
      await joinTeam(owner.request, users[userKey], id, roleToInvitation[role]);
    }
  }

  if (bootstrapTeamId) {
    for (const key of otherOwners) {
      await callPenpotApi(ownerRequest, 'delete-team-member', {
        teamId: bootstrapTeamId,
        memberId: users[key].id,
      });
    }
    await callPenpotApi(ownerRequest, 'delete-team', { id: bootstrapTeamId });
  }

  if (matrix.attributes) {
    await createMatrixAttributes(ownerPage, matrix.attributes, users);
  }

  return {
    users,
    teams,
    close: async () => {
      await Promise.all(contexts.map((c) => c.close()));
    },
  };
}

/**
 * Creates the attributes and assigns their holders through the Admin Console
 * UI, as the org owner (attributes have no Penpot API). Expects `ownerPage` to
 * be inside the organization's Admin Console; leaves it on Attributes.
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
    await ownerPage.getByRole('button', { name: 'New attribute' }).first().click();
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
