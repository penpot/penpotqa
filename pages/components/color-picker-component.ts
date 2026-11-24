import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** Fill types offered by the color picker's type dropdown. */
export type ColorPickerFillType = 'Solid' | 'Gradient' | 'Image';

/**
 * Color picker opened from a color bullet; it renders outside the sidebars.
 * Most picker actions still live in ColorPalettePage and move here progressively.
 */
export class ColorPickerComponent extends BaseComponent {
  readonly fillTypeDropdown: Locator;
  readonly imageUploadInput: Locator;

  constructor(page: Page) {
    super(page, page.getByTestId('colorpicker'));
    // The type dropdown is the picker's first combobox (the Linear/Radial one comes later)
    this.fillTypeDropdown = this.root.getByRole('combobox').first();
    this.imageUploadInput = this.root.getByLabel('uploader');
  }

  /**
   * Checks whether the color picker pop-up is open.
   * @param visible Expected state; default true.
   */
  async checkColorPickerIsVisible(visible = true) {
    await expect(
      this.root,
      visible ? 'Color picker is open' : 'Color picker is closed',
    ).toBeVisible({ visible });
  }

  /**
   * Switches the fill type with the dropdown at the top of the picker.
   * @param type Fill type to select.
   */
  async selectFillType(type: ColorPickerFillType) {
    await this.fillTypeDropdown.click();
    await this.page.getByRole('option').filter({ hasText: type }).click();
  }

  /**
   * Returns a stop row of the gradient stops list (no role or test id, so found by class).
   * @param index Position of the stop in the list, from 0.
   */
  getGradientStop(index: number): Locator {
    return this.root.locator('[class*="gradient-stops-entry"]').nth(index);
  }

  /**
   * Sets the color of a gradient stop from its hex input.
   * @param index Position of the stop in the list, from 0.
   * @param hex Color without '#', e.g. 'ff0000'.
   */
  async setGradientStopColor(index: number, hex: string) {
    const input = this.getGradientStop(index).getByRole('textbox', {
      name: 'Color',
    });
    await input.fill(hex);
    await input.press('Enter');
  }

  /**
   * Sets the opacity of a gradient stop.
   * @param index Position of the stop in the list, from 0.
   * @param opacity Opacity in %, e.g. '50'.
   */
  async setGradientStopOpacity(index: number, opacity: string) {
    const input = this.getGradientStop(index).getByTestId('opacity-input');
    await input.fill(opacity);
    await input.press('Enter');
  }

  /**
   * Drags a gradient stop by its reorder handle to the position of another stop.
   * @param from Position of the stop to move, from 0.
   * @param to Position it should take, from 0.
   */
  async reorderGradientStop(from: number, to: number) {
    const source = this.getGradientStop(from);
    const target = this.getGradientStop(to);
    // The handle (shown on hover) uses native HTML5 drag events, which mouse moves don't
    // fire here, so they are dispatched by hand
    await source.hover();
    const handle = source.locator('[draggable="true"]');
    const targetHandle = target.locator('[draggable="true"]');
    const box = await targetHandle.boundingBox();
    if (!box) throw new Error(`Gradient stop ${to} is not visible`);
    // Dropping on the target handle's top edge places the stop above it, bottom edge below
    const position = {
      clientX: box.x + box.width / 2,
      clientY: from > to ? box.y + 3 : box.y + box.height - 3,
    };
    const dataTransfer = await this.page.evaluateHandle(() => new DataTransfer());
    await handle.dispatchEvent('dragstart', { dataTransfer });
    await targetHandle.dispatchEvent('dragenter', { dataTransfer, ...position });
    await targetHandle.dispatchEvent('dragover', { dataTransfer, ...position });
    await targetHandle.dispatchEvent('drop', { dataTransfer, ...position });
    await handle.dispatchEvent('dragend', { dataTransfer });
  }

  /**
   * Checks the colors of the gradient stops, in list order.
   * @param hexes Expected colors without '#', lowercase, e.g. ['304d6a', 'ff0000'].
   */
  async checkGradientStopColors(hexes: string[]) {
    for (const [index, hex] of hexes.entries()) {
      await expect(
        this.getGradientStop(index).getByRole('textbox', { name: 'Color' }),
        `Gradient stop ${index + 1} is #${hex}`,
      ).toHaveValue(hex);
    }
  }

  /**
   * Checks the opacity of a gradient stop.
   * @param index Position of the stop in the list, from 0.
   * @param opacity Expected opacity in %, e.g. '50'.
   */
  async checkGradientStopOpacity(index: number, opacity: string) {
    await expect(
      this.getGradientStop(index).getByTestId('opacity-input'),
      `Gradient stop ${index + 1} opacity is ${opacity}%`,
    ).toHaveValue(opacity);
  }

  /**
   * Uploads an image for an Image fill (the picker must be in Image mode).
   * @param filePath Path of the image file, relative to the repository root.
   */
  async uploadImage(filePath: string) {
    await this.imageUploadInput.setInputFiles(filePath);
  }
}
