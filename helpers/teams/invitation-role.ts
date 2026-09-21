/** Team/org invitation permission level — matches the values
 * `TeamPage`'s role-selector methods (`selectInvitationRoleInPopUp()` et
 * al., in `team-page.js`) switch on. Default is Editor. */
export enum InvitationRole {
  Editor = 'Editor',
  Admin = 'Admin',
  Owner = 'Owner',
  Viewer = 'Viewer',
}
