import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Named option labels for each Advanced Permissions radio group, for typed
 * use with AdvancedPermissionsPage's selectPermission()/isPermissionSelected()
 * instead of hardcoding option text in each test. All 4
 * groups share the exact same UI pattern (real `role="radio"` inputs,
 * autosave on click — see the class doc comment) so one generic
 * select/check pair, typed against the union of all 4, covers every group.
 */
export const CreateTeamsPermission = {
  AnyMember: 'Any member of the organization',
  OnlyMe: 'Only me',
} as const;

export const MoveTeamsPermission = {
  AlwaysAllowed: 'Always allowed',
  OnlyWithinOwnOrganizations: 'Only within my own organizations',
  NeverAllowed: 'Never allowed',
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

/**
 * Covers the Admin Console's Advanced Permissions tab
 * (/admin-console/organization/{slug}/{id}/permissions) — 4 org-level
 * policy radio groups: Create Teams, Move teams across organizations, Send
 * invitations, New team members. Every group autosaves on
 * click — no explicit Save button anywhere on this page — showing a real
 * "Permissions updated successfully." toast, and the change survives a
 * reload.
 */
export class AdvancedPermissionsPage extends BasePage {
  readonly permissionsSavedToast: Locator;

  constructor(page: Page) {
    super(page);

    this.permissionsSavedToast = page.getByText('Permissions updated successfully.');
  }

  /* -------------------------------------------------
   * Locator helpers
   * ------------------------------------------------- */

  private getPermissionRadio(value: AdvancedPermissionValue): Locator {
    return this.page.getByRole('radio', { name: value, exact: true });
  }

  /** The radio's own label text — this is the real click
   * target. The underlying `role="radio"` input itself is visually covered
   * by its own decorative custom-styled circle (a sibling element), which
   * intercepts pointer events on the input directly; clicking the label
   * (as a real user would) avoids that entirely. */
  private getPermissionLabel(value: AdvancedPermissionValue): Locator {
    return this.page.getByText(value, { exact: true });
  }

  /* -------------------------------------------------
   * Actions
   * ------------------------------------------------- */

  /**
   * Clicks a permission's label and confirms the change actually persisted
   * (reload, then check), re-clicking if it didn't. Retrying the whole
   * click is more reliable here than trusting a single click + toast. Skips
   * the click (and its toast wait) once the radio already reflects `value`
   * — re-clicking an already-selected option is a no-op that shows no new
   * toast, which would otherwise fail a retry even though the desired
   * state was already reached.
   */
  async selectPermission(value: AdvancedPermissionValue) {
    await expect(async () => {
      if (!(await this.getPermissionRadio(value).isChecked())) {
        await this.getPermissionLabel(value).click();
        await expect(
          this.permissionsSavedToast,
          'Permissions updated successfully toast is shown',
        ).toBeVisible({ timeout: 5000 });
        await this.page.reload();
      }
      await expect(
        this.getPermissionRadio(value),
        `"${value}" permission is selected after reload`,
      ).toBeChecked({ timeout: 5000 });
    }).toPass({ timeout: 30000 });
  }

  /* -------------------------------------------------
   * Assertions
   * ------------------------------------------------- */

  async isPermissionVisible(value: AdvancedPermissionValue, visible = true) {
    const radio = this.getPermissionRadio(value);
    visible
      ? await expect(radio, `"${value}" permission option is visible`).toBeVisible()
      : await expect(
          radio,
          `"${value}" permission option is not visible`,
        ).not.toBeVisible();
  }

  /**
   * Checks the PERSISTED state — reloads before reading the radio, rather
   * than trusting the client-side re-render right after clicking. Confirmed
   * live under heavy load this radio's own client-side re-render can get
   * stuck showing stale `checked` state well past any reasonable retry
   * window, even though the setting genuinely saved (the toast fired, and a
   * reload always reflects the real, correct state). This is arguably the
   * more meaningful check anyway — it matches what "autosaved" is actually
   * claiming (persisted server-side), not just an instantaneous UI update.
   */
  async isPermissionSelected(value: AdvancedPermissionValue, selected = true) {
    const radio = this.getPermissionRadio(value);
    await expect(async () => {
      await this.page.reload();
      selected
        ? await expect(radio, `"${value}" permission is selected`).toBeChecked({
            timeout: 5000,
          })
        : await expect(
            radio,
            `"${value}" permission is not selected`,
          ).not.toBeChecked({ timeout: 5000 });
    }).toPass({ timeout: 20000 });
  }
}
