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
    this.searchLayersIcon = page.locator('svg[class="icon-search"]');
    this.searchLayersInput = page.getByPlaceholder('Search layers');
    this.searchedLayerOnLayersPanelNameText = page.locator(
      'span[class*="element-name"] >> nth=1',
    );
    this.verticalFlexlayoutIcon = page.locator('svg[class="icon-flex-vertical"]');
    this.horizontalFlexlayoutIcon = page.locator(
      'svg[class="icon-flex-horizontal"]',
    );
    this.focusModeDiv = page.getByText('Focus mode', { exact: true });
    this.mainComponentLayer = page.locator(
      '//*[@class="icon-component"]//parent::div',
    );
    this.copyComponentLayer = page.locator(
      '//*[@class="icon-component-copy"]//parent::div',
    );
    this.pathComponentLayer = page.locator('//*[@class="icon-path"]//parent::div');
    this.createdLayerOnLayersPanelSpan = page.locator(
      'div[class*="element-list-body"] span[class*="element-name"]',
    );
    this.layerItemToggleExpand = page.locator(
      'div[class*="layers__element-list"] button[class*="sidebar_layer_item__inverse"]',
    );
    this.layerBoardToggleContentCollapse = page.locator(
      'div[class*="layers__element-list"] button[class*="toggle-content"]',
    );
    this.mainComponentLayerSelected = page.locator(
      'div[class*="sidebar_layer_item__selected"] svg[class="icon-component"]',
    );
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
      await expect(this.verticalFlexlayoutIcon).toBeVisible();
    } else {
      await expect(this.verticalFlexlayoutIcon).toBeHidden();
    }
  }

  async isHorizontalFlexIconVisibleOnLayer(condition = true) {
    if (condition === true) {
      await expect(this.horizontalFlexlayoutIcon).toBeVisible();
    } else {
      await expect(this.horizontalFlexlayoutIcon).toBeHidden();
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
    if (!(await this.layerItemToggleExpand.last().isVisible())) {
      await this.layerBoardToggleContentCollapse.last().click();
      await expect(this.layerItemToggleExpand.last()).toBeVisible();
    }
  }

  async selectMainComponentChildLayer() {
    await this.expandMainComponentOnLayersTab();
    await this.clickMainComponentChildLayerOnLayersTab();
  }

  async clickMainComponentChildLayerOnLayersTab() {
    const layer = this.page.locator(
      '//*[@class="icon-component"]/../../../../following-sibling::div//span[text()]',
    );
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

  async isMainComponentOnLayersTabVisibleWithName(name) {
    await expect(
      this.mainComponentLayer.locator('//../..').getByText(name),
    ).toBeVisible();
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
};
