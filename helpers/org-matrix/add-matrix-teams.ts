import { joinOrganization } from 'helpers/organizations/join-organization';
import { addTeamMember } from 'helpers/teams/add-team-member';
import { createTeam } from 'helpers/teams/create-team';
import { createTeamName } from 'helpers/teams/create-team-name';
import { InvitationRole } from 'helpers/teams/invitation-role';
import type {
  MatrixOrg,
  MatrixOrgDefinition,
  MatrixTeam,
  MatrixTeamRole,
  MatrixUser,
} from 'helpers/org-matrix/org-matrix-types';
import { getTeamOwner } from 'helpers/org-matrix/validate-org-matrix';

const invitationRoles: Record<Exclude<MatrixTeamRole, 'owner'>, InvitationRole> = {
  admin: InvitationRole.Admin,
  editor: InvitationRole.Editor,
  viewer: InvitationRole.Viewer,
};

/**
 * Lists who must be an organization member before its teams exist: owners of
 * a team of their own (Penpot only lets members create teams in the
 * organization), and members with no team at all.
 *
 * @param org - The organization.
 * @param orgDefinition - The organization in the matrix.
 * @returns Their names, the organization's owner excluded (already a member).
 */
function getUsersToJoinFirst(
  org: MatrixOrg,
  orgDefinition: MatrixOrgDefinition,
): string[] {
  const teamOwners = Object.entries(orgDefinition.teams ?? {}).map(
    ([teamKey, roles]) => getTeamOwner(teamKey, roles),
  );
  return [...new Set([...teamOwners, ...(orgDefinition.members ?? [])])].filter(
    (user) => user !== org.owner.name,
  );
}

/**
 * Creates a team of the matrix in its organization, as the team's owner, and
 * adds the other members with their roles. Members who weren't in the
 * organization become members of it.
 *
 * @param org - The organization.
 * @param teamKey - The team's key in the matrix; its name starts with it.
 * @param roles - The team's members and their roles.
 * @param users - The matrix users, by name.
 * @returns The new team.
 */
async function createMatrixTeam(
  org: MatrixOrg,
  teamKey: string,
  roles: Record<string, MatrixTeamRole>,
  users: Record<string, MatrixUser>,
): Promise<MatrixTeam> {
  const owner = users[getTeamOwner(teamKey, roles)];
  const name = createTeamName(teamKey);
  const { teamId: id } = await createTeam(owner.request, name, org.id);
  for (const [user, role] of Object.entries(roles)) {
    if (role === 'owner') continue;
    await addTeamMember(owner.request, users[user], id, invitationRoles[role]);
  }
  return { id, name };
}

/**
 * Builds the teams and memberships of an organization of the matrix, all
 * through Penpot's API: first `joinOrganization()` for the users who must
 * already be members, then each team with its members.
 *
 * @param org - The organization; its `teams` are filled in.
 * @param orgDefinition - The organization in the matrix.
 * @param users - The matrix users, by name.
 */
export async function addMatrixTeams(
  org: MatrixOrg,
  orgDefinition: MatrixOrgDefinition,
  users: Record<string, MatrixUser>,
) {
  const joiners = getUsersToJoinFirst(org, orgDefinition).map((name) => users[name]);
  if (joiners.length) {
    await joinOrganization(org.owner.request, org.id, joiners);
  }
  for (const [teamKey, roles] of Object.entries(orgDefinition.teams ?? {})) {
    org.teams[teamKey] = await createMatrixTeam(org, teamKey, roles, users);
  }
}
