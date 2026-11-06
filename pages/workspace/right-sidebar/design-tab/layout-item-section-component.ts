import { BaseComponent } from '@pages/base-component';
import { expect, type Locator } from '@playwright/test';

/** Align self buttons of a flex element, by their titles. */
export const AlignSelf = {
  Start: 'Align self start',
  Center: 'Align self center',
  End: 'Align self end',
} as const;

export type AlignSelfName = (typeof AlignSelf)[keyof typeof AlignSelf];

/** Simple margin inputs of a flex element, by their accessible names. */
export const ElementMargin = {
  Vertical: 'Vertical margin',
  Horizontal: 'Horizontal margin',
} as const;

export type ElementMarginName = (typeof ElementMargin)[keyof typeof ElementMargin];

/**
 * The layout element section of the Design tab ("Flex element" / "Grid element"),
 * shown when a child of a board with layout is selected.
 *
 * Most of its locators and methods still live in DesignPanelPage and move here
 * progressively.
 */
export class LayoutItemSectionComponent extends BaseComponent {
  /**
   * Returns an align self button, found by its title.
   * @param alignment Alignment, see AlignSelf.
   */
  getAlignSelfButton(alignment: AlignSelfName): Locator {
    return this.root.getByTitle(alignment, { exact: true });
  }

  /**
   * Returns a simple margin input.
   * @param margin Margin, see ElementMargin.
   */
  getMarginInput(margin: ElementMarginName): Locator {
    return this.root.getByRole('textbox', { name: margin });
  }

  /**
   * Changes the element's own alignment.
   * @param alignment Alignment, see AlignSelf.
   */
  async changeAlignSelf(alignment: AlignSelfName) {
    await this.getAlignSelfButton(alignment).click();
  }

  /**
   * Checks which align self button is selected.
   * @param alignment Expected alignment, see AlignSelf.
   */
  async checkAlignSelf(alignment: AlignSelfName) {
    await expect(
      this.getAlignSelfButton(alignment),
      `"${alignment}" is selected`,
    ).toBeChecked();
  }

  /**
   * Types a margin value and confirms it with Enter.
   * @param margin Margin, see ElementMargin.
   * @param value Margin in px.
   */
  async changeMargin(margin: ElementMarginName, value: string) {
    const input = this.getMarginInput(margin);
    await input.clear();
    await input.pressSequentially(value);
    await input.press('Enter');
  }

  /**
   * Checks a margin value.
   * @param margin Margin, see ElementMargin.
   * @param value Expected margin in px.
   */
  async checkMargin(margin: ElementMarginName, value: string) {
    await expect(this.getMarginInput(margin), `${margin} is ${value}`).toHaveValue(
      value,
    );
  }
}
