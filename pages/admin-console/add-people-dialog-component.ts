import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** A member as the "Add people" dialog lists them. */
export type AddPeopleMember = {
  name: string;
  email: string;
  /** Whether they already hold the attribute (their checkbox is checked). */
  selected: boolean;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The "Add people to <attribute>" dialog, opened from "Add people" in an
 * attribute's panel (`AttributePanelComponent.openAddPeople()`): a "Search org
 * members" field and every member of the organization with a checkbox. Checking
 * or unchecking a member gives or takes the attribute straight away, with
 * nothing to confirm.
 */
export class AddPeopleDialogComponent extends BaseComponent {
  readonly searchField: Locator;
  readonly members: Locator;

  /**
   * @param page - The Admin Console page.
   * @param root - The dialog, rendered outside the attribute's panel.
   */
  constructor(page: Page, root: Locator) {
    super(page, root);
    this.searchField = root.getByRole('textbox', { name: 'Search org members' });
    this.members = root.getByRole('checkbox');
  }

  /**
   * Returns a member's checkbox, whose name is the member's name and email.
   * @param name Member's display name, e.g. 'User2'.
   * @returns The checkbox.
   */
  private getMember(name: string): Locator {
    return this.root.getByRole('checkbox', {
      name: new RegExp(`^${escapeRegExp(name)} `),
    });
  }

  /**
   * Types in "Search org members", replacing what was there.
   * @param text Part of a member's name or email.
   */
  async search(text: string) {
    await this.searchField.fill(text);
  }

  /** Empties "Search org members", so every member is listed again. */
  async clearSearch() {
    await this.searchField.clear();
  }

  /**
   * Checks or unchecks a member, which gives or takes the attribute straight
   * away, and waits for the checkbox to show it.
   * @param name Member's display name, e.g. 'User2'.
   * @param selected Whether the member should end up selected (default true).
   */
  async selectMember(name: string, selected = true) {
    // The checkbox <input> is hidden behind its styled box: click the name
    await this.root.getByText(name, { exact: true }).click();
    await expect(
      this.getMember(name),
      `"${name}" is ${selected ? '' : 'not '}selected in "Add people"`,
    ).toBeChecked({ checked: selected });
  }

  /** Closes the dialog with Escape, leaving the attribute's panel open. */
  async close() {
    await this.page.keyboard.press('Escape');
    await expect(this.root, '"Add people" dialog is closed').toBeHidden();
  }

  /**
   * Checks the dialog lists exactly these members, each with their name and
   * email and selected or not, under the "Search org members" field.
   * @param members The members expected, in any order.
   */
  async checkMembers(members: AddPeopleMember[]) {
    await expect(this.searchField, '"Search org members" is visible').toBeVisible();
    await expect(
      this.members,
      `"Add people" lists ${members.length} members`,
    ).toHaveCount(members.length);
    for (const { name, email, selected } of members) {
      await expect(
        this.root.getByRole('checkbox', { name: `${name} ${email}`, exact: true }),
        `"Add people" lists "${name}" (${email}), ${selected ? '' : 'not '}selected`,
      ).toBeChecked({ checked: selected });
    }
  }
}
