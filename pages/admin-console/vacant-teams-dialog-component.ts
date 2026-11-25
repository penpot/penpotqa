import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * The "View teams" dialog, opened from a control's vacancy message (e.g. "2
 * teams have no one who can invite."): the teams of the organization left with
 * nobody able to perform the action.
 */
export class VacantTeamsDialogComponent extends BaseComponent {
  readonly acceptButton: Locator;
  readonly description: Locator;
  readonly teams: Locator;

  /** @param page - The Admin Console page. */
  constructor(page: Page) {
    super(page, page.getByRole('dialog', { name: 'View teams' }));
    this.acceptButton = this.root.getByRole('button', { name: 'Accept' });
    this.description = this.root.getByRole('paragraph');
    this.teams = this.root.getByRole('listitem');
  }

  /** Closes the dialog with "Accept". */
  async accept() {
    await this.acceptButton.click();
    await expect(this.root, 'The "View teams" dialog closes').toBeHidden();
  }

  /**
   * Checks the dialog's description and that it lists exactly these teams, in
   * any order (each row also shows the team's initial).
   *
   * @param description - The text above the list, e.g. 'These are the 2 teams
   * with no one who can invite:'.
   * @param teamNames - Names of the teams it should list.
   */
  async checkTeams(description: string, teamNames: string[]) {
    await expect(this.description, 'The "View teams" description').toHaveText(
      description,
    );
    await expect(
      this.teams,
      `"View teams" lists ${teamNames.length} teams`,
    ).toHaveCount(teamNames.length);
    for (const teamName of teamNames) {
      await expect(
        this.teams.filter({ hasText: teamName }),
        `"View teams" lists ${teamName}`,
      ).toHaveCount(1);
    }
  }
}
