import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Titles of the team form modal, for `ModalComponent.checkTitle()`. A title
 * that names something (e.g. the organization) is a function returning it.
 */
export const TeamFormTitle = {
  addTeamToOrg: 'Add team to an organization',
  /** Also the title of SelectOrganizationModalComponent when moving a team. */
  changeTeamOrg: "Change team's organization",
  createTeam: 'Create new team',
  createTeamInOrg: (orgName: string) => `Create new team in ${orgName}`,
} as const;

/**
 * Messages the team form modal shows instead of a form, for
 * `checkMessageIsVisible()`. A message that names something (e.g. the
 * organization) is a function returning it.
 */
export const TeamFormMessage = {
  /** Create Teams is 'Only me' and the user isn't the organization owner. */
  noPermissionToAddTeams:
    "You don't have permission to add teams to any of your organizations.",
  /** The Create Teams permission doesn't include the user. */
  noPermissionToCreateTeams: (orgName: string) =>
    `You are not allowed to create teams within ${orgName} organization. If you need more information, contact the organization's owner.`,
  /** The Move teams permission doesn't let the user move the team out. */
  noPermissionToMoveTeams: (orgName: string) =>
    `You are not allowed to move teams that are part of ${orgName} organization. If you need more information, contact the organization's owner.`,
} as const;

/**
 * The team form modal: the modal Penpot uses for the create team form and for
 * the messages that block an action on a team. Under its title and "Close"
 * button (checked by ModalComponent) it shows one of two contents:
 * - The create team form ("Enter new team name"), opened from the teams
 *   dropdown: titled "Create new team in <org>", or just "Create new team"
 *   (seen too with an organization selected in the sidebar).
 * - A message instead of the form, when a permission blocks the action:
 *   - "Create new team", from the teams dropdown: the user can't create teams
 *     in the organization (Create Teams permission).
 *   - "Add team to an organization", from Team Settings: the user can't add
 *     teams to any of their organizations (Create Teams set to 'Only me').
 *   - "Change team's organization", from Team Settings (change or remove the
 *     organization): the team can't be moved out of its organization (Move
 *     teams permission).
 *
 * The title alone doesn't tell the form from a message: check the content.
 * Its titles are the entries of `TeamFormTitle` and its messages those of
 * `TeamFormMessage`. The organization picker for adding or moving a team is a
 * different modal, SelectOrganizationModalComponent.
 */
export class TeamFormModalComponent extends BaseComponent {
  readonly teamNameInput: Locator;

  /**
   * @param page - A page on the dashboard.
   * @param root - The modal portal, ModalComponent's `root`.
   */
  constructor(page: Page, root: Locator) {
    super(page, root);
    this.teamNameInput = root.getByRole('textbox', { name: 'Enter new team name' });
  }

  /**
   * Checks whether the modal shows a message instead of a form.
   *
   * @param message - The message, an entry of `TeamFormMessage`.
   * @param visible - Whether it should be shown (default: true).
   */
  async checkMessageIsVisible(message: string, visible = true) {
    const messageText = this.root.getByText(message, { exact: true });
    visible
      ? await expect(messageText, `The modal shows "${message}"`).toBeVisible()
      : await expect(
          messageText,
          `The modal doesn't show "${message}"`,
        ).toBeHidden();
  }

  /**
   * Checks whether the modal shows the create team form, by its team name field.
   *
   * @param visible - Whether it should be shown (default: true).
   */
  async checkCreateTeamFormIsVisible(visible = true) {
    visible
      ? await expect(this.teamNameInput, 'Create team form is shown').toBeVisible()
      : await expect(
          this.teamNameInput,
          'Create team form is not shown',
        ).toHaveCount(0);
  }
}
