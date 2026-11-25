import { VacantTeamsDialogComponent } from '@pages/admin-console/vacant-teams-dialog-component';
import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** The two parts of an attribute restriction, as their buttons read. */
export const RestrictionPart = {
  WhoAre: 'Who are',
  Except: 'Except',
} as const;

export type RestrictionPartName =
  (typeof RestrictionPart)[keyof typeof RestrictionPart];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The block of one Advanced Permissions control (e.g. Send invitations): the
 * member count under its title, its vacancy message, its option dropdown and
 * its attribute restriction ("Who are" / "Except"). Every change applies
 * straight away, with no toast: check its result (the chips, the member count)
 * instead.
 */
export class PermissionControlComponent extends BaseComponent {
  readonly attributeOptions: Locator;
  readonly attributeSearch: Locator;
  readonly dropdown: Locator;
  readonly memberCount: Locator;
  readonly vacancyMessage: Locator;
  readonly vacantTeamsDialog: VacantTeamsDialogComponent;

  /**
   * @param page - The Advanced Permissions page.
   * @param root - The control's block.
   * @param title - The control's title, e.g. 'Send invitations'; the dropdown's
   * accessible name ends with it.
   */
  constructor(page: Page, root: Locator, title: string) {
    super(page, root);
    // The attribute picker is a popup rendered outside the block.
    this.attributeOptions = page
      .getByRole('listbox', { name: 'Attributes' })
      .getByRole('option');
    this.attributeSearch = page.getByRole('textbox', { name: 'Search attributes' });
    this.dropdown = root.getByRole('button', {
      name: new RegExp(`${escapeRegExp(title)}$`),
    });
    this.memberCount = root.getByTestId('audience-line');
    this.vacancyMessage = root.getByTestId('audience-vacant-teams');
    this.vacantTeamsDialog = new VacantTeamsDialogComponent(page);
  }

  /**
   * Makes a change and waits until it's saved. The Admin Console saves a
   * moment after each change, one save after another, each sending the whole
   * permissions state: so the change is saved once a save sent after it is
   * answered. Without this, a reload or another user's check can run before
   * the change reaches the server.
   *
   * @param change - The action that changes a permission.
   */
  private async saveChange(change: () => Promise<void>) {
    const saveSent = this.page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes('/_serverFn/') &&
        (request.postData() ?? '').includes('"sendInvitations"'),
    );
    await change();
    const response = await (await saveSent).response();
    if (!response?.ok()) {
      throw new Error(`Saving the permissions failed: ${response?.status()}`);
    }
  }

  /**
   * The part of the restriction that holds the attributes of "Who are" or
   * "Except", once it's been added.
   *
   * @param part - Which part.
   * @returns The part's locator.
   */
  private getPart(part: RestrictionPartName): Locator {
    return this.root.getByTestId(
      part === RestrictionPart.WhoAre
        ? 'restriction-side-include'
        : 'restriction-side-exclude',
    );
  }

  /**
   * An attribute added to the restriction, found by its remove button.
   *
   * @param attribute - Attribute name, e.g. 'Legal'.
   * @returns The attribute's chip, whose text is its name and number of holders.
   */
  private getAttributeChip(attribute: string): Locator {
    return this.root.locator('span').filter({
      has: this.page.getByRole('button', { name: `Remove "${attribute}"` }),
    });
  }

  /**
   * Adds "Who are" or "Except" to the restriction, with no attribute yet.
   *
   * @param part - Which part to add.
   */
  async addPart(part: RestrictionPartName) {
    const partButton = this.root.getByRole('button', { name: part, exact: true });
    // Right after the page loads a click can be dropped: retry until it's added.
    await expect(async () => {
      if (await partButton.isVisible()) await partButton.click();
      await this.checkPartIsAdded(part, true, 2000);
    }).toPass({ timeout: 15000 });
  }

  /**
   * Opens the attribute picker from the "+ Add attribute" of a part that's
   * already added.
   *
   * @param part - Which part to add the attribute to.
   */
  async openAttributePicker(part: RestrictionPartName) {
    await this.getPart(part).getByRole('button', { name: 'Add attribute' }).click();
    await this.checkAttributePickerIsOpen();
  }

  /** Closes the attribute picker with Escape, without picking anything. */
  async closeAttributePicker() {
    await this.page.keyboard.press('Escape');
    await this.checkAttributePickerIsOpen(false);
  }

  /**
   * Removes "Who are" or "Except" from the restriction with its ✕.
   *
   * @param part - Which part to remove.
   */
  async removePart(part: RestrictionPartName) {
    await this.root.getByRole('button', { name: `Remove "${part}"` }).click();
    await this.checkPartIsAdded(part, false);
  }

  /**
   * Types in the attribute picker's search.
   *
   * @param text - Search text, e.g. 'Leg'.
   */
  async searchAttribute(text: string) {
    await this.attributeSearch.fill(text);
  }

  /**
   * Picks an attribute in the open picker and waits for its chip.
   *
   * @param attribute - Attribute name, e.g. 'Legal'.
   */
  async selectAttribute(attribute: string) {
    await this.saveChange(() => this.getAttributeOption(attribute).click());
    await expect(
      this.getAttributeChip(attribute),
      `"${attribute}" is added to the restriction`,
    ).toBeVisible();
  }

  /**
   * Adds an attribute to "Who are" or "Except", adding the part first if it
   * isn't there yet.
   *
   * @param part - Which part.
   * @param attribute - Attribute name, e.g. 'Legal'.
   */
  async addAttribute(part: RestrictionPartName, attribute: string) {
    if (!(await this.getPart(part).isVisible())) await this.addPart(part);
    await this.openAttributePicker(part);
    await this.selectAttribute(attribute);
  }

  /**
   * Removes an attribute from the restriction with its ✕.
   *
   * @param attribute - Attribute name, e.g. 'Legal'.
   */
  async removeAttribute(attribute: string) {
    await this.saveChange(() =>
      this.root.getByRole('button', { name: `Remove "${attribute}"` }).click(),
    );
    await expect(
      this.getAttributeChip(attribute),
      `"${attribute}" is removed from the restriction`,
    ).toBeHidden();
  }

  /**
   * Picks an option of the control's dropdown without reloading the page, so
   * the restrictions built on the other options are kept.
   *
   * @param option - The option's label, e.g. 'Team owners only'.
   */
  async selectOption(option: string) {
    await this.dropdown.click();
    await this.saveChange(() =>
      this.page.getByRole('option', { name: option, exact: true }).click(),
    );
    await this.checkSelectedOption(option);
  }

  /**
   * Opens the "View teams" dialog from the vacancy message.
   *
   * @returns The dialog.
   */
  async openVacantTeams(): Promise<VacantTeamsDialogComponent> {
    await this.vacancyMessage.click();
    await expect(
      this.vacantTeamsDialog.root,
      'The "View teams" dialog is open',
    ).toBeVisible();
    return this.vacantTeamsDialog;
  }

  /**
   * An option of the open attribute picker, whose text is the attribute's name
   * and its number of holders (e.g. "Legal 3").
   *
   * @param attribute - Attribute name.
   * @returns The option's locator.
   */
  private getAttributeOption(attribute: string): Locator {
    return this.attributeOptions.filter({
      hasText: new RegExp(`^${escapeRegExp(attribute)}\\s*\\d+`),
    });
  }

  /**
   * Checks whether "Who are" or "Except" is added (its ✕ and "+ Add attribute"
   * show) or still available to add (its button shows).
   *
   * @param part - Which part.
   * @param added - Whether it should be added (default: true).
   * @param timeout - How long to wait, in ms (default: the expect timeout).
   */
  async checkPartIsAdded(part: RestrictionPartName, added = true, timeout?: number) {
    const removeButton = this.root.getByRole('button', { name: `Remove "${part}"` });
    const partButton = this.root.getByRole('button', { name: part, exact: true });
    if (added) {
      await expect(removeButton, `"${part}" is added`).toBeVisible({ timeout });
      await expect(
        this.getPart(part).getByRole('button', { name: 'Add attribute' }),
        `"${part}" offers "+ Add attribute"`,
      ).toBeVisible({ timeout });
    } else {
      await expect(removeButton, `"${part}" is not added`).toBeHidden({ timeout });
      await expect(partButton, `"${part}" can be added`).toBeVisible({ timeout });
    }
  }

  /**
   * Checks whether the attribute picker is open.
   *
   * @param open - Whether it should be open (default: true).
   */
  async checkAttributePickerIsOpen(open = true) {
    const message = `The attribute picker is ${open ? 'open' : 'closed'}`;
    if (open) await expect(this.attributeSearch, message).toBeVisible();
    else await expect(this.attributeSearch, message).toBeHidden();
  }

  /**
   * Checks that the open picker lists an attribute with its number of holders,
   * and its description when given.
   *
   * @param attribute - Attribute name, e.g. 'Junior'.
   * @param holders - Number of organization members who hold it.
   * @param description - The description shown after them, e.g. 'Legal department'.
   */
  async checkAttributeOption(
    attribute: string,
    holders: number,
    description?: string,
  ) {
    const option = this.getAttributeOption(attribute);
    // The count can run straight into the description ("Legal2Legal department"),
    // so it ends where the digits do, not at a word boundary
    await expect(option, `The picker lists "${attribute} ${holders}"`).toHaveText(
      new RegExp(`^${escapeRegExp(attribute)}\\s*${holders}(?!\\d)`),
    );
    if (description) {
      await expect(
        option.getByText(description, { exact: true }),
        `"${attribute}" shows the description "${description}"`,
      ).toBeVisible();
    }
  }

  /**
   * Checks the open picker has no option for an attribute.
   *
   * @param attribute - Attribute name, e.g. 'Contractors'.
   */
  async checkAttributeOptionIsHidden(attribute: string) {
    await expect(
      this.getAttributeOption(attribute),
      `The picker doesn't list "${attribute}"`,
    ).toHaveCount(0);
  }

  /**
   * Checks that a part holds exactly these attributes, each with its number of
   * holders, in any order (the app lists them alphabetically).
   *
   * @param part - Which part.
   * @param attributes - Attribute name → number of holders.
   */
  async checkPartAttributes(
    part: RestrictionPartName,
    attributes: Record<string, number>,
  ) {
    const chips = this.getPart(part)
      .locator('span')
      .filter({ has: this.page.getByRole('button', { name: /^Remove "/ }) })
      .filter({ hasNotText: part });
    const expectedAttributes = Object.entries(attributes);
    await expect(
      chips,
      `"${part}" holds ${expectedAttributes.length} attributes`,
    ).toHaveCount(expectedAttributes.length);
    for (const [attribute, holders] of expectedAttributes) {
      await expect(
        chips.filter({
          hasText: new RegExp(`^${escapeRegExp(attribute)}\\s*${holders}$`),
        }),
        `"${part}" holds "${attribute} ${holders}"`,
      ).toHaveCount(1);
    }
  }

  /** Checks that "Who are" is shown above "Except", as the restriction reads. */
  async checkWhoAreIsAboveExcept() {
    const whoAre = await this.getPart(RestrictionPart.WhoAre).boundingBox();
    const except = await this.getPart(RestrictionPart.Except).boundingBox();
    if (!whoAre || !except) throw new Error('"Who are" or "Except" is not shown');
    expect(whoAre.y, '"Who are" is shown above "Except"').toBeLessThan(except.y);
  }

  /**
   * Checks the option selected in the control's dropdown.
   *
   * @param option - The option's label, e.g. 'Team owners and admins'.
   */
  async checkSelectedOption(option: string) {
    await expect(this.dropdown, `"${option}" is selected`).toHaveText(option);
  }

  /**
   * Checks the member count under the control's title.
   *
   * @param count - Its text, e.g. '4 members.', '1 member.' or 'All members.'.
   */
  async checkMemberCount(count: string) {
    await expect(this.memberCount, `The member count reads "${count}"`).toHaveText(
      count,
    );
  }

  /**
   * Checks the vacancy message under the control's title, or that there's none.
   *
   * @param message - Its text, e.g. '2 teams have no one who can invite.', or
   * `null` for no message.
   */
  async checkVacancyMessage(message: string | null) {
    if (message === null) {
      await expect(this.vacancyMessage, 'No vacancy message is shown').toBeHidden();
    } else {
      await expect(
        this.vacancyMessage,
        `The vacancy message reads "${message}"`,
      ).toHaveText(message);
    }
  }
}
