const { expect } = require('@playwright/test');
const { MainPage } = require('../workspace/main-page');

exports.LayersPanelPage = class LayersPanelPage extends MainPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.layersTab = page.getByRole('tab', { name: 'layers' });
    this.layersSidebar = page.getByTestId('layer-tree');
    this.layersRows = page.getByTestId('layer-row');
    this.sidebarLayerItem = page.locator(
      'div[class*="workspace_sidebar_layer_item__layer-row"]',
    );
    this.createdLayerOnLayersPanelNameInput = this.layersRows.getByRole('textbox');
    this.searchLayersIcon = page.locator('svg [href="#icon-search"]');
    this.searchLayersInput = page.getByPlaceholder('Search layers');
    this.searchedLayerOnLayersPanelNameText = page.locator(
      'span[class*="element-name"] >> nth=1',
    );
    this.verticalFlexLayoutIcon = page.getByTestId('icon-flex-vertical');
    this.horizontalFlexLayoutIcon = page.getByTestId('icon-flex-horizontal');
    this.focusModeDiv = page.getByText('Focus mode', { exact: true });
    this.mainComponentLayer = page
      .getByTestId('icon-component')
      .locator('//parent::div');
    this.copyComponentLayer = page
      .getByTestId('icon-component-copy')
      .locator('//parent::div');
    this.variantLayer = page.getByTestId('icon-variant').locator('//parent::div');
    this.pathComponentLayer = page.getByTestId('icon-path');
    this.createdLayerOnLayersPanelSpan = page.locator(
      'div[class*="element-list-body"] span[class*="element-name"]',
    );
    this.layerItemToggleExpand = page.locator(
      'div[class*="layers__element-list"] button[class*="sidebar_layer_item__inverse"]',
    );
    this.layerBoardToggleContentCollapse = page.locator(
      'div[class*="layers__element-list"] button[class*="toggle-content"]',
    );
    this.mainComponentLayerSelected = page
      .locator('div[class*="sidebar_layer_item__selected"]')
      .getByTestId('icon-component');
    this.mainComponentLayerToggleExpand = this.mainComponentLayer.locator(
      'xpath=./../button[contains(@class, "sidebar_layer_item__inverse")]',
    );
    this.copyComponentLayerToggleExpand = this.copyComponentLayer.locator(
      'xpath=./../button[contains(@class, "sidebar_layer_item__inverse")]',
    );
    this.mainComponentLayerToggleCollapse = this.mainComponentLayer.locator(
      'xpath=./../button[contains(@class, "toggle-content")]',
    );
    this.copyComponentLayerToggleCollapse = this.copyComponentLayer.locator(
      'xpath=./../button[contains(@class, "toggle-content")]',
    );
  }

  /**
   * This function gets the arrow button locator from a layer given its name.
   *
   * @param {*} layerName The layer name to get its arrow button
   * @returns A locator
   */
  getArrowButtonFromLayerWithName(layerName) {
    return this.layersRows.filter({ hasText: layerName }).locator('.icon-arrow');
  }

  /**
   * This function expands or collapses a layer given its name (to the opposite of its current status), by clicking on its arrow icon.
   *
   * @param {string} name The layer name to expand or collapse
   */
  async collapseOrUncollapseLayerByName(name) {
    const layerArrowButton = this.getArrowButtonFromLayerWithName(name);
    await layerArrowButton.click();
  }

  /**
   * This function get single layer rows (not blocks of children), matching the searching criteria of the two parameters. Useful to diferentiate between same-named parent and children nodes.
   *
   * @param {string|null} layerName It'll recover layers matching this name, when provided. It won't
   *  filter by name if null.
   * @param {boolean} uncollapsedChildrenOnly It will recover just the visible children (already UNCOLLAPSED)
   *  layers (when true), or also include the parent layers (when false).
   * @returns A locator to recover the layer rows matching the given parameters.
   */
  getLayerRowsBy(layerName = null, uncollapsedChildrenOnly = false) {
    let composedLocator = this.page;

    if (uncollapsedChildrenOnly === true) {
      composedLocator = composedLocator.getByTestId(/children-[0-9-a-f]+$/i);
    }

    composedLocator = composedLocator.getByTestId('layer-row');

    if (layerName !== null) {
      composedLocator = composedLocator.filter({ hasText: layerName });
    }

    return composedLocator;
  }

  /**
   * This function clicks on the first layer row matching the search criteria specified on the parameters
   *
   * @param {string} layerName It'll recover layers matching this name, when provided. It won't
   *  filter by name if null.
   * @param {boolean} uncollapsedChildrenOnly It will search just on the UNCOLLAPSED children layers
   *  (when true), or it'll also include parent layers (when false).
   */
  async selectFirstLayerByNameJustForVisibleChildren(
    layerName,
    uncollapsedChildrenOnly = true,
  ) {
    await this.getLayerRowsBy(layerName, uncollapsedChildrenOnly).first().click();
  }

  async expandGroupOnLayersTab() {
    if (!(await this.layerItemToggleExpand.isVisible())) {
      await this.layerBoardToggleContentCollapse.first().click();
      await expect(this.layerItemToggleExpand).toBeVisible();
    }
  }

  async expandBoardOnLayersTab() {
    if (!(await this.layerItemToggleExpand.first().isVisible())) {
      await this.layerBoardToggleContentCollapse.first().click();
      await expect(this.layerItemToggleExpand.first()).toBeVisible();
    }
  }

  async selectBoardChildLayer(name) {
    await this.expandBoardOnLayersTab();
    await this.clickLayerOnLayersTab(name);
  }

  async typeNameForCreatedLayer(newName) {
    await this.createdLayerOnLayersPanelNameInput.fill(newName);
  }

  async typeNameCreatedLayerAndEnter(newName) {
    await this.typeNameForCreatedLayer(newName);
    await this.clickOnEnter();
  }

  async typeNameCreatedLayerAndClickOnViewport(newName, x, y) {
    await this.typeNameForCreatedLayer(newName);
    await this.clickViewportByCoordinates(x, y, 3);
  }

  async isNotRenameLayerInputDisplayed(newName) {
    await expect(this.createdLayerOnLayersPanelNameInput).toHaveCount(0);
    await this.clickOnEnter();
  }

  async renameLayerViaRightClick(layerName) {
    const layerSel = this.layersRows.getByText(layerName);
    await layerSel.last().click({
      button: 'right',
      force: true,
    });
    await this.renameOption.locator('span').first().click();
  }

  async isLayerNameDisplayed(name) {
    await expect(this.createdLayerOnLayersPanelSpan).toHaveText(name);
  }

  async isBoardNameDisplayed(name) {
    await expect(this.createdLayerOnLayersPanelSpan).toHaveText(name);
  }

  async doubleClickLayerOnLayersTab(name) {
    const layer = this.page.locator(
      `div[class*="element-list-body"] span[class*="element-name"]:text-is("${name}") >>nth=0`,
    );
    await layer.dblclick();
  }

  async clickLayerOnLayersTab(name) {
    const layer = this.page.locator(
      `div[class*="element-list-body"] span[class*="element-name"]:text-is("${name}") >>nth=0`,
    );
    await layer.click();
  }

  async doubleClickLayerIconOnLayersTab(layer) {
    const iconSel = this.page.locator(
      `//*[text()="${layer}"]//parent::div//div[contains(@class, "icon-shape")]`,
    );
    await iconSel.dblclick();
  }

  async searchLayer(name) {
    await this.searchLayersIcon.click();
    await this.searchLayersInput.fill(name);
  }

  async isLayerSearched(name) {
    await expect(this.searchedLayerOnLayersPanelNameText).toHaveText(name);
  }

  async isVerticalFlexIconVisibleOnLayer(condition = true) {
    if (condition === true) {
      await expect(this.verticalFlexLayoutIcon).toBeVisible();
    } else {
      await expect(this.verticalFlexLayoutIcon).toBeHidden();
    }
  }

  async isHorizontalFlexIconVisibleOnLayer(condition = true) {
    if (condition === true) {
      await expect(this.horizontalFlexLayoutIcon).toBeVisible();
    } else {
      await expect(this.horizontalFlexLayoutIcon).toBeHidden();
    }
  }

  async isFocusModeOn() {
    await expect(this.focusModeDiv).toBeVisible();
  }

  async isFocusModeOff() {
    await expect(this.focusModeDiv).not.toBeVisible();
  }

  async clickOnFocusModeLabel() {
    await this.focusModeDiv.click();
  }

  async hideUnhideLayerByIconOnLayersTab(layer, hide = true) {
    const commonSel = `//*[text()="${layer}"]//parent::div[contains(@class, "element-list-body")]`;
    await this.page.locator(commonSel).hover();
    if (hide) {
      await this.page
        .locator(commonSel.concat('//button[@title="Hide"]'))
        .click({ force: true });
    } else {
      await this.page.locator(commonSel.concat('//button[@title="Show"]')).click();
    }
  }

  async isLayerPresentOnLayersTab(layer, isVisible) {
    const layerSel = this.page.locator(
      `//*[text()="${layer}"]//parent::div[contains(@class, "element-list-body")]`,
    );
    if (isVisible) {
      await expect(layerSel).toBeVisible();
    } else {
      await expect(layerSel).not.toBeVisible();
    }
  }

  async openLayersTab() {
    await this.layersTab.click();
  }

  async createComponentViaRightClickLayers(browserName = 'chrome') {
    await this.createdLayerOnLayersPanelSpan.click({
      button: 'right',
      force: true,
    });
    browserName === 'chromium'
      ? await this.createComponentMenuItem.click()
      : await this.createComponentMenuItem.locator('span').first().click();
  }

  async clickCopyComponentOnLayersTab() {
    await this.copyComponentLayer.first().click();
  }

  async clickFirstCopyComponentOnLayersTab() {
    await this.copyComponentLayer.last().click();
  }

  async clickNCopyComponentOnLayersTab(index) {
    await this.copyComponentLayer.nth(index).click();
  }

  async clickMainComponentOnLayersTab() {
    await this.mainComponentLayer.last().click();
  }

  async clickNMainComponentOnLayersTab(index) {
    await this.mainComponentLayer.nth(index).click();
  }

  async doubleClickCopyComponentOnLayersTab() {
    const layer = this.page
      .locator(`div[class*="element-list-body"] span[class*="element-name"]`)
      .first();
    await layer.dblclick();
  }

  async doubleClickMainComponentOnLayersTab() {
    const layer = this.page
      .locator(`div[class*="element-list-body"] span[class*="element-name"]`)
      .last();
    await layer.dblclick();
  }

  async restoreMainComponentViaRightClick() {
    await this.copyComponentLayer.click({ button: 'right', force: true });
    await this.restoreMainComponentMenuItem.click();
  }

  async updateMainComponentViaRightClick() {
    await this.copyComponentLayer.first().click({ button: 'right', force: true });
    await this.updateMainComponentMenuItem.click();
  }

  async expandMainComponentOnLayersTab() {
    if (!(await this.mainComponentLayerToggleExpand.first().isVisible())) {
      if (await this.mainComponentLayerToggleCollapse.first().isVisible()) {
        await this.mainComponentLayerToggleCollapse.first().click({ force: true });
        await expect(this.mainComponentLayerToggleExpand.first()).toBeVisible();
      }
    }
  }

  async expandCopyComponentOnLayersTab() {
    if (!(await this.copyComponentLayerToggleExpand.first().isVisible())) {
      if (await this.copyComponentLayerToggleCollapse.first().isVisible()) {
        await this.copyComponentLayerToggleCollapse.first().click({ force: true });
        await expect(this.copyComponentLayerToggleExpand.first()).toBeVisible();
      }
    }
  }

  async selectMainComponentChildLayer() {
    await this.expandMainComponentOnLayersTab();
    await this.clickMainComponentChildLayerOnLayersTab();
  }

  async clickMainComponentChildLayerOnLayersTab() {
    const layer = this.page
      .locator(
        '*[data-testid="layer-row"]:has([data-testid="icon-component"]) + div[data-testid*="children"]',
      )
      .first();
    await layer.click();
  }

  async selectCopyComponentChildLayer() {
    await this.expandCopyComponentOnLayersTab();
    await this.clickCopyComponentChildLayerOnLayersTab();
  }

  async clickCopyComponentChildLayerOnLayersTab() {
    const layer = this.page
      .locator(
        '*[data-testid="layer-row"]:has([data-testid="icon-component-copy"]) + div[data-testid*="children"]',
      )
      .first();
    await layer.click();
  }

  async isCopyComponentNameDisplayed(name) {
    await expect(this.createdLayerOnLayersPanelSpan.first()).toHaveText(name);
  }

  async dragAndDropComponentToBoard(name) {
    const component = this.page.locator(
      `div[class*="element-list-body"] span[class*="element-name"]:text-is("${name}") >>nth=0`,
    );
    const board = this.page.locator(
      `div[class*="element-list-body"] span[class*="element-name"]:text-is("Board") >>nth=0`,
    );
    await component.hover();
    await component.dragTo(board, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 10, y: 10 },
    });
  }

  async dragAndDropElementToElement(name, dragToName) {
    const component = this.page.locator(
      `div[class*="element-list-body"] span[class*="element-name"]:text-is("${name}") >>nth=0`,
    );
    const board = this.page.locator(
      `div[class*="element-list-body"] span[class*="element-name"]:text-is("${dragToName}") >>nth=0`,
    );
    await component.hover();
    await component.dragTo(board, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 10, y: 10 },
    });
  }

  async dragAndDropComponentToVariants(name) {
    const component = this.page.locator(
      `div[class*="element-list-body"] span[class*="element-name"]:text-is("${name}") >>nth=0`,
    );
    const variant = this.variantLayer.first();
    await component.hover();
    await component.dragTo(variant, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 5, y: 5 },
    });
  }

  async deleteMainComponentViaRightClick() {
    await this.mainComponentLayer.first().click({ button: 'right', force: true });
    await this.deleteLayerMenuOption.click();
  }

  async detachInstanceCopyComponentViaRightClick() {
    await this.copyComponentLayer.click({ button: 'right', force: true });
    await this.detachInstanceOption.click();
  }

  async copyLayerViaRightClick(layerName, browserName = 'chrome') {
    const layerSel = this.page.locator('#layers').getByText(layerName);
    await layerSel.last().click({
      button: 'right',
      force: true,
    });
    browserName === 'chromium'
      ? await this.copyOption.click()
      : await this.copyOption.locator('span').first().click();
  }

  async selectLayerByName(layerName) {
    const layerSel = this.page.locator('#layers').getByText(layerName).first();
    await layerSel.last().click();
  }

  async waitForMainComponentIsSelected() {
    await this.mainComponentLayerSelected.waitFor({ state: 'visible' });
  }

  async isMainComponentOnLayersTabVisibleWithName(name, visible = true) {
    visible
      ? await expect(
          this.mainComponentLayer.locator('//../..').getByText(name),
        ).toBeVisible()
      : await expect(
          this.mainComponentLayer.locator('//../..').getByText(name),
        ).not.toBeVisible();
  }

  async isCopyComponentOnLayersTabVisibleWithName(name, visible = true) {
    visible
      ? await expect(
          this.copyComponentLayer.locator('//../..').getByText(name),
        ).toBeVisible()
      : await expect(
          this.copyComponentLayer.locator('//../..').getByText(name),
        ).not.toBeVisible();
  }

  async isPathComponentOnLayersTabVisible() {
    await expect(this.pathComponentLayer).toBeVisible();
  }

  async isLayerWithNameSelected(name, selected = true) {
    const layerSel = await this.page.locator(
      'div[class*="sidebar_layer_item__selected"] [class*="element-name"]',
    );
    selected
      ? await expect(layerSel).toHaveText(name)
      : await expect(layerSel).not.toHaveText(name);
  }

  async checkVariantLayerCount(expectedCount) {
    await expect(this.variantLayer).toHaveCount(expectedCount);
  }

  async isVariantLayerVisible(visible = true) {
    visible
      ? await expect(this.variantLayer).toBeVisible()
      : await expect(this.variantLayer).not.toBeVisible();
  }

  async restoreVariantViaRightClick() {
    await this.copyComponentLayer.click({ button: 'right', force: true });
    await this.restoreVariantMenuItem.click();
  }

  async checkLayerNameInputValue(expectedName) {
    await expect(this.createdLayerOnLayersPanelNameInput).toHaveValue(expectedName);
  }

  async selectNCopyComponentLayers(endIndex) {
    for (let i = 0; i <= endIndex; i++) {
      if (i === 0) {
        await this.copyComponentLayer.nth(i).click();
      } else {
        await this.copyComponentLayer.nth(i).click({
          modifiers: ['Shift'],
        });
      }
    }
  }
};
