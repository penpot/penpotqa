import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

export class LayerSearchComponent extends BaseComponent {
  readonly layerTree: Locator;
  readonly searchButton: Locator;
  readonly searchInput: Locator;
  readonly closeSearchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.layerTree = page.getByTestId('layer-tree');
    this.searchButton = this.layerTree.getByRole('button', { name: 'Search' });
    this.searchInput = this.layerTree.getByRole('textbox', { name: 'Find…' });
    this.closeSearchButton = this.layerTree.getByRole('button', { name: 'Close' });
  }

  async openLayerSearchBar() {
    await this.searchButton.click();
  }

  async searchLayer(name: string) {
    await this.searchInput.fill(name);
  }

  async clearLayerSearchBar() {
    await this.searchInput.clear();
  }

  async closeLayerSearch() {
    await this.closeSearchButton.click();
    await expect(this.searchInput, 'Layer search bar should be closed').toBeHidden();
  }
}
