import type {
  MatrixOrgDefinition,
  MatrixTeamRole,
  OrgMatrix,
} from 'helpers/org-matrix/org-matrix-types';

/**
 * Finds the owner of a team of the matrix.
 *
 * @param teamKey - The team's key, for the error message.
 * @param roles - The team's members and their roles.
 * @returns The name of the team's only owner.
 * @throws When the team has no owner or more than one.
 */
export function getTeamOwner(
  teamKey: string,
  roles: Record<string, MatrixTeamRole>,
): string {
  const owners = Object.keys(roles).filter((user) => roles[user] === 'owner');
  if (owners.length !== 1) {
    throw new Error(`Org matrix: team '${teamKey}' needs exactly one owner`);
  }
  return owners[0];
}

/**
 * Lists everyone the matrix makes a member of an organization: its owner, the
 * members of its teams, and its members with no team.
 *
 * @param orgDefinition - The organization in the matrix.
 * @param owner - The organization owner's name.
 * @returns The members' names, without repeats.
 */
export function getOrgMemberNames(
  orgDefinition: MatrixOrgDefinition,
  owner: string,
): string[] {
  const teamMembers = Object.values(orgDefinition.teams ?? {}).flatMap(Object.keys);
  return [...new Set([owner, ...teamMembers, ...(orgDefinition.members ?? [])])];
}

/**
 * Checks that a matrix can be built, before anything is created: every user
 * is listed in `users`, every team has one owner, every attribute holder is
 * a member of the attribute's organization, and every attribute description
 * is for one of its attributes.
 *
 * @param matrix - The matrix to check.
 * @throws On the first problem found, naming where it is.
 */
export function validateOrgMatrix(matrix: OrgMatrix) {
  const knownUsers = new Set(matrix.users);
  const checkKnown = (user: string, where: string) => {
    if (!knownUsers.has(user)) {
      throw new Error(`Org matrix: unknown user '${user}' in ${where}`);
    }
  };

  checkKnown(matrix.loggedInUser, 'loggedInUser');
  for (const [orgKey, orgDefinition] of Object.entries(matrix.orgs)) {
    const owner = orgDefinition.owner ?? matrix.loggedInUser;
    checkKnown(owner, `${orgKey}.owner`);
    for (const user of orgDefinition.members ?? []) {
      checkKnown(user, `${orgKey}.members`);
    }
    for (const [teamKey, roles] of Object.entries(orgDefinition.teams ?? {})) {
      getTeamOwner(teamKey, roles);
      Object.keys(roles).forEach((user) =>
        checkKnown(user, `${orgKey}.teams.${teamKey}`),
      );
    }

    const orgMembers = new Set(getOrgMemberNames(orgDefinition, owner));
    for (const [attribute, holders] of Object.entries(
      orgDefinition.attributes ?? {},
    )) {
      for (const holder of holders) {
        checkKnown(holder, `${orgKey}.attributes.${attribute}`);
        if (!orgMembers.has(holder)) {
          throw new Error(
            `Org matrix: '${holder}' holds '${attribute}' in ${orgKey} but isn't a member of it`,
          );
        }
      }
    }
    for (const attribute of Object.keys(orgDefinition.attributeDescriptions ?? {})) {
      if (!(attribute in (orgDefinition.attributes ?? {}))) {
        throw new Error(
          `Org matrix: ${orgKey}.attributeDescriptions describes '${attribute}', which isn't one of its attributes`,
        );
      }
    }
  }
}
