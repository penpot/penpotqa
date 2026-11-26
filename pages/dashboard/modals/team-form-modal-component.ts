import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Titles of the team form modal, for `checkTitle()`. A title that names
 * something (e.g. the organization) is a function returning it.
 */
export const TeamFormTitle = {
  addTeamToOrg: 'Add team to an organization',
  /** Also the title of TeamOrganizationModalComponent when moving a team. */
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
 * the messages that block an action on a team. It has a title and a "Close"
 * button over one of two contents:
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
 * This modal's titles and messages are the entries of `TeamFormTitle` and
 * `TeamFormMessage`. The organization picker for adding or moving a team is a
 * different modal, TeamOrganizationModalComponent.
 */
export class TeamFormModalComponent extends BaseComponent {
  readonly closeButton: Locator;
  readonly heading: Locator;
  readonly teamNameInput: Locator;

  /** @param page - A page on the dashboard. */
  constructor(page: Page) {
    // The modal has no role, accessible name or test id, and the dashboard
    // behind it has its own "Close" button, so it is found by class
    super(page, page.locator('[class*="team_form__modal-container"]'));
    this.closeButton = this.root.getByRole('button', { name: 'Close' });
    this.heading = this.root.getByRole('heading');
    this.teamNameInput = this.root.getByRole('textbox', {
      name: 'Enter new team name',
    });
  }

  /** Closes the modal with its "Close" button, without creating or adding a team. */
  async close() {
    await this.closeButton.click();
    await expect(this.root, 'Team form modal is closed').toBeHidden();
  }

  /**
   * Checks the modal's title.
   *
   * @param title - The title, an entry of `TeamFormTitle`, e.g.
   * `TeamFormTitle.createTeamInOrg(orgName)`.
   */
  async checkTitle(title: string) {
    await expect(this.heading, `Team form modal is titled "${title}"`).toHaveText(
      title,
    );
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
      ? await expect(messageText, `Team form modal shows "${message}"`).toBeVisible()
      : await expect(
          messageText,
          `Team form modal doesn't show "${message}"`,
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
