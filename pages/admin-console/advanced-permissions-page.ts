import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Named option labels for each Advanced Permissions dropdown, for typed use
 * with AdvancedPermissionsPage's selectPermission()/isPermissionSelected()
 * instead of hardcoding option text in each test.
 */
export const CreateTeamsPermission = {
  AnyMember: 'Any member of the organization',
  OnlyMe: 'Only me',
} as const;

/**
 * "Team owners" alone allows moving teams to any organization. Under it, the
 * "Only between organizations under this Enterprise subscription" checkbox
 * (see setSameSubscriptionOnly()) limits the destination.
 */
export const MoveTeamsPermission = {
  TeamOwners: 'Team owners',
  OnlyMeFromAdminConsole: 'Only me, from the Admin Console',
} as const;

export const SendInvitationsPermission = {
  OwnersAndAdmins: 'Team owners and admins',
  OwnersOnly: 'Team owners only',
} as const;

export const NewTeamMembersPermission = {
  AnyoneIncludingExternal: 'Anyone, including external users',
  OrganizationMembersOnly: 'Organization members only',
} as const;

export type AdvancedPermissionValue =
  | (typeof CreateTeamsPermission)[keyof typeof CreateTeamsPermission]
  | (typeof MoveTeamsPermission)[keyof typeof MoveTeamsPermission]
  | (typeof SendInvitationsPermission)[keyof typeof SendInvitationsPermission]
  | (typeof NewTeamMembersPermission)[keyof typeof NewTeamMembersPermission];

const PERMISSION_TITLES: Record<AdvancedPermissionValue, string> = {
  [CreateTeamsPermission.AnyMember]: 'Create Teams',
  [CreateTeamsPermission.OnlyMe]: 'Create Teams',
  [MoveTeamsPermission.TeamOwners]: 'Move teams across organizations',
  [MoveTeamsPermission.OnlyMeFromAdminConsole]: 'Move teams across organizations',
  [SendInvitationsPermission.OwnersAndAdmins]: 'Send invitations',
  [SendInvitationsPermission.OwnersOnly]: 'Send invitations',
  [NewTeamMembersPermission.AnyoneIncludingExternal]: 'New team members',
  [NewTeamMembersPermission.OrganizationMembersOnly]: 'New team members',
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Covers the Admin Console's Advanced Permissions tab
 * (/admin-console/organization/{slug}/{id}/permissions): 4 org-level
 * permissions (Create Teams, Move teams across organizations, Send
 * invitations, New team members), each a dropdown. Every change autosaves,
 * with no Save button, showing a "Permissions updated successfully." toast,
 * and survives a reload.
 */
export class AdvancedPermissionsPage extends BasePage {
  readonly permissionsSavedToast: Locator;
  readonly sameSubscriptionOnlyCheckbox: Locator;

  // New team members' "Organization members only" option: selecting it while
  // the org has pending invitations to non-members shows this inline warning
  // panel (not a modal, no role="dialog") instead of autosaving.
  readonly revokeInvitationsWarning: Locator;
  readonly cancelRevokeInvitationsButton: Locator;
  readonly applyAndRevokeInvitationsButton: Locator;

  constructor(page: Page) {
    super(page);

    this.permissionsSavedToast = page.getByText('Permissions updated successfully.');
    this.sameSubscriptionOnlyCheckbox = page.getByRole('checkbox', {
      name: 'Only between organizations under this Enterprise subscription',
    });

    this.revokeInvitationsWarning = page.getByText(
      'Switching will permanently cancel all pending invitations to people outside your organization.',
      { exact: true },
    );
    this.cancelRevokeInvitationsButton = page.getByRole('button', {
      name: 'Cancel',
      exact: true,
    });
    this.applyAndRevokeInvitationsButton = page.getByRole('button', {
      name: 'Apply and revoke invitations',
    });
  }

  /* -------------------------------------------------
   * Locator helpers
   * ------------------------------------------------- */

  /** The dropdown's accessible name is "<selected option> <permission title>". */
  private getPermissionDropdown(value: AdvancedPermissionValue): Locator {
    return this.page.getByRole('button', {
      name: new RegExp(`${escapeRegExp(PERMISSION_TITLES[value])}$`),
    });
  }

  private selectedName(value: AdvancedPermissionValue): RegExp {
    return new RegExp(
      `^${escapeRegExp(value)} ${escapeRegExp(PERMISSION_TITLES[value])}$`,
    );
  }

  private getPermissionOption(value: AdvancedPermissionValue): Locator {
    return this.page.getByRole('option', { name: value, exact: true });
  }

  /* -------------------------------------------------
   * Actions
   * ------------------------------------------------- */

  /**
   * Picks a permission option and confirms it persisted (reload, then check),
   * picking it again if it didn't: while the page hydrates, a click can land
   * on a node that is replaced right away. Skips the pick once the dropdown
   * already shows `value`, since picking the selected option shows no toast.
   */
  async selectPermission(value: AdvancedPermissionValue) {
    const dropdown = this.getPermissionDropdown(value);
    await expect(async () => {
      if ((await dropdown.innerText()).trim() !== value) {
        await dropdown.click({ timeout: 5000 });
        await this.getPermissionOption(value).click({ timeout: 5000 });
        await expect(
          this.permissionsSavedToast.last(),
          'Permissions updated successfully toast is shown',
        ).toBeVisible({ timeout: 5000 });
        await this.page.reload();
      }
      await expect(
        dropdown,
        `"${value}" permission is selected after reload`,
      ).toHaveAccessibleName(this.selectedName(value), { timeout: 5000 });
    }).toPass({ timeout: 45000 });
  }

  /**
   * Checks or unchecks "Only between organizations under this Enterprise
   * subscription", shown under Move teams' "Team owners" option, and confirms
   * it persisted after a reload, retrying like selectPermission().
   */
  async setSameSubscriptionOnly(checked: boolean) {
    await expect(async () => {
      if ((await this.sameSubscriptionOnlyCheckbox.isChecked()) !== checked) {
        await this.sameSubscriptionOnlyCheckbox.setChecked(checked, {
          force: true,
          timeout: 5000,
        });
        await expect(
          this.permissionsSavedToast.last(),
          'Permissions updated successfully toast is shown',
        ).toBeVisible({ timeout: 5000 });
        await this.page.reload();
      }
      checked
        ? await expect(
            this.sameSubscriptionOnlyCheckbox,
            'Same subscription only is checked after reload',
          ).toBeChecked({ timeout: 5000 })
        : await expect(
            this.sameSubscriptionOnlyCheckbox,
            'Same subscription only is unchecked after reload',
          ).not.toBeChecked({ timeout: 5000 });
    }).toPass({ timeout: 45000 });
  }

  /**
   * Picks "Organization members only" and waits for the warning panel,
   * retrying if it doesn't show (same hydration race as selectPermission()).
   * Assumes the org has pending invitations to non-members; otherwise the
   * option autosaves like any other (use selectPermission() instead).
   */
  async clickOrganizationMembersOnlyExpectingWarning() {
    const value = NewTeamMembersPermission.OrganizationMembersOnly;
    await expect(async () => {
      if (!(await this.revokeInvitationsWarning.isVisible())) {
        await this.getPermissionDropdown(value).click({ timeout: 5000 });
        await this.getPermissionOption(value).click({ timeout: 5000 });
      }
      await expect(
        this.revokeInvitationsWarning,
        'Revoke-pending-invitations warning panel is shown',
      ).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 30000 });
  }

  /** Confirms the warning panel raised by
   * clickOrganizationMembersOnlyExpectingWarning(), applying the restriction
   * and revoking every external pending invitation under the org. */
  async confirmApplyAndRevokeInvitations() {
    await this.applyAndRevokeInvitationsButton.click();
    await expect(
      this.permissionsSavedToast,
      'Permissions updated successfully toast is shown',
    ).toBeVisible();
  }

  async cancelApplyAndRevokeInvitations() {
    await this.cancelRevokeInvitationsButton.click();
  }

  /* -------------------------------------------------
   * Assertions
   * ------------------------------------------------- */

  async isRevokeInvitationsWarningVisible(visible = true) {
    visible
      ? await expect(
          this.revokeInvitationsWarning,
          'Revoke-pending-invitations warning panel is shown',
        ).toBeVisible()
      : await expect(
          this.revokeInvitationsWarning,
          'Revoke-pending-invitations warning panel is not shown',
        ).not.toBeVisible();
  }

  /** Opens the permission's dropdown, checks the option is listed, and closes it. */
  async isPermissionVisible(value: AdvancedPermissionValue) {
    await this.getPermissionDropdown(value).click();
    await expect(
      this.getPermissionOption(value),
      `"${value}" permission option is listed`,
    ).toBeVisible();
    await this.page.keyboard.press('Escape');
    await expect(this.getPermissionOption(value)).toHaveCount(0);
  }

  /**
   * Checks the PERSISTED state: reloads before reading the dropdown, since
   * under load the client-side re-render can stay stale even though the
   * setting saved.
   */
  async isPermissionSelected(value: AdvancedPermissionValue, selected = true) {
    const dropdown = this.getPermissionDropdown(value);
    await expect(async () => {
      await this.page.reload();
      selected
        ? await expect(
            dropdown,
            `"${value}" permission is selected`,
          ).toHaveAccessibleName(this.selectedName(value), { timeout: 5000 })
        : await expect(
            dropdown,
            `"${value}" permission is not selected`,
          ).not.toHaveAccessibleName(this.selectedName(value), { timeout: 5000 });
    }).toPass({ timeout: 20000 });
  }

  async isSameSubscriptionOnlyChecked(checked = true) {
    checked
      ? await expect(
          this.sameSubscriptionOnlyCheckbox,
          'Same subscription only is checked',
        ).toBeChecked()
      : await expect(
          this.sameSubscriptionOnlyCheckbox,
          'Same subscription only is unchecked',
        ).not.toBeChecked();
  }

  async isSameSubscriptionOnlyVisible(visible = true) {
    visible
      ? await expect(
          this.sameSubscriptionOnlyCheckbox,
          'Same subscription only checkbox is shown',
        ).toBeVisible()
      : await expect(
          this.sameSubscriptionOnlyCheckbox,
          'Same subscription only checkbox is not shown',
        ).toHaveCount(0);
  }
}
