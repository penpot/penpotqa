import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Your account > Contact us: the form opened from the profile menu's
 * Help & Learning > Give feedback.
 */
export class GiveFeedbackSectionComponent extends BaseComponent {
  readonly typeDropdown: Locator;
  readonly subjectInput: Locator;
  readonly descriptionInput: Locator;
  readonly sendButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.typeDropdown = root.getByRole('combobox');
    this.subjectInput = root.locator('#subject');
    this.descriptionInput = root.locator('textarea');
    this.sendButton = root.getByRole('button', { name: 'Send' });
  }

  /**
   * Picks the feedback type in the dropdown (its options render in a portal).
   * @param type Option to pick, e.g. 'Idea'.
   */
  async selectType(type: string) {
    await this.typeDropdown.click();
    await this.page.getByRole('option', { name: type }).click();
  }

  /**
   * Types the subject.
   * @param text Subject text.
   */
  async fillSubject(text: string) {
    await this.subjectInput.fill(text);
  }

  /** Empties the subject. */
  async clearSubject() {
    await this.subjectInput.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Delete');
  }

  /**
   * Types the description.
   * @param text Description text.
   */
  async fillDescription(text: string) {
    await this.descriptionInput.fill(text);
  }

  /** Clicks "Send". */
  async send() {
    await this.sendButton.click();
  }

  /** Checks "Send" is disabled. */
  async checkSendButtonIsDisabled() {
    await expect(this.sendButton, '"Send" button is disabled').toBeDisabled();
  }
}
