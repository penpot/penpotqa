import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

/** Export progress widget shown in the right sidebar header while exporting. */
export class ExportProgressComponent extends BaseComponent {
  readonly exportCompleteText: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);

    this.exportCompleteText = root.getByText('Export complete');
  }

  async checkExportComplete(count: number) {
    await expect(
      this.exportCompleteText,
      'Export complete message is visible',
    ).toBeVisible();
    await expect(
      this.root.getByText(`${count} / ${count}`),
      `All ${count} elements were exported`,
    ).toBeVisible();
  }
}
