import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page } from '@playwright/test';
import {
  ExportSectionComponent,
  getExportSectionRoot,
} from '@pages/components/export-section-component';
import { BlurSectionComponent } from '@pages/workspace/right-sidebar/design-tab/blur-section-component';
import { LayoutContainerSectionComponent } from '@pages/workspace/right-sidebar/design-tab/layout-container-section-component';
import { LayoutItemSectionComponent } from '@pages/workspace/right-sidebar/design-tab/layout-item-section-component';
import { StrokeSectionComponent } from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';

export class DesignTabComponent extends BaseComponent {
  readonly stroke: StrokeSectionComponent;
  readonly blur: BlurSectionComponent;
  readonly layoutContainer: LayoutContainerSectionComponent;
  readonly layoutItem: LayoutItemSectionComponent;
  readonly export: ExportSectionComponent;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.stroke = new StrokeSectionComponent(
      page,
      root.getByRole('region', { name: 'Stroke' }),
    );
    this.blur = new BlurSectionComponent(
      page,
      root.getByRole('region', { name: 'Blur effects', exact: true }),
    );
    this.layoutContainer = new LayoutContainerSectionComponent(
      page,
      root.getByRole('region', { name: 'Layout container section' }),
    );
    this.layoutItem = new LayoutItemSectionComponent(
      page,
      root.getByRole('region', { name: 'Layout item section' }),
    );
    this.export = new ExportSectionComponent(page, getExportSectionRoot(root));
  }
}
