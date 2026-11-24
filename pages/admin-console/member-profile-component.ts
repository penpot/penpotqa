import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** Shown in an "Assign attribute" option, before the description, when nobody holds it. */
const NO_HOLDERS_HINT = 'Nobody has this attribute yet.';

/** An option of the "Assign attribute" dropdown, as the member profile lists it. */
export type AssignableAttribute = {
  name: string;
  /** Members who hold it. */
  people: number;
  description?: string;
};

/**
 * The member profile panel of the Admin Console's People tab, opened by clicking a
 * member's row (`AdminConsolePage.openMemberProfile()`): their name and email, the
 * attributes they hold, with "Assign attribute", and their teams. Assigning and
 * removing attributes saves straight away, with no confirmation.
 */
export class MemberProfileComponent extends BaseComponent {
  readonly assignedAttributes: Locator;
  readonly assignAttributeButton: Locator;
  readonly teamsSection: Locator;
  /** The "Assign attribute" dropdown, rendered outside the panel. */
  readonly assignAttributeDropdown: Locator;
  readonly searchAttributesInput: Locator;
  readonly assignableAttributes: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    const attributesSection = this.root.getByRole('region', { name: 'Attributes' });
    this.assignedAttributes = attributesSection
      .getByRole('list', { name: 'Assigned attributes' })
      .getByRole('listitem');
    this.assignAttributeButton = attributesSection.getByRole('button', {
      name: 'Assign attribute',
    });
    this.teamsSection = this.root.getByRole('region', { name: 'Teams' });
    this.assignAttributeDropdown = page.getByRole('dialog', {
      name: 'Assign attribute',
    });
    this.searchAttributesInput = this.assignAttributeDropdown.getByRole('textbox', {
      name: 'Search attributes',
    });
    this.assignableAttributes = this.assignAttributeDropdown
      .getByRole('listbox', { name: 'Attributes' })
      .getByRole('option');
  }

  /**
   * Checks the panel shows the member's name and email, and its Attributes and
   * Teams sections.
   * @param name Member's display name, e.g. 'User2'.
   * @param email Member's email.
   */
  async checkMemberProfileIsVisible(name: string, email: string) {
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
   * Checks the options of the open "Assign attribute" dropdown: each one shows its
   * name, how many members hold it, a hint when nobody does, and its description.
   * @param attributes Expected options, in the order shown.
   */
  async checkAssignableAttributes(attributes: AssignableAttribute[]) {
    const texts = attributes.map(
      ({ name, people, description }) =>
        `${name}${people}${people === 0 ? NO_HOLDERS_HINT : ''}${description ?? ''}`,
    );
    await expect(
      this.assignableAttributes,
      `"Assign attribute" offers [${attributes.map((a) => a.name).join(', ')}]`,
    ).toHaveText(texts);
  }

  /**
   * Assigns an attribute from the open "Assign attribute" dropdown, which closes.
   * @param name Attribute name, e.g. 'Legal'.
   */
  async assignAttribute(name: string) {
    await this.assignableAttributes
      .filter({ has: this.page.getByText(name, { exact: true }) })
      .click();
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

  /** Checks no confirmation dialog or message appeared after an attribute change. */
  async checkNoConfirmationIsVisible() {
    await expect(
      this.page.getByRole('dialog').or(this.page.getByRole('alertdialog')),
      'No confirmation dialog is shown',
    ).toHaveCount(0);
    // Toasts render inside the page's (otherwise empty) "log" live regions
    await expect(
      this.page
        .getByRole('alert')
        .or(this.page.getByRole('log').filter({ hasText: /\S/ })),
      'No message is shown',
    ).toHaveCount(0);
  }
}
