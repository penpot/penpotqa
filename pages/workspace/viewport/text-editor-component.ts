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

  private async selectRangeFromCaret(offset: number, length: number) {
    for (let i = 0; i < offset; i++) {
      await this.page.keyboard.press('ArrowRight');
    }
    for (let i = 0; i < length; i++) {
      await this.page.keyboard.press('Shift+ArrowRight');
    }
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
