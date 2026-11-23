import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The "Move teams across organizations" block of the Advanced Permissions tab:
 * its messages (who can move teams, how many members that is) and its "Who are" /
 * "Except" attribute filters. Its dropdown and the "Only between organizations
 * under this Enterprise subscription" checkbox still live in AdvancedPermissionsPage.
 */
export class MoveTeamsPermissionComponent extends BaseComponent {
  readonly exceptButton: Locator;
  readonly addAttributeButton: Locator;
  readonly messages: Locator;
  /** Options of the attribute picker, a popup rendered outside the block. */
  readonly attributeOptions: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.exceptButton = root.getByRole('button', { name: 'Except', exact: true });
    this.addAttributeButton = root.getByRole('button', { name: 'Add attribute' });
    this.messages = root.getByRole('paragraph');
    this.attributeOptions = page
      .getByRole('listbox', { name: 'Attributes' })
      .getByRole('option');
  }

  /**
   * Returns an attribute added to "Except", found by its remove button.
   * @param attribute Attribute name, e.g. 'Compliance'.
   * @returns The attribute's chip, whose text is its name and number of holders.
   */
  private getExclusion(attribute: string): Locator {
    return this.root.locator('span').filter({
      has: this.page.getByRole('button', { name: `Remove "${attribute}"` }),
    });
  }

  /**
   * Adds an attribute to "Except", clicking "Except" first if it isn't on yet. The
   * change saves with no toast.
   * @param attribute Attribute name, e.g. 'Compliance'.
   */
  async addExclusion(attribute: string) {
    // Clicks before the page settles can be dropped
    await this.page.waitForLoadState('networkidle');
    if (!(await this.addAttributeButton.isVisible())) {
      await this.exceptButton.click();
    }
    await this.addAttributeButton.click();
    await this.attributeOptions
      .filter({ hasText: new RegExp(`^${escapeRegExp(attribute)}\\s*\\d+$`) })
      .click();
    await expect(
      this.getExclusion(attribute),
      `"${attribute}" is in Move teams' Except`,
    ).toBeVisible();
  }

  /**
   * Checks an attribute in "Except" and the number of members who hold it, shown
   * next to its name (e.g. "Compliance 1").
   * @param attribute Attribute name, e.g. 'Compliance'.
   * @param holders Number of organization members who hold it.
   */
  async checkExclusion(attribute: string, holders: number) {
    await expect(
      this.getExclusion(attribute),
      `Move teams' Except shows "${attribute} ${holders}"`,
    ).toHaveText(new RegExp(`^${escapeRegExp(attribute)}\\s*${holders}$`));
  }

  /**
   * Checks the block's messages are exactly these, in order, so no other message
   * (e.g. a warning that nobody can move a team) is shown.
   * @param messages Expected messages, e.g. [MoveTeamsMessage.AlwaysPossibleFromAdminConsole, '2 members.'].
   */
  async checkMessages(messages: string[]) {
    await expect(
      this.messages,
      `Move teams shows exactly: ${messages.join(' / ')}`,
    ).toHaveText(messages);
  }
}

/** Fixed messages of the Move teams block. */
export const MoveTeamsMessage = {
  AlwaysPossibleFromAdminConsole: 'Always possible from Admin Console.',
} as const;
