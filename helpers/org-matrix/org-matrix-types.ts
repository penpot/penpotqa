import type { APIRequestContext, Page } from '@playwright/test';

/** A member's role in a team. The `owner` is the user who creates the team. */
export type MatrixTeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

/**
 * One organization of an `OrgMatrix`. Every user it names must be listed in
 * `OrgMatrix.users`.
 */
export type MatrixOrgDefinition = {
  /** Who owns the organization (default: `OrgMatrix.loggedInUser`). Any owner
   * other than the logged-in user gets their own Enterprise license, so their
   * organizations are under a different subscription. */
  owner?: string;
  /** Teams of the organization: team key → { user → role }. Each team has
   * exactly one owner. */
  teams?: Record<string, Record<string, MatrixTeamRole>>;
  /** Organization members who belong to none of its teams. */
  members?: string[];
  /** Attributes of the organization: attribute name → users who hold it.
   * Every holder must be a member of this organization. */
  attributes?: Record<string, string[]>;
};

/**
 * The people, organizations, teams, roles and attributes a test needs, named as
 * its Qase case names them ('User2', 'orgA', 'apple'…). Each user is a demo
 * account whose display name is its name here, so nothing goes through email.
 */
export type OrgMatrix = {
  /** Every user the matrix uses, `loggedInUser` included. */
  users: string[];
  /** The user logged in on the test's own `page`, an Enterprise-licensed
   * account. Owns every organization that doesn't name another owner. */
  loggedInUser: string;
  /** The organizations, created in this order. */
  orgs: Record<string, MatrixOrgDefinition>;
};

/** A demo account with its own logged-in page, as `createDemoMember()` gives it. */
export type DemoMemberSession = {
  page: Page;
  email: string;
  name: string;
  request: APIRequestContext;
};

/** Creates a demo account named `name`, closed when the test ends; with
 * `openDashboard: false` its page stays blank. */
export type CreateDemoMember = (
  name: string,
  options?: { openDashboard?: boolean },
) => Promise<DemoMemberSession>;

/** A user of the built matrix. */
export type MatrixUser = {
  /** Display name, as written in the matrix and listed by the Admin Console. */
  name: string;
  /** Penpot profile id. */
  id: string;
  email: string;
  /** The user's API session, for Penpot API helpers. */
  request: APIRequestContext;
  /** A page logged in as the user. For the logged-in user, the test's own
   * `page`. For the others, a page of their own browser session: blank, except
   * for owners of an organization (on its Admin Console). Open a blank one with
   * `openDashboardAfterApiLogin(page)` (which also accepts the cookie banner)
   * before using it. */
  page: Page;
};

/** A team of the built matrix. */
export type MatrixTeam = { id: string; name: string };

/** An organization of the built matrix. */
export type MatrixOrg = {
  id: string;
  name: string;
  /** Part of its Admin Console URL. */
  slug: string;
  owner: MatrixUser;
  /** Its teams, by team key. */
  teams: Record<string, MatrixTeam>;
};

/** What `createOrgMatrix()` created, keyed as in the `OrgMatrix`. */
export type BuiltOrgMatrix = {
  users: Record<string, MatrixUser>;
  orgs: Record<string, MatrixOrg>;
};
