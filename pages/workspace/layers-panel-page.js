const { expect } = require('@playwright/test');
const { BasePage } = require('../base-page');

exports.LayersPanelPage = class LayersPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.createdLayerOnLayersPanelNameInput = page.locator(
      'div[class*="element-list-body"] input[class*="element-name"]',
    );
    this.createdLayerOnLayersPanelNameText = page.locator(
      'div[class*="element-list-body"] span[class*="element-name"]',
    );
    this.searchLayersIcon = page.locator('svg[class="icon-search-refactor"]');
    this.searchLayersInput = page.locator('input[placeholder="Search layers"]');
    this.searchedLayerOnLayersPanelNameText = page.locator(
      'span[class*="element-name"] >> nth=1',
    );
    this.layoutIcon = page.locator('svg.icon-flex-vertical-refactor');
    this.focusModeDiv = page.locator('div.focus-mode:text-is("Focus mode")');
    this.layerItemToggleExpand = page.locator(
      'div[class*="layers__element-list"] button[class*="sidebar_layer_item__inverse"]',
    );
    this.layerBoardToggleContentCollapse = page.locator(
      'div[class*="layers__element-list"] button[class*="toggle-content"]',
    );
    this.layersTab = page.locator('div[data-id="layers"]');
    this.layersSidebar = page.locator("#layers");
  }

  async expandBoardOnLayersTab() {
    if (!(await this.layerItemToggleExpand.isVisible())) {
      await this.layerBoardToggleContentCollapse.click();
      await expect(this.layerItemToggleExpand).toBeVisible();
    }
  }

  async selectBoardChildLayer(name) {
    await this.expandBoardOnLayersTab();
    await this.clickLayerOnLayersTab(name);
  }

  async renameCreatedLayer(newName) {
    await this.createdLayerOnLayersPanelNameInput.fill(newName);
    await this.clickOnEnter();
  }

  async isLayerNameDisplayed(name) {
    await expect(this.createdLayerOnLayersPanelNameText).toHaveText(name);
  }

  async isBoardNameDisplayed(name) {
    await expect(this.createdLayerOnLayersPanelNameText).toHaveText(name);
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

  async isLayoutIconVisibleOnLayer(condition = true) {
    if (condition === true) {
      await expect(this.layoutIcon).toBeVisible();
    } else {
      await expect(this.layoutIcon).toBeHidden();
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
      await this.page
        .locator(commonSel.concat('//button[@title="Show"]'))
        .click();
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
};
