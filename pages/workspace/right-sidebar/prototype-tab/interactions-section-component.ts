import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** Interactions section of the Prototype tab: one item per interaction of the selection. */
export class InteractionsSectionComponent extends BaseComponent {
  readonly addInteractionButton: Locator;
  readonly interactionItems: Locator;
  readonly destinationSearchbox: Locator;
  readonly animationCombobox: Locator;
  readonly animationDurationInput: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.addInteractionButton = root.getByRole('button', {
      name: 'Add interaction',
    });
    this.interactionItems = root.locator('[class*="interaction-item"]');
    // Only shown for the interaction whose options are open.
    this.destinationSearchbox = root.getByRole('searchbox', {
      name: 'Destination',
    });
    this.animationCombobox = root
      .locator('[class*="interaction-row"]')
      .filter({ hasText: 'Animation' })
      .getByRole('combobox');
    this.animationDurationInput = root.getByRole('textbox', { name: 'ms' });
  }

  async addInteraction() {
    const count = await this.interactionItems.count();
    await this.addInteractionButton.click();
    await this.checkInteractionCount(count + 1);
  }

  async removeInteraction(index: number) {
    await this.interactionItems
      .nth(index)
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async openInteractionOptions(index: number) {
    await this.interactionItems
      .nth(index)
      .getByRole('button', { name: 'Options' })
      .click();
  }

  async selectDestination(boardName: string) {
    await this.destinationSearchbox.click();
    await this.root.getByRole('option', { name: boardName, exact: true }).click();
  }

  async selectAnimation(animation: string) {
    await this.animationCombobox.click();
    await this.root.getByRole('option', { name: animation, exact: true }).click();
  }

  async setAnimationDuration(ms: number) {
    await this.animationDurationInput.fill(String(ms));
    await this.clickOnEnter();
  }

  async checkAnimation(animation: string) {
    await expect(
      this.animationCombobox,
      `Interaction animation is "${animation}"`,
    ).toHaveText(animation);
  }

  async checkInteractionCount(count: number) {
    await expect(
      this.interactionItems,
      `Interactions section lists ${count} interactions`,
    ).toHaveCount(count);
  }
}
