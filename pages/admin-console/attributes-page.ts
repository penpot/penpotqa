import { BasePage } from '@pages/base-page';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Covers the Admin Console's Attributes tab
 * (/admin-console/organization/{slug}/{id}/attributes): org-level labels such as
 * "Legal" that members hold, used to narrow Advanced Permissions ("Who are" /
 * "Except"). Attributes have no Penpot API, so tests create and assign them here.
 */
export class AttributesPage extends BasePage {
  readonly newAttributeButton: Locator;

  constructor(page: Page) {
    super(page);
    // Shown twice when the org has no attributes (header and empty state):
    // take the header one, next to the section's description.
    this.newAttributeButton = page
      .getByText('Classify org members to apply fine-grained permissions')
      .locator('..')
      .getByRole('button', { name: 'New attribute' });
  }

  /**
   * Returns an attribute's row cell in the attributes table.
   * @param name Attribute name, e.g. 'Legal'.
   * @returns The cell with the attribute's name.
   */
  private getAttributeCell(name: string): Locator {
    return this.page.getByRole('cell', { name, exact: true });
  }

  /**
   * Returns the side panel that opens when an attribute's row is clicked.
   * @param name Attribute name, e.g. 'Legal'.
   * @returns The "<name> attribute" panel.
   */
  private getAttributePanel(name: string): Locator {
    return this.page.getByRole('complementary', { name: `${name} attribute` });
  }

  /**
   * Creates an attribute from "New attribute", which opens the "Create an
   * attribute" dialog with its name field focused.
   * @param name Attribute name, e.g. 'Legal'.
   */
  async createAttribute(name: string) {
    const nameField = this.page
      .getByRole('dialog', { name: 'Create an attribute' })
      .getByRole('textbox', { name: 'Attribute name' });
    // A click before the page hydrates is dropped: click again until the dialog opens
    await expect(async () => {
      if (!(await nameField.isVisible())) {
        await this.newAttributeButton.click();
      }
      await expect(nameField, 'Attribute name field is focused').toBeFocused({
        timeout: 2000,
      });
    }).toPass({ timeout: 15000 });
    await this.page.keyboard.type(name);
    await this.page.keyboard.press('Enter');
    await expect(
      this.getAttributeCell(name),
      `Attribute "${name}" is listed`,
    ).toBeVisible();
    await this.page.keyboard.press('Escape');
  }

  /**
   * Opens an attribute's panel, adds members to it from "Add people" and closes
   * the panel again.
   * @param name Attribute name, e.g. 'Legal'.
   * @param people Display names of the organization members to add.
   */
  async addPeopleToAttribute(name: string, people: string[]) {
    await this.getAttributeCell(name).click();
    const panel = this.getAttributePanel(name);
    await panel.getByRole('button', { name: 'Add people' }).click();
    const dialog = this.page.getByRole('dialog', { name: `Add people to ${name}` });
    for (const person of people) {
      // The checkbox <input> is hidden behind its styled box: click the name
      await dialog.getByText(person, { exact: true }).click();
      await expect(
        dialog.getByRole('checkbox', { name: person }),
        `"${person}" is checked in "Add people to ${name}"`,
      ).toBeChecked();
    }
    await this.page.keyboard.press('Escape');
    await expect(
      panel.getByRole('heading', { name: `People ${people.length}` }),
      `"${name}" has ${people.length} people`,
    ).toBeVisible();
    await panel.getByRole('button', { name: 'Close attribute' }).click();
  }
}
