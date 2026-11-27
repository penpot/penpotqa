import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** The logged-in user's role in a team of the "View teams" list. */
export const ViewTeamsRole = {
  Owner: 'Owner',
  NotAMember: 'Not a member',
} as const;

export type ViewTeamsRoleName = (typeof ViewTeamsRole)[keyof typeof ViewTeamsRole];

/** A team of the "View teams" list, with the logged-in user's role in it. */
export type TeamLeftWithNobody = { name: string; role: ViewTeamsRoleName };

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The 'Delete "<attribute>"?' dialog of the Attributes tab, shown when someone
 * holds the attribute or a control points at it: how many members hold it, the
 * controls that point at it, the warnings for controls that would be left with
 * nobody able to act, and the teams behind a "View teams" toggle.
 */
export class DeleteAttributeDialogComponent extends BaseComponent {
  readonly controls: Locator;
  readonly viewTeamsButton: Locator;
  readonly hideTeamsButton: Locator;
  readonly teams: Locator;
  readonly deleteButton: Locator;

  /**
   * @param page The Attributes page.
   * @param root The dialog, e.g. page.getByRole('dialog', { name: 'Delete "Compliance"?' }).
   */
  constructor(page: Page, root: Locator) {
    super(page, root);
    // Neither list has an accessible name: the test ids tell them apart
    this.controls = root
      .getByTestId('advanced-permissions-controls')
      .getByRole('listitem');
    this.teams = root.getByTestId('vacant-teams-list').getByRole('listitem');
    this.viewTeamsButton = root.getByRole('button', { name: 'View teams' });
    this.hideTeamsButton = root.getByRole('button', { name: 'Hide teams' });
    this.deleteButton = root.getByRole('button', { name: 'Delete attribute' });
  }

  /**
   * Checks the dialog says who holds the attribute and which controls point at
   * it, and that deleting can't be undone.
   * @param holdersMessage The line above the controls, e.g. '1 member holds this
   * attribute, and these controls point at it:'.
   * @param controls Controls listed under "Advanced permissions", in order.
   */
  async checkSummary(holdersMessage: string, controls: string[]) {
    await expect(
      this.root.getByText(holdersMessage, { exact: true }),
      `The dialog reads "${holdersMessage}"`,
    ).toBeVisible();
    await expect(
      this.root.getByText('Advanced permissions', { exact: true }),
      'Controls are listed under "Advanced permissions"',
    ).toBeVisible();
    await expect(
      this.controls,
      `The dialog lists the controls [${controls.join(', ')}]`,
    ).toHaveText(controls);
    await expect(
      this.root.getByText('Deleting an attribute cannot be undone.', {
        exact: true,
      }),
      'The dialog warns that deleting cannot be undone',
    ).toBeVisible();
  }

  /**
   * Checks a warning for a control that would be left with nobody able to act.
   * @param warning Its text, e.g. 'Create Teams would be left with nobody able to
   * create teams.'.
   */
  async checkWarningIsVisible(warning: string) {
    await expect(
      this.root.getByText(warning),
      `The dialog warns "${warning}"`,
    ).toBeVisible();
  }

  /**
   * Checks there's no "left with nobody" warning for a control, or none at all.
   * @param control Control name, e.g. 'Move teams across organizations'; leave it
   * out to check there's no warning for any control.
   */
  async checkWarningIsHidden(control?: string) {
    // Warnings start with the control: "Create Teams would be left with nobody…".
    // Anchored, so it doesn't match the dialog's text, which lists every control
    const warning = control
      ? this.root.getByText(
          new RegExp(`^${escapeRegExp(control)}:? .*would be left with nobody`),
        )
      : this.root.getByText('would be left with nobody');
    await expect(
      warning,
      control ? `No warning for "${control}"` : 'No control is left with nobody',
    ).toBeHidden();
  }

  /** Shows the teams left with nobody, from "View teams". */
  async openTeams() {
    await this.viewTeamsButton.click();
    await expect(
      this.hideTeamsButton,
      'The toggle reads "Hide teams"',
    ).toBeVisible();
  }

  /** Hides the teams again, from "Hide teams". */
  async closeTeams() {
    await this.hideTeamsButton.click();
    await expect(
      this.viewTeamsButton,
      'The toggle reads "View teams"',
    ).toBeVisible();
    await expect(this.teams, 'The teams list is closed').toHaveCount(0);
  }

  /**
   * Checks the teams listed after "View teams", in any order: each with the
   * logged-in user's role in it, and no other team.
   * @param teams Expected teams, e.g. [{ name: 'Team Banana', role: ViewTeamsRole.NotAMember }].
   */
  async checkTeams(teams: TeamLeftWithNobody[]) {
    await expect(this.teams, `${teams.length} teams are listed`).toHaveCount(
      teams.length,
    );
    for (const { name, role } of teams) {
      await expect(
        this.teams.filter({ hasText: name }).getByText(role, { exact: true }),
        `"${name}" is listed as "${role}"`,
      ).toBeVisible();
    }
  }

  /** Checks the dialog isn't open, as when the attribute is deleted straight away. */
  async checkIsHidden() {
    await expect(this.root, 'No delete dialog is open').toBeHidden();
  }

  /** Confirms with "Delete attribute" and waits for the dialog to close. */
  async confirm() {
    await this.deleteButton.click();
    await expect(this.root, 'The delete dialog is closed').toBeHidden();
  }
}
