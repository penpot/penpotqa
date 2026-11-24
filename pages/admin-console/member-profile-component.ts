import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** An option of the "Assign attribute" dropdown, as the member profile lists it. */
export type AssignableAttribute = {
  name: string;
  /** Members who hold it. */
  people: number;
  description?: string;
};

/**
 * The member profile panel of the Admin Console's People tab, opened by clicking a
 * member's row (`AdminConsolePage.openMemberProfile()`): their avatar, name and email, the
 * attributes they hold, with "Assign attribute", and their teams. Assigning and
 * removing attributes saves straight away, with no confirmation.
 */
export class MemberProfileComponent extends BaseComponent {
  /** The silhouette shown for a member with no profile picture, as demo accounts are. */
  readonly avatar: Locator;
  readonly assignedAttributes: Locator;
  readonly assignAttributeButton: Locator;
  /** The "Assign attribute" dropdown, rendered outside the panel. */
  readonly assignAttributeDropdown: Locator;
  readonly searchAttributesInput: Locator;
  readonly assignableAttributes: Locator;
  readonly teamsSection: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.avatar = root.getByTestId('user-avatar-silhouette');
    const attributesSection = root.getByRole('region', { name: 'Attributes' });
    this.assignedAttributes = attributesSection
      .getByRole('list', { name: 'Assigned attributes' })
      .getByRole('listitem');
    this.assignAttributeButton = attributesSection.getByRole('button', {
      name: 'Assign attribute',
    });
    this.assignAttributeDropdown = page.getByRole('dialog', {
      name: 'Assign attribute',
    });
    this.searchAttributesInput = this.assignAttributeDropdown.getByRole('textbox', {
      name: 'Search attributes',
    });
    this.assignableAttributes = this.assignAttributeDropdown
      .getByRole('listbox', { name: 'Attributes' })
      .getByRole('option');
    this.teamsSection = root.getByRole('region', { name: 'Teams' });
  }

  /**
   * Returns an option of the open "Assign attribute" dropdown.
   * @param name Attribute name, e.g. 'Legal'.
   * @returns The option, matched by the name's exact text.
   */
  private getAssignableAttribute(name: string): Locator {
    return this.assignableAttributes.filter({
      has: this.page.getByText(name, { exact: true }),
    });
  }

  /**
   * Checks the panel shows the member's avatar, name and email, and its Attributes
   * and Teams sections.
   * @param name Member's display name, e.g. 'User2'.
   * @param email Member's email.
   */
  async checkMemberProfileIsVisible(name: string, email: string) {
    await expect(this.avatar, `Profile shows "${name}"'s avatar`).toBeVisible();
    await expect(
      this.root.getByRole('heading', { name, exact: true }),
      `Profile shows "${name}"`,
    ).toBeVisible();
    await expect(
      this.root.getByText(email, { exact: true }),
      `Profile shows "${email}"`,
    ).toBeVisible();
    await expect(
      this.assignAttributeButton,
      'Profile shows the Attributes section with "Assign attribute"',
    ).toBeVisible();
    await expect(this.teamsSection, 'Profile shows the Teams section').toBeVisible();
  }

  /**
   * Checks the attributes listed in the profile's Attributes section.
   * @param names Attribute names in the order shown; empty when the member holds none.
   */
  async checkAssignedAttributes(names: string[]) {
    await expect(
      this.assignedAttributes,
      `Profile lists the attributes [${names.join(', ')}]`,
    ).toHaveText(names);
  }

  /** Opens the "Assign attribute" dropdown, with its search field focused. */
  async openAssignAttributeDropdown() {
    await this.assignAttributeButton.click();
    await expect(
      this.searchAttributesInput,
      '"Assign attribute" dropdown is open',
    ).toBeVisible();
  }

  /** Closes the "Assign attribute" dropdown with Escape. */
  async closeAssignAttributeDropdown() {
    await this.page.keyboard.press('Escape');
    await expect(
      this.assignAttributeDropdown,
      '"Assign attribute" dropdown is closed',
    ).toBeHidden();
  }

  /**
   * Types in the dropdown's "Search attributes" field.
   * @param text Search text, e.g. 'leg'.
   */
  async searchAttribute(text: string) {
    await this.searchAttributesInput.fill(text);
  }

  /**
   * Checks the open "Assign attribute" dropdown offers exactly these options, each
   * with how many members hold it and its description, when it has one.
   * @param attributes Expected options.
   */
  async checkAssignableAttributes(attributes: AssignableAttribute[]) {
    await expect(
      this.assignableAttributes,
      `"Assign attribute" offers [${attributes.map((a) => a.name).join(', ')}]`,
    ).toHaveCount(attributes.length);
    for (const { name, people, description } of attributes) {
      const option = this.getAssignableAttribute(name);
      await expect(
        option.getByText(String(people), { exact: true }),
        `"${name}" option shows ${people} people`,
      ).toBeVisible();
      if (description) {
        await expect(
          option.getByText(description, { exact: true }),
          `"${name}" option shows its description "${description}"`,
        ).toBeVisible();
      }
    }
  }

  /**
   * Assigns an attribute from the open "Assign attribute" dropdown, which closes.
   * @param name Attribute name, e.g. 'Legal'.
   */
  async assignAttribute(name: string) {
    await this.getAssignableAttribute(name).click();
    await expect(
      this.assignAttributeDropdown,
      '"Assign attribute" dropdown is closed',
    ).toBeHidden();
  }

  /**
   * Removes an attribute with its remove button in the Attributes section.
   * @param name Attribute name, e.g. 'Legal'.
   */
  async removeAttribute(name: string) {
    await this.root.getByRole('button', { name: `Remove "${name}"` }).click();
  }
}
