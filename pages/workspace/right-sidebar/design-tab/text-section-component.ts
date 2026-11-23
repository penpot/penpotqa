import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** Typography values of a text selection, as the Text section shows them. */
export type TextTypography = {
  /** Font family, e.g. 'Source Sans Pro'. */
  font: string;
  /** Font variant, e.g. '400', '700', '400 Italic'. */
  style: string;
  /** Font size, e.g. '24'. */
  size: string;
  /** Text decoration; none of them when omitted. */
  decoration?: 'Underline' | 'Strikethrough';
};

/**
 * Text section of the Design tab.
 * Most of its locators and methods still live in DesignPanelPage and move here progressively.
 */
export class TextSectionComponent extends BaseComponent {
  readonly fontSelector: Locator;
  readonly fontSearchInput: Locator;
  readonly fontResults: Locator;
  readonly fontStyleSelector: Locator;
  readonly fontSizeInput: Locator;
  readonly optionsButton: Locator;
  readonly underlineCheckbox: Locator;
  readonly strikethroughCheckbox: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.fontSelector = root.getByTitle('Font Family', { exact: true });
    this.fontSearchInput = root.getByPlaceholder('Search font');
    // Custom fonts have no preview image, so results are picked by row
    this.fontResults = root.getByRole('grid').getByRole('row');
    // The combobox has no accessible name; its wrapper has the "Font Style" title
    this.fontStyleSelector = root
      .getByTitle('Font Style', { exact: true })
      .getByRole('combobox');
    this.fontSizeInput = root.getByRole('textbox', { name: 'Font Size' });
    this.optionsButton = root.getByRole('button', { name: 'Options', exact: true });
    this.underlineCheckbox = root.getByTestId('underline-text-decoration');
    this.strikethroughCheckbox = root.getByTestId('line-through-text-decoration');
  }

  /**
   * Changes the font family of the selected text from the font selector. Works for
   * Google and team (custom) fonts.
   * @param fontName Font family as listed, e.g. 'Lobster' or an uploaded font's name.
   */
  async changeFont(fontName: string) {
    await this.fontSelector.click();
    await this.fontSearchInput.fill(fontName);
    // Exact name, so "Lobster" can't pick "Lobster Two"
    await this.fontResults
      .filter({ has: this.page.getByText(fontName, { exact: true }) })
      .click();
    await expect(this.fontSelector, 'Font family').toHaveText(fontName);
  }

  /** Shows the text decoration options, hidden behind the "Options" toggle. */
  async openOptions() {
    if (!(await this.underlineCheckbox.isVisible())) {
      await this.optionsButton.click();
    }
    await expect(this.underlineCheckbox).toBeVisible();
  }

  /**
   * Checks the font family, variant, size and decoration of the selected text.
   * @param typography Expected values.
   */
  async checkTypography({ font, style, size, decoration }: TextTypography) {
    await expect(this.fontSelector, 'Font family').toHaveText(font);
    await expect(this.fontStyleSelector, 'Font variant').toHaveText(style);
    await expect(this.fontSizeInput, 'Font size').toHaveValue(size);
    await this.openOptions();
    const underline = expect(this.underlineCheckbox, 'Underline decoration');
    const strike = expect(this.strikethroughCheckbox, 'Strikethrough decoration');
    decoration === 'Underline'
      ? await underline.toBeChecked()
      : await underline.not.toBeChecked();
    decoration === 'Strikethrough'
      ? await strike.toBeChecked()
      : await strike.not.toBeChecked();
  }
}
