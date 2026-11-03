import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';
import {
  ExportSectionComponent,
  getExportSectionRoot,
} from '@pages/components/export-section-component';
import { StrokeSectionComponent } from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';

export class DesignTabComponent extends BaseComponent {
  readonly stroke: StrokeSectionComponent;
  readonly export: ExportSectionComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.stroke = new StrokeSectionComponent(
      page,
      root.getByRole('region', { name: 'Stroke' }),
    );
    this.export = new ExportSectionComponent(page, getExportSectionRoot(root));
  }
}
