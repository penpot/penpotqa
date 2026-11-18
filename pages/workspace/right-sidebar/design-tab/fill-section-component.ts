import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Fill section of the Design tab.
 * Most of its locators and methods still live in DesignPanelPage and move here progressively.
 */
export class FillSectionComponent extends BaseComponent {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  /**
   * Checks that an image fill is visible (a row with the file name and "Image").
   * @param fileName Name of the uploaded image file, e.g. 'images.png'.
   */
  async checkImageFillIsVisible(fileName: string) {
    await expect(
      this.root.getByRole('button', { name: fileName, exact: true }),
      `Fill is the image "${fileName}"`,
    ).toBeVisible();
    await expect(
      this.root.getByText('Image', { exact: true }),
      'Fill type is Image',
    ).toBeVisible();
  }
}
