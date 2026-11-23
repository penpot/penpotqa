import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * The text editor shown over the canvas while a text shape is edited. With the WebGL
 * renderer (v3 editor) the text lives in WASM, not in the contenteditable DOM, so
 * ranges are targeted by character offset with the keyboard.
 */
export class TextEditorComponent extends BaseComponent {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  /** Checks that the editor is open and has the keyboard focus (caret active). */
  async checkTextEditorIsFocused() {
    await expect(this.root, 'Text editor is focused').toBeFocused();
  }

  /**
   * Selects a range of the edited text by character offset from its start.
   * @param start Offset of the first selected character.
   * @param length Number of characters to select.
   */
  async selectTextRange(start: number, length: number) {
    await this.checkTextEditorIsFocused();
    await this.page.keyboard.press('ControlOrMeta+Home');
    await this.selectRangeFromCaret(start, length);
  }

  /**
   * Selects a range of the edited text counting back from its end, which takes fewer
   * key presses than selectTextRange() for a range in the second half of the text.
   * @param after Number of characters between the end of the range and the end of the text.
   * @param length Number of characters to select.
   */
  async selectTextRangeFromEnd(after: number, length: number) {
    await this.checkTextEditorIsFocused();
    await this.page.keyboard.press('ControlOrMeta+End');
    for (let i = 0; i < after; i++) {
      await this.page.keyboard.press('ArrowLeft');
    }
    for (let i = 0; i < length; i++) {
      await this.page.keyboard.press('Shift+ArrowLeft');
    }
  }

  /**
   * Selects the next range after the current selection, which saves the key presses
   * of going back to the start of the text when walking through it.
   * @param gap Characters between the end of the current selection and the range.
   * @param length Number of characters to select.
   */
  async selectNextTextRange(gap: number, length: number) {
    await this.checkTextEditorIsFocused();
    // Collapses the selection to its end
    await this.page.keyboard.press('ArrowRight');
    await this.selectRangeFromCaret(gap, length);
  }

  /**
   * Moves the caret forward from where it is, then selects the characters after it.
   * Each step is one key press, as the v3 editor has no DOM text to select.
   * @param offset Characters to move the caret right before selecting.
   * @param length Number of characters to select (Shift+ArrowRight).
   */
  private async selectRangeFromCaret(offset: number, length: number) {
    for (let i = 0; i < offset; i++) {
      await this.page.keyboard.press('ArrowRight');
    }
    for (let i = 0; i < length; i++) {
      await this.page.keyboard.press('Shift+ArrowRight');
    }
  }

  /** Selects the whole edited text with Ctrl+A. */
  async selectAll() {
    await this.checkTextEditorIsFocused();
    await this.page.keyboard.press('ControlOrMeta+A');
  }

  /** Copies the selected text with Ctrl+C. */
  async copySelection() {
    await this.page.keyboard.press('ControlOrMeta+C');
  }

  /** Pastes the clipboard at the caret with Ctrl+V. */
  async paste() {
    await this.checkTextEditorIsFocused();
    await this.page.keyboard.press('ControlOrMeta+V');
  }
}
